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
} from '@mui/material';
import {
  AccountBalanceWallet,
  Launch,
  Logout,
  History,
  ContentCopy,
  Refresh,
  SportsEsports,
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
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: '"Orbitron", monospace',
        fontWeight: 700,
        fontSize: '1.5rem',
        color: 'primary.main',
        textAlign: 'center',
        borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
      }}>
        <AccountBalanceWallet sx={{ mr: 2, verticalAlign: 'middle' }} />
        WALLET MANAGEMENT
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {wallet ? (
          <Box>
            {/* Wallet Info Section */}
            <Paper sx={{ 
              p: 3, 
              mb: 3,
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 128, 0.05) 100%)',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              borderRadius: 2,
            }}>
              <Typography variant="h6" sx={{ 
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                color: 'primary.main',
                mb: 2,
              }}>
                Your Wallet
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ 
                  fontFamily: '"Roboto Mono", monospace',
                  color: 'text.secondary',
                  mr: 1,
                }}>
                  Address:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: '"Roboto Mono", monospace',
                  color: 'text.primary',
                  mr: 1,
                }}>
                  {formatAddress(wallet.publicKey)}
                </Typography>
                <IconButton size="small" onClick={handleCopyAddress}>
                  <ContentCopy sx={{ fontSize: 16, color: copiedAddress ? 'success.main' : 'text.secondary' }} />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 700,
                  color: '#00d4ff',
                  mr: 2,
                }}>
                  {wallet.balance} XLM
                </Typography>
                <IconButton onClick={refreshBalance} disabled={isLoading}>
                  <Refresh sx={{ color: 'primary.main' }} />
                </IconButton>
              </Box>

              {wallet.isTestAccount && (
                <Chip
                  label="Test Account"
                  size="small"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                    color: 'warning.main',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                  }}
                />
              )}
            </Paper>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Launch />}
                onClick={handleViewOnExplorer}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'rgba(0, 255, 255, 0.1)',
                  },
                }}
              >
                VIEW ON EXPLORER
              </Button>

              <Button
                variant="outlined"
                startIcon={<SportsEsports />}
                onClick={() => setShowTransactionHistory(true)}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  '&:hover': {
                    borderColor: 'warning.light',
                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                  },
                }}
              >
                GAMING HISTORY
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<History />}
                onClick={loadTransactions}
                disabled={loadingTransactions}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  borderColor: 'secondary.main',
                  color: 'secondary.main',
                  '&:hover': {
                    borderColor: 'secondary.light',
                    bgcolor: 'rgba(255, 0, 128, 0.1)',
                  },
                }}
              >
                REFRESH TRANSACTIONS
              </Button>

              <Button
                variant="outlined"
                startIcon={<Logout />}
                onClick={handleDisconnect}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
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
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(156, 39, 176, 0.2)' }}>
                <Typography variant="h6" sx={{ 
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  color: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <History sx={{ mr: 1 }} />
                  Recent Transactions
                  {loadingTransactions && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Typography>
              </Box>
              
              {transactions.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {transactions.map((tx, index) => (
                    <ListItem key={tx.id} divider={index < transactions.length - 1}>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
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
                              color: tx.type === 'sent' ? 'error.main' : 'success.main',
                            }}>
                              {tx.type === 'sent' ? '↗' : '↙'} {tx.amount} XLM
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {tx.date}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ 
                            fontFamily: '"Roboto Mono", monospace',
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
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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