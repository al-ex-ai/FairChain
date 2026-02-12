import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Link,
  IconButton,
  Alert,
  Button,
} from '@mui/material';
import {
  History,
  SportsEsports,
  TrendingUp,
  TrendingDown,
  Launch,
  Refresh,
  Close,
} from '@mui/icons-material';

interface TransactionHistoryProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

interface TransactionRecord {
  id: string;
  hash: string;
  type: 'game_bet' | 'win_payout' | 'loss_payout' | 'draw_return';
  amount: string;
  date: string;
  gameType: string;
  gameId: string;
  gameResult: string;
  memo: string;
  status: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  open,
  onClose,
  userId,
}) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadTransactionHistory();
    }
  }, [open, userId]);

  const loadTransactionHistory = () => {
    setIsLoading(true);
    try {
      const historyKey = `fairchain-tx-history-${userId}`;
      const storedHistory = localStorage.getItem(historyKey);
      
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setTransactions(parsedHistory);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'game_bet':
        return <SportsEsports sx={{ color: 'primary.main' }} />;
      case 'win_payout':
        return <TrendingUp sx={{ color: 'success.main' }} />;
      case 'loss_payout':
        return <TrendingDown sx={{ color: 'error.main' }} />;
      case 'draw_return':
        return <Refresh sx={{ color: 'info.main' }} />;
      default:
        return <History sx={{ color: 'text.secondary' }} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'win_payout':
        return 'success.main';
      case 'draw_return':
        return 'info.main';
      case 'loss_payout':
      case 'game_bet':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'game_bet':
        return 'Game Bet';
      case 'win_payout':
        return 'Win Payout';
      case 'loss_payout':
        return 'Loss Transfer';
      case 'draw_return':
        return 'Draw Return';
      default:
        return 'Transaction';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTransactionUrl = (hash: string) => {
    if (hash.startsWith('betting-')) {
      return null; // Internal betting transaction, no blockchain link
    }
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  };

  const getTotalWinnings = () => {
    return transactions
      .filter(tx => tx.type === 'win_payout')
      .reduce((total, tx) => total + parseFloat(tx.amount.replace('+', '')), 0)
      .toFixed(2);
  };

  const getTotalBets = () => {
    return transactions
      .filter(tx => tx.type === 'game_bet')
      .reduce((total, tx) => total + Math.abs(parseFloat(tx.amount)), 0)
      .toFixed(2);
  };

  const getGamesPlayed = () => {
    const gameIds = new Set(transactions.map(tx => tx.gameId));
    return gameIds.size;
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
        borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <History sx={{ mr: 2 }} />
          GAMING TRANSACTION HISTORY
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Statistics Summary */}
        <Paper sx={{
          p: 2,
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
            Gaming Statistics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={`Games Played: ${getGamesPlayed()}`}
              sx={{ fontFamily: '"Orbitron", monospace', fontWeight: 600 }}
            />
            <Chip
              label={`Total Bets: ${getTotalBets()} XLM`}
              sx={{ fontFamily: '"Orbitron", monospace', fontWeight: 600, color: 'error.main' }}
            />
            <Chip
              label={`Total Winnings: ${getTotalWinnings()} XLM`}
              sx={{ fontFamily: '"Orbitron", monospace', fontWeight: 600, color: 'success.main' }}
            />
            <Chip
              label={`Net: ${(parseFloat(getTotalWinnings()) - parseFloat(getTotalBets())).toFixed(2)} XLM`}
              sx={{ 
                fontFamily: '"Orbitron", monospace', 
                fontWeight: 600, 
                color: (parseFloat(getTotalWinnings()) - parseFloat(getTotalBets())) >= 0 ? 'success.main' : 'error.main'
              }}
            />
          </Box>
        </Paper>

        {/* Transaction List */}
        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading transaction history...</Typography>
          </Box>
        ) : transactions.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No gaming transactions found. Start playing some games to see your history here!
          </Alert>
        ) : (
          <Paper sx={{
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)',
            border: '1px solid rgba(0, 255, 255, 0.1)',
            borderRadius: 2,
            maxHeight: 400,
            overflow: 'auto',
          }}>
            <List>
              {transactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemIcon>
                      {getTransactionIcon(transaction.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography sx={{
                            fontFamily: '"Orbitron", monospace',
                            fontWeight: 600,
                            color: 'text.primary',
                          }}>
                            {getTransactionLabel(transaction.type)}
                          </Typography>
                          <Chip
                            label={transaction.gameType.toUpperCase()}
                            size="small"
                            sx={{ fontFamily: '"Orbitron", monospace', fontSize: '0.75rem' }}
                          />
                          <Typography sx={{
                            fontFamily: '"Orbitron", monospace',
                            fontWeight: 700,
                            color: getTransactionColor(transaction.type),
                          }}>
                            {transaction.amount} XLM
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Game ID: {transaction.gameId.substring(0, 16)}...
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Date: {formatDate(transaction.date)}
                          </Typography>
                          {transaction.memo && (
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary', 
                              fontFamily: '"Roboto Mono", monospace',
                              fontSize: '0.75rem',
                              mb: 0.5
                            }}>
                              Memo: {transaction.memo}
                            </Typography>
                          )}
                          {getTransactionUrl(transaction.hash) && (
                            <Link
                              href={getTransactionUrl(transaction.hash)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: 'primary.main',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              View on Blockchain
                              <Launch fontSize="small" />
                            </Link>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < transactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Refresh Button */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadTransactionHistory}
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
            }}
          >
            REFRESH HISTORY
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistory; 