import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Input,
  Refresh,
  Security,
  Star,
  Verified,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';

interface WalletConnectionDialogProps {
  open: boolean;
  onClose: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'available' | 'coming-soon';
  color: string;
}

const WalletConnectionDialog: React.FC<WalletConnectionDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const { connectStellar, createTestWallet, isLoading, error, wallet } = useWallet();
  
  const [step, setStep] = useState<'wallets' | 'stellar-options' | 'enter-key' | 'create-test' | 'creating-wallet' | 'wallet-success'>('wallets');
  const [publicKey, setPublicKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [createdWalletInfo, setCreatedWalletInfo] = useState<{publicKey: string; balance: string} | null>(null);
  const [countdown, setCountdown] = useState(5);

  const walletOptions: WalletOption[] = [
    {
      id: 'freighter',
      name: 'Freighter',
      icon: '🚀',
      description: 'Official Stellar wallet extension',
      status: 'coming-soon',
      color: '#00d4ff',
    },
    {
      id: 'albedo',
      name: 'Albedo',
      icon: '🌟',
      description: 'Secure web-based Stellar wallet',
      status: 'coming-soon',
      color: '#ff6b35',
    },
    {
      id: 'rabet',
      name: 'Rabet',
      icon: '🐰',
      description: 'Multi-chain wallet with Stellar support',
      status: 'coming-soon',
      color: '#7c4dff',
    },
    {
      id: 'lobstr',
      name: 'LOBSTR',
      icon: '🦞',
      description: 'Popular mobile Stellar wallet',
      status: 'coming-soon',
      color: '#2196f3',
    },
    {
      id: 'stellar',
      name: 'Stellar Network',
      icon: '✨',
      description: 'Connect directly to Stellar testnet',
      status: 'available',
      color: '#00d4ff',
    },
  ];

  const handleWalletSelect = (walletId: string) => {
    if (walletId === 'stellar') {
      setStep('stellar-options');
    }
  };

  const handlePublicKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setPublicKey(value);
    
    if (value && !value.startsWith('G')) {
      setKeyError('Stellar public keys start with "G"');
    } else if (value && value.length !== 56) {
      setKeyError('Stellar public keys are 56 characters long');
    } else {
      setKeyError('');
    }
  };

  const handleConnectPublicKey = async () => {
    if (!publicKey || keyError) return;
    
    try {
      await connectStellar(publicKey);
      onClose();
      setStep('wallets'); // Reset for next time
      setPublicKey('');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleCreateTestWallet = async () => {
    try {
      setStep('creating-wallet');

      const createdWallet = await createTestWallet();

      setCreatedWalletInfo({
        publicKey: createdWallet.publicKey,
        balance: createdWallet.balance
      });

      setStep('wallet-success');
      
      // Start countdown timer
      setCountdown(5);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            handleClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('❌ Test wallet creation failed:', error);
      // Stay on create-test step to show error
      setStep('create-test');
    }
  };

  const handleBack = () => {
    setStep('wallets');
    setPublicKey('');
    setKeyError('');
  };

  const handleClose = () => {
    onClose();
    setStep('wallets');
    setPublicKey('');
    setKeyError('');
    setCreatedWalletInfo(null);
    setCountdown(5);
  };

  const renderWalletSelection = () => (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalanceWallet 
            sx={{ 
              fontSize: 32, 
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 0 10px ${theme.palette.primary.main})`,
            }} 
          />
          <Typography 
            variant="h5"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: theme.palette.primary.main,
              textShadow: `0 0 10px ${theme.palette.primary.main}`,
            }}
            className="neon-text"
          >
            CONNECT WALLET
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              background: `linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)`,
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontFamily: '"Orbitron", monospace',
              fontWeight: 500,
            },
          }}
        >
          Choose your preferred wallet to connect to the Stellar network
        </Alert>

        <Grid container spacing={2}>
          {walletOptions.map((wallet) => (
            <Grid item xs={12} sm={6} key={wallet.id}>
              <Card
                sx={{
                  cursor: wallet.status === 'available' ? 'pointer' : 'not-allowed',
                  background: `
                    radial-gradient(circle at center, ${alpha(wallet.color, 0.1)} 0%, transparent 70%),
                    linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
                  `,
                  border: `1px solid ${alpha(wallet.color, 0.3)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  opacity: wallet.status === 'available' ? 1 : 0.6,
                  '&:hover': wallet.status === 'available' ? {
                    border: `2px solid ${wallet.color}`,
                    boxShadow: `0 0 20px ${alpha(wallet.color, 0.4)}`,
                    transform: 'translateY(-2px)',
                  } : {},
                }}
                onClick={() => wallet.status === 'available' && handleWalletSelect(wallet.id)}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    {wallet.icon}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Typography 
                      variant="h6"
                      sx={{
                        fontFamily: '"Orbitron", monospace',
                        fontWeight: 700,
                        color: wallet.color,
                      }}
                    >
                      {wallet.name}
                    </Typography>
                    {wallet.status === 'available' && (
                      <Verified sx={{ fontSize: 20, color: theme.palette.success.main }} />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {wallet.description}
                  </Typography>
                  
                  {wallet.status === 'coming-soon' && (
                    <Chip 
                      label="Coming Soon" 
                      size="small" 
                      sx={{ 
                        fontFamily: '"Orbitron", monospace',
                        fontWeight: 600,
                        background: alpha(theme.palette.warning.main, 0.2),
                        color: theme.palette.warning.main,
                      }} 
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose}
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          CANCEL
        </Button>
      </DialogActions>
    </>
  );

  const renderStellarOptions = () => (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Star 
            sx={{ 
              fontSize: 32, 
              color: '#00d4ff',
              filter: `drop-shadow(0 0 10px #00d4ff)`,
            }} 
          />
          <Typography 
            variant="h5"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: '#00d4ff',
              textShadow: `0 0 10px #00d4ff`,
            }}
            className="neon-text"
          >
            STELLAR CONNECTION
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)`,
            border: `1px solid ${alpha('#00d4ff', 0.3)}`,
            borderRadius: 2,
          }}
        >
          <strong>Stellar Testnet:</strong> Connect to Stellar testnet for development and testing
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                cursor: 'pointer',
                background: `
                  radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%),
                  linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
                `,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => setStep('enter-key')}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Input sx={{ fontSize: 40, mb: 2, color: theme.palette.primary.main }} />
                <Typography 
                  variant="h6"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  ENTER PUBLIC KEY
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect with your existing Stellar account
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                cursor: 'pointer',
                background: `
                  radial-gradient(circle at center, ${alpha(theme.palette.success.main, 0.1)} 0%, transparent 70%),
                  linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
                `,
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: `2px solid ${theme.palette.success.main}`,
                  boxShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => setStep('create-test')}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Add sx={{ fontSize: 40, mb: 2, color: theme.palette.success.main }} />
                <Typography 
                  variant="h6"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 700,
                    color: theme.palette.success.main,
                    mb: 1,
                  }}
                >
                  CREATE TEST WALLET
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate new account with 10,000 XLM
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleBack}
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          BACK
        </Button>
      </DialogActions>
    </>
  );

  const renderEnterKey = () => (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Input 
            sx={{ 
              fontSize: 32, 
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 0 10px ${theme.palette.primary.main})`,
            }} 
          />
          <Typography 
            variant="h5"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: theme.palette.primary.main,
              textShadow: `0 0 10px ${theme.palette.primary.main}`,
            }}
            className="neon-text"
          >
            ENTER PUBLIC KEY
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            borderRadius: 2,
          }}
        >
          <strong>Security Note:</strong> Only enter your public key. Never share your private key!
        </Alert>

        <TextField
          fullWidth
          label="Stellar Public Key"
          placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={publicKey}
          onChange={handlePublicKeyChange}
          error={!!keyError}
          helperText={keyError || "Enter your Stellar public key (starts with 'G')"}
          sx={{
            mb: 3,
            '& .MuiInputLabel-root': {
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
            },
            '& .MuiInputBase-input': {
              fontFamily: '"Courier New", monospace',
              fontSize: '0.9rem',
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Security sx={{ color: theme.palette.info.main, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Your private key remains secure and is never transmitted
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleBack}
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          BACK
        </Button>
        
        <Button
          onClick={handleConnectPublicKey}
          disabled={!publicKey || !!keyError || isLoading}
          variant="contained"
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontWeight: 700,
            letterSpacing: '0.02em',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              CONNECTING...
            </>
          ) : (
            'CONNECT'
          )}
        </Button>
      </DialogActions>
    </>
  );

  const renderCreateTest = () => (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Add 
            sx={{ 
              fontSize: 32, 
              color: theme.palette.success.main,
              filter: `drop-shadow(0 0 10px ${theme.palette.success.main})`,
            }} 
          />
          <Typography 
            variant="h5"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: theme.palette.success.main,
              textShadow: `0 0 10px ${theme.palette.success.main}`,
            }}
            className="neon-text"
          >
            CREATE TEST WALLET
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            background: `linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: 2,
          }}
        >
          <strong>Test Account Benefits:</strong> Get a new Stellar account funded with 10,000 XLM for testing
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              color: theme.palette.success.main,
              mb: 2,
            }}
          >
            What you'll get:
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              • New Stellar keypair (public + private keys)
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              • 10,000 XLM testnet tokens for gaming
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              • Encrypted private key storage
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              • Ready to play blockchain games
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Your private key will be encrypted and stored locally for security
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleBack}
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          BACK
        </Button>
        
        <Button
          onClick={handleCreateTestWallet}
          disabled={isLoading}
          variant="contained"
          size="large"
          sx={{
            px: 4,
            fontFamily: '"Orbitron", monospace',
            fontWeight: 700,
            letterSpacing: '0.02em',
            background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              CREATING...
            </>
          ) : (
            'CREATE WALLET'
          )}
        </Button>
      </DialogActions>
    </>
  );

  const renderCreatingWallet = () => (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Typography 
            variant="h5"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: theme.palette.primary.main,
              textShadow: `0 0 10px ${theme.palette.primary.main}`,
            }}
            className="neon-text"
          >
            CREATING WALLET...
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress 
            size={80} 
            sx={{ 
              mb: 3,
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 0 15px ${theme.palette.primary.main})`,
            }} 
          />
          
          <Typography 
            variant="h6" 
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          >
            Setting up your test wallet...
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              ⚡ Generating secure keypair...
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              🌐 Funding with 10,000 XLM...
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              🔐 Encrypting private key...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              💾 Saving wallet securely...
            </Typography>
          </Box>

          <Alert 
            severity="info" 
            sx={{ 
              background: `linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 255, 255, 0.05) 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontFamily: '"Orbitron", monospace',
                fontWeight: 500,
              },
            }}
          >
            <strong>Please wait...</strong> This process takes a few seconds to complete
          </Alert>
        </Box>
      </DialogContent>
    </>
  );

  const renderWalletSuccess = () => {
    return (
      <>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Verified 
              sx={{ 
                fontSize: 32, 
                color: theme.palette.success.main,
                filter: `drop-shadow(0 0 10px ${theme.palette.success.main})`,
              }} 
            />
            <Typography 
              variant="h5"
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 800,
                letterSpacing: '0.02em',
                color: theme.palette.success.main,
                textShadow: `0 0 10px ${theme.palette.success.main}`,
              }}
              className="neon-text"
            >
              WALLET CREATED!
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                mb: 3,
                filter: `drop-shadow(0 0 15px ${theme.palette.success.main})`,
              }}
            >
              🎉
            </Typography>
            
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                background: `linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`,
                borderRadius: 2,
              }}
            >
              <strong>Success!</strong> Your test wallet has been created and funded
            </Alert>

            {(createdWalletInfo || wallet) && (
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 700,
                    color: theme.palette.success.main,
                    mb: 2,
                  }}
                >
                  Wallet Details:
                </Typography>
                
                <Box sx={{ 
                  p: 2, 
                  background: `linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 128, 0.05) 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2,
                  mb: 2,
                }}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    Address: {(createdWalletInfo || wallet)!.publicKey.slice(0, 8)}...{(createdWalletInfo || wallet)!.publicKey.slice(-8)}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: '"Orbitron", monospace',
                      fontWeight: 700,
                      color: '#00d4ff',
                    }}
                  >
                    Balance: {(createdWalletInfo || wallet)!.balance} XLM
                  </Typography>
                </Box>
              </Box>
            )}

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Your wallet is ready for gaming! Closing automatically in {countdown} seconds...
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <CircularProgress 
                variant="determinate" 
                value={(5 - countdown) * 20} 
                size={32} 
                sx={{ color: theme.palette.success.main }} 
              />
              <Typography variant="body2" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                {countdown}s
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
            }}
          >
            START GAMING
          </Button>
        </DialogActions>
      </>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={step === 'creating-wallet' ? undefined : handleClose}
      disableEscapeKeyDown={step === 'creating-wallet'}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: `
            radial-gradient(circle at top, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 60%),
            linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 4,
          boxShadow: `0 0 50px ${alpha(theme.palette.primary.main, 0.2)}`,
        }
      }}
    >
      {step === 'wallets' && renderWalletSelection()}
      {step === 'stellar-options' && renderStellarOptions()}
      {step === 'enter-key' && renderEnterKey()}
      {step === 'create-test' && renderCreateTest()}
      {step === 'creating-wallet' && renderCreatingWallet()}
      {step === 'wallet-success' && renderWalletSuccess()}
    </Dialog>
  );
};

export default WalletConnectionDialog; 