import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Security,
  CheckCircle,
  Error as ErrorIcon,
  Timer,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import * as StellarSdk from '@stellar/stellar-sdk';
import { stellarService } from '../services/stellar.service';

interface BettingPreparationDialogProps {
  open: boolean;
  onClose: () => void;
  onGameReady: (escrowAccount: string, gameId: string) => void;
  betAmount: string;
  gameType: string;
}

interface BettingStep {
  label: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

const BettingPreparationDialog: React.FC<BettingPreparationDialogProps> = ({
  open,
  onClose,
  onGameReady,
  betAmount,
  gameType,
}) => {
  const { wallet, getWalletPrivateKey, refreshBalance } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [escrowAccount, setEscrowAccount] = useState('');
  const [gameId, setGameId] = useState('');
  const [processStarted, setProcessStarted] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [steps, setSteps] = useState<BettingStep[]>([
    {
      label: 'Creating Escrow Account',
      description: 'Setting up secure escrow account on the blockchain...',
      status: 'pending',
    },
    {
      label: 'User Confirmation',
      description: 'Awaiting your approval to proceed with betting...',
      status: 'pending',
    },
    {
      label: 'Placing Bet',
      description: 'Transferring your bet to the escrow account...',
      status: 'pending',
    },
  ]);

  const dialogContentRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (dialogContentRef.current) {
      dialogContentRef.current.scrollTo({
        top: dialogContentRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const updateStepStatus = (
    stepIndex: number,
    status: BettingStep['status'],
    errorMessage?: string
  ) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status, errorMessage } : step
      )
    );
    setTimeout(() => scrollToBottom(), 300);
  };

  const executeStep = async (stepIndex: number) => {
    updateStepStatus(stepIndex, 'processing');

    try {
      switch (stepIndex) {
        case 0: {
          // Create game with escrow via backend
          const response = await stellarService.createGame(betAmount);
          setEscrowAccount(response.data.escrowPublicKey);
          setGameId(response.data.gameId);
          break;
        }

        case 1:
          // Wait for user confirmation — don't auto-proceed
          return;

        case 2: {
          // Place bet: get unsigned XDR from backend, sign locally, submit via backend
          if (!wallet) throw new Error('Wallet not connected');

          const userPrivateKey = getWalletPrivateKey();
          if (!userPrivateKey) throw new Error('Private key not found');

          // Get unsigned transaction from backend
          const betResponse = await stellarService.placeBet(
            wallet.publicKey,
            gameId,
            betAmount
          );

          // Sign the transaction locally
          const transaction = StellarSdk.TransactionBuilder.fromXDR(
            betResponse.data.transactionXdr,
            StellarSdk.Networks.TESTNET
          );
          const keypair = StellarSdk.Keypair.fromSecret(userPrivateKey);
          transaction.sign(keypair);
          const signedXdr = transaction.toEnvelope().toXDR('base64');

          // Submit signed transaction via backend
          await stellarService.submitTransaction(signedXdr);

          // Refresh wallet balance after bet
          refreshBalance().catch(() => {});
          break;
        }
      }

      updateStepStatus(stepIndex, 'completed');

      // Auto-proceed to next step (except user confirmation)
      if (stepIndex < steps.length - 1 && stepIndex !== 1) {
        setCurrentStep(stepIndex + 1);
        setTimeout(() => executeStep(stepIndex + 1), 1000);
      } else if (stepIndex === steps.length - 1) {
        setShowSuccessNotification(true);
      }
    } catch (error) {
      console.error(`Error in step ${stepIndex}:`, error);
      updateStepStatus(
        stepIndex,
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      );
      setTimeout(() => setProcessStarted(false), 2000);
    }
  };

  const handleUserConfirm = () => {
    updateStepStatus(2, 'pending');
    updateStepStatus(1, 'completed');
    setCurrentStep(2);
    setTimeout(() => executeStep(2), 1000);
  };

  const handleUserReject = () => {
    updateStepStatus(1, 'error', 'Betting cancelled');
    setProcessStarted(false);
    onClose();
  };

  const handleGameReady = () => {
    setShowSuccessNotification(false);
    setProcessStarted(false);
    onGameReady(escrowAccount, gameId);
  };

  const handleViewOnBlockchain = () => {
    if (escrowAccount) {
      window.open(
        `https://stellar.expert/explorer/testnet/account/${escrowAccount}`,
        '_blank'
      );
    }
  };

  // Start the process when dialog opens
  useEffect(() => {
    if (open && wallet && !processStarted) {
      setCurrentStep(0);
      setEscrowAccount('');
      setGameId('');
      setShowSuccessNotification(false);
      setSteps((prev) =>
        prev.map((step) => ({ ...step, status: 'pending', errorMessage: undefined }))
      );
      setTimeout(() => executeStep(0), 1000);
      setProcessStarted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, wallet, processStarted]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setProcessStarted(false);
      setCurrentStep(0);
      setEscrowAccount('');
      setGameId('');
      setShowSuccessNotification(false);
      setSteps((prev) =>
        prev.map((step) => ({ ...step, status: 'pending', errorMessage: undefined }))
      );
    }
  }, [open]);

  const getStepIcon = (step: BettingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'processing':
        return <CircularProgress size={20} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <Timer sx={{ color: 'text.secondary' }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background:
            'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: '"Orbitron", monospace',
          fontWeight: 700,
          fontSize: '1.5rem',
          color: 'primary.main',
          textAlign: 'center',
          borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
        }}
      >
        <Security sx={{ mr: 2, verticalAlign: 'middle' }} />
        PREPARING {gameType.toUpperCase()} BETTING
      </DialogTitle>

      <DialogContent sx={{ p: 3 }} ref={dialogContentRef}>
        {/* Betting Summary */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            background:
              'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 128, 0.05) 100%)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              color: 'primary.main',
              mb: 1,
            }}
          >
            Betting Details
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<AccountBalanceWallet />}
              label={`Bet Amount: ${betAmount} XLM`}
              sx={{ fontFamily: '"Orbitron", monospace', fontWeight: 600 }}
            />
            <Chip
              label={`Game: ${gameType}`}
              sx={{ fontFamily: '"Orbitron", monospace', fontWeight: 600 }}
            />
          </Box>
        </Paper>

        {/* Progress Steps */}
        <Stepper activeStep={currentStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={getStepIcon(step)}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                    color:
                      step.status === 'completed'
                        ? 'success.main'
                        : step.status === 'error'
                        ? 'error.main'
                        : 'text.primary',
                  },
                }}
              >
                {step.label}
              </StepLabel>
              <StepContent>
                <Typography
                  sx={{
                    fontFamily: '"Roboto", sans-serif',
                    color: 'text.secondary',
                    mb: 1,
                  }}
                >
                  {step.description}
                </Typography>

                {step.status === 'processing' && index !== 1 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress sx={{ flexGrow: 1 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Processing...
                    </Typography>
                  </Box>
                )}

                {step.status === 'error' && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {step.errorMessage}
                  </Alert>
                )}

                {index === 1 && step.status === 'processing' && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <strong>Confirm:</strong> Transfer {betAmount} XLM to the
                      escrow account?
                    </Alert>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleUserConfirm}
                        sx={{
                          fontFamily: '"Orbitron", monospace',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                        }}
                      >
                        CONFIRM & PROCEED
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleUserReject}
                        sx={{
                          fontFamily: '"Orbitron", monospace',
                          fontWeight: 600,
                          color: 'error.main',
                          borderColor: 'error.main',
                        }}
                      >
                        CANCEL
                      </Button>
                    </Box>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* All Steps Completed */}
        {showSuccessNotification && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Alert
              severity="success"
              sx={{
                mb: 2,
                background:
                  'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(46, 125, 50, 0.1) 100%)',
                border: '2px solid rgba(76, 175, 80, 0.5)',
                borderRadius: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Ready to Play!
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Your bet has been secured in escrow on the Stellar blockchain.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleGameReady}
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                  }}
                >
                  START GAME
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleViewOnBlockchain}
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  }}
                >
                  VIEW ON BLOCKCHAIN
                </Button>
              </Box>
            </Alert>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BettingPreparationDialog;
