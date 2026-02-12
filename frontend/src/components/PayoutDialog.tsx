import React, { useState, useEffect } from 'react';
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
  Link,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Error as ErrorIcon,
  Launch,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { stellarService } from '../services/stellar.service';

interface PayoutDialogProps {
  open: boolean;
  onClose: () => void;
  winner: string;
  escrowAccount: string;
  betAmount: string;
  gameType: string;
  gameId: string;
}

interface PayoutStep {
  label: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  transactionHash?: string;
}

const PayoutDialog: React.FC<PayoutDialogProps> = ({
  open,
  onClose,
  winner,
  escrowAccount,
  betAmount,
  gameType,
  gameId,
}) => {
  const { wallet, refreshBalance } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [payoutCompleted, setPayoutCompleted] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [steps, setSteps] = useState<PayoutStep[]>([]);
  const [isProcessed, setIsProcessed] = useState(false);

  const isPlayerWin = winner === 'X';
  const isDraw = winner === 'draw';
  const prizeAmount = (parseFloat(betAmount) * 2).toFixed(2);

  useEffect(() => {
    if (open && !isProcessed) {
      const payoutDescription = isDraw
        ? `Returning your ${betAmount} XLM bet (draw)...`
        : isPlayerWin
        ? `Transferring ${prizeAmount} XLM prize to your wallet...`
        : `House wins - no payout needed.`;

      const initialSteps: PayoutStep[] = [
        {
          label: 'Processing Payout',
          description: payoutDescription,
          status: 'pending',
        },
        {
          label: 'Updating Balance',
          description: 'Refreshing your wallet balance...',
          status: 'pending',
        },
      ];

      setSteps(initialSteps);
      setCurrentStep(0);
      setPayoutCompleted(false);
      setTransactionHash('');
      setIsProcessed(false);

      setTimeout(() => executeStep(0), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isProcessed]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setPayoutCompleted(false);
      setCurrentStep(0);
      setTransactionHash('');
      setIsProcessed(false);
      setSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: 'pending',
          errorMessage: undefined,
          transactionHash: undefined,
        }))
      );
    }
  }, [open]);

  const updateStepStatus = (
    stepIndex: number,
    status: PayoutStep['status'],
    errorMessage?: string,
    txHash?: string
  ) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex
          ? { ...step, status, errorMessage, transactionHash: txHash }
          : step
      )
    );
  };

  const executeStep = async (stepIndex: number) => {
    updateStepStatus(stepIndex, 'processing');

    try {
      switch (stepIndex) {
        case 0: {
          if (!isPlayerWin && !isDraw) {
            // House wins — no blockchain transaction needed
            updateStepStatus(stepIndex, 'completed');
          } else {
            // Player wins or draw — backend distributes winnings from escrow
            if (!wallet) throw new Error('Wallet not connected');

            const response = await stellarService.gameEnd(
              gameId,
              wallet.publicKey
            );
            const txHash = response.data.transactionHash;
            setTransactionHash(txHash);
            updateStepStatus(stepIndex, 'completed', undefined, txHash);
          }
          break;
        }

        case 1: {
          // Refresh balance
          await refreshBalance();
          updateStepStatus(stepIndex, 'completed');
          setPayoutCompleted(true);
          setIsProcessed(true);
          break;
        }
      }

      // Auto-proceed to next step (2 steps total)
      if (stepIndex === 0) {
        setCurrentStep(1);
        setTimeout(() => executeStep(1), 1500);
      }
    } catch (error) {
      console.error(`Error in payout step ${stepIndex}:`, error);
      updateStepStatus(
        stepIndex,
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      );

      // If payout itself failed, still let user close
      if (stepIndex === 0) {
        setPayoutCompleted(true);
        setIsProcessed(true);
      }
    }
  };

  const getStepIcon = (step: PayoutStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'processing':
        return <CircularProgress size={20} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <CircularProgress size={20} sx={{ color: 'text.secondary' }} />;
    }
  };

  const getTransactionUrl = (hash: string) =>
    `https://stellar.expert/explorer/testnet/tx/${hash}`;

  return (
    <Dialog
      open={open}
      onClose={payoutCompleted ? onClose : undefined}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={!payoutCompleted}
      PaperProps={{
        sx: {
          background:
            'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${
            isDraw
              ? 'rgba(33, 150, 243, 0.2)'
              : isPlayerWin
              ? 'rgba(76, 175, 80, 0.2)'
              : 'rgba(255, 152, 0, 0.2)'
          }`,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontFamily: '"Orbitron", monospace',
          fontWeight: 700,
          fontSize: '1.8rem',
          color: isDraw
            ? 'info.main'
            : isPlayerWin
            ? 'success.main'
            : 'warning.main',
          textAlign: 'center',
          borderBottom: `1px solid ${
            isDraw
              ? 'rgba(33, 150, 243, 0.2)'
              : isPlayerWin
              ? 'rgba(76, 175, 80, 0.2)'
              : 'rgba(255, 152, 0, 0.2)'
          }`,
          py: 3,
        }}
      >
        {isDraw ? (
          <AccountBalanceWallet sx={{ mr: 2, fontSize: '2rem' }} />
        ) : isPlayerWin ? (
          <TrendingUp sx={{ mr: 2, fontSize: '2rem' }} />
        ) : (
          <TrendingDown sx={{ mr: 2, fontSize: '2rem' }} />
        )}
        {isDraw ? 'GAME TIED!' : isPlayerWin ? 'YOU WON!' : 'HOUSE WINS!'}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Game Result Summary */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${
              isDraw
                ? 'rgba(33, 150, 243, 0.1)'
                : isPlayerWin
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(255, 152, 0, 0.1)'
            } 0%, rgba(255, 0, 128, 0.05) 100%)`,
            border: `2px solid ${
              isDraw
                ? 'rgba(33, 150, 243, 0.3)'
                : isPlayerWin
                ? 'rgba(76, 175, 80, 0.3)'
                : 'rgba(255, 152, 0, 0.3)'
            }`,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 900,
              color: isDraw
                ? 'info.main'
                : isPlayerWin
                ? 'success.main'
                : 'warning.main',
              mb: 1,
            }}
          >
            {isDraw ? 'DRAW!' : isPlayerWin ? 'YOU WIN!' : 'YOU LOSE'}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              color: isDraw
                ? 'info.main'
                : isPlayerWin
                ? 'success.main'
                : 'error.main',
              mt: 2,
            }}
          >
            {isDraw
              ? `REFUND: ${betAmount} XLM`
              : isPlayerWin
              ? `PRIZE: ${prizeAmount} XLM`
              : `LOST: ${betAmount} XLM`}
          </Typography>
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

                {step.status === 'processing' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress sx={{ flexGrow: 1 }} />
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      Processing...
                    </Typography>
                  </Box>
                )}

                {step.status === 'error' && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {step.errorMessage}
                  </Alert>
                )}

                {step.status === 'completed' && step.transactionHash && (
                  <Box sx={{ mt: 1 }}>
                    <Link
                      href={getTransactionUrl(step.transactionHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      View Transaction on Stellar Explorer
                      <Launch fontSize="small" />
                    </Link>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Completion */}
        {payoutCompleted && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <strong>Payout Complete!</strong>
            </Alert>

            {transactionHash && (
              <Typography
                sx={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: '0.875rem',
                  wordBreak: 'break-all',
                  color: 'primary.main',
                  mb: 2,
                }}
              >
                TX: {transactionHash}
              </Typography>
            )}
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          {!payoutCompleted ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Processing payout...
              </Typography>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await refreshBalance();
                } catch {}
                onClose();
              }}
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4caf50, #2e7d32)',
                px: 4,
                py: 1.5,
              }}
            >
              CONTINUE PLAYING
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PayoutDialog;
