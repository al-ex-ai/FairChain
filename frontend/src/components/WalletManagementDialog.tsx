import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Launch,
  Logout,
  History,
  ContentCopy,
  Refresh,
  SportsEsports,
  Close,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import TransactionHistory from './TransactionHistory';
import * as StellarSdk from '@stellar/stellar-sdk';

interface WalletManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  from: string;
  to: string;
  date: string;
  fee: string;
}

const WalletManagementDialog: React.FC<WalletManagementDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { wallet, disconnect, refreshBalance, isLoading } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  // Load transactions when dialog opens
  useEffect(() => {
    if (open && wallet) {
      loadTransactions();
    }
  }, [open, wallet]);

  const loadTransactions = async () => {
    if (!wallet) return;

    setLoadingTransactions(true);
    try {
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      const payments = await server
        .payments()
        .forAccount(wallet.publicKey)
        .order('desc')
        .limit(10)
        .call();

      const txList: Transaction[] = [];
      for (const payment of payments.records) {
        if (payment.type === 'payment' && payment.asset_type === 'native') {
          const tx = await payment.transaction();
          txList.push({
            id: payment.id,
            type: payment.from === wallet.publicKey ? 'sent' : 'received',
            amount: payment.amount,
            from: payment.from,
            to: payment.to,
            date: new Date(payment.created_at).toLocaleDateString(),
            fee: String(tx.fee_charged || 0),
          });
        }
      }
      setTransactions(txList);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleCopyAddress = async () => {
    if (wallet?.publicKey) {
      await navigator.clipboard.writeText(wallet.publicKey);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleViewOnExplorer = () => {
    if (wallet?.publicKey) {
      window.open(`https://stellar.expert/explorer/testnet/account/${wallet.publicKey}`, '_blank');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: isMobile ? 'none' : '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: isMobile ? 0 : 3,
        },
      }}
    >
      <DialogTitle sx={{
        fontFamily: '"Orbitron", monospace',
        fontWeight: 700,
        fontSize: { xs: '0.85rem', sm: '1.5rem' },
        color: 'primary.main',
        textAlign: 'center',
        borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
        px: { xs: 2, sm: 3 },
        position: 'relative',
      }}>
        <AccountBalanceWallet sx={{ mr: 1, verticalAlign: 'middle', fontSize: { xs: 20, sm: 24 } }} />
        WALLET MANAGEMENT
        {isMobile && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'text.secondary',
            }}
          >
            <Close />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {wallet ? (
          <Box>
            {/* Wallet Info Section */}
            <Paper sx={{
              p: { xs: 2, sm: 3 },
              mb: { xs: 2, sm: 3 },
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 128, 0.05) 100%)',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              borderRadius: 2,
            }}>
              <Typography variant="h6" sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '1.25rem' },
                color: 'primary.main',
                mb: { xs: 1, sm: 2 },
              }}>
                Your Wallet
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                <Typography variant="body2" sx={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  color: 'text.secondary',
                  mr: 1,
                }}>
                  Address:
                </Typography>
                <Typography variant="body2" sx={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  color: 'text.primary',
                  mr: 0.5,
                }}>
                  {formatAddress(wallet.publicKey)}
                </Typography>
                <IconButton size="small" onClick={handleCopyAddress}>
                  <ContentCopy sx={{ fontSize: { xs: 14, sm: 16 }, color: copiedAddress ? 'success.main' : 'text.secondary' }} />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, sm: 2 } }}>
                <Typography variant="h5" sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.5rem' },
                  color: '#00d4ff',
                  mr: 1,
                }}>
                  {wallet.balance} XLM
                </Typography>
                <IconButton size={isMobile ? 'small' : 'medium'} onClick={refreshBalance} disabled={isLoading}>
                  <Refresh sx={{ color: 'primary.main', fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </Box>

              {wallet.isTestAccount && (
                <Chip
                  label="Test Account"
                  size="small"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                    fontSize: { xs: '0.65rem', sm: '0.8125rem' },
                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                    color: 'warning.main',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                  }}
                />
              )}
            </Paper>

            {/* Action Buttons */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, auto)' },
              gap: { xs: 1, sm: 2 },
              mb: { xs: 2, sm: 3 },
            }}>
              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<Launch sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                onClick={handleViewOnExplorer}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  fontSize: { xs: '0.6rem', sm: '0.8125rem' },
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'rgba(0, 255, 255, 0.1)',
                  },
                }}
              >
                EXPLORER
              </Button>

              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<SportsEsports sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                onClick={() => setShowTransactionHistory(true)}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  fontSize: { xs: '0.6rem', sm: '0.8125rem' },
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  '&:hover': {
                    borderColor: 'warning.light',
                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                  },
                }}
              >
                GAME HISTORY
              </Button>

              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<History sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                onClick={loadTransactions}
                disabled={loadingTransactions}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  fontSize: { xs: '0.6rem', sm: '0.8125rem' },
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.light',
                    bgcolor: 'rgba(255, 0, 128, 0.1)',
                  },
                }}
              >
                REFRESH TX
              </Button>

              <Button
                variant="outlined"
                size={isMobile ? 'small' : 'medium'}
                startIcon={<Logout sx={{ fontSize: { xs: 16, sm: 20 } }} />}
                onClick={handleDisconnect}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  fontSize: { xs: '0.6rem', sm: '0.8125rem' },
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    borderColor: 'error.light',
                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                  },
                }}
              >
                DISCONNECT
              </Button>
            </Box>

            {/* System Wallet Section - REMOVED - Hidden from users */}
            {/* System wallet is now managed internally for betting operations */}

            {/* Recent Transactions */}
            <Paper sx={{
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(63, 81, 181, 0.05) 100%)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              borderRadius: 2,
            }}>
              <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid rgba(156, 39, 176, 0.2)' }}>
                <Typography variant="h6" sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '1.25rem' },
                  color: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <History sx={{ mr: 1, fontSize: { xs: 18, sm: 24 } }} />
                  Recent Transactions
                  {loadingTransactions && <CircularProgress size={isMobile ? 16 : 20} sx={{ ml: 1 }} />}
                </Typography>
              </Box>

              {transactions.length > 0 ? (
                <List dense={isMobile} sx={{ maxHeight: { xs: 200, sm: 300 }, overflow: 'auto' }}>
                  {transactions.map((tx, index) => (
                    <ListItem key={tx.id} divider={index < transactions.length - 1} sx={{ px: { xs: 1, sm: 2 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 24, sm: 40 } }}>
                        <Box
                          sx={{
                            width: { xs: 6, sm: 8 },
                            height: { xs: 6, sm: 8 },
                            borderRadius: '50%',
                            bgcolor: tx.type === 'sent' ? 'error.main' : 'success.main',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{
                              fontFamily: '"Orbitron", monospace',
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.875rem' },
                              color: tx.type === 'sent' ? 'error.main' : 'success.main',
                            }}>
                              {tx.type === 'sent' ? '↗' : '↙'} {tx.amount} XLM
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                              {tx.date}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" sx={{
                            fontFamily: '"Roboto Mono", monospace',
                            fontSize: { xs: '0.6rem', sm: '0.75rem' },
                            color: 'text.secondary',
                          }}>
                            {tx.type === 'sent' ? 'To' : 'From'}: {formatAddress(tx.type === 'sent' ? tx.to : tx.from)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {loadingTransactions ? 'Loading transactions...' : 'No transactions found'}
                  </Typography>
                </Box>
              )}
            </Paper>

            {copiedAddress && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Address copied to clipboard!
              </Alert>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              No wallet connected
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Gaming Transaction History Dialog */}
      {wallet && (
        <TransactionHistory
          open={showTransactionHistory}
          onClose={() => setShowTransactionHistory(false)}
          userId={wallet.publicKey}
        />
      )}
    </Dialog>
  );
};

export default WalletManagementDialog; 