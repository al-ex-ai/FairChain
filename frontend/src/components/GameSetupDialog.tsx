import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  CircularProgress,
  Switch,
  FormControlLabel,
  Alert,
  Typography,
  Paper,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  alpha,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  SmartToy,
  Person,
  Psychology,
  SportsEsports,
  Casino,
  Security,
  AccountBalanceWallet,
  TrendingUp,
  Close,
} from '@mui/icons-material';
import BettingPreparationDialog from './BettingPreparationDialog';
import { useWallet } from '../contexts/WalletContext';

interface GameSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onStartGame: (difficulty: string, betAmount: string, escrowAccount?: string, gameId?: string) => void;
  selectedGame: string;
}

interface Blockchain {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  status: 'available' | 'coming-soon';
  description: string;
}

const GameSetupDialog: React.FC<GameSetupDialogProps> = ({
  open,
  onClose,
  onStartGame,
  selectedGame,
}) => {
  const [gameMode, setGameMode] = useState<'ai' | 'multiplayer'>('ai');
  const [difficulty, setDifficulty] = useState('medium');
  const [isBettingEnabled, setIsBettingEnabled] = useState(false);
  const [selectedBlockchain, setSelectedBlockchain] = useState('stellar');
  const [betAmount, setBetAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBettingPreparation, setShowBettingPreparation] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { wallet, isConnected } = useWallet();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bettingScrollRef = useRef<HTMLDivElement>(null);

  const blockchains: Blockchain[] = [
    {
      id: 'stellar',
      name: 'Stellar',
      symbol: 'XLM',
      icon: '🌟',
      color: '#00d4ff',
      status: 'available',
      description: 'Fast, low-cost transactions'
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: '⬩',
      color: '#627eea',
      status: 'coming-soon',
      description: 'World\'s most popular smart contract platform'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      icon: '🔷',
      color: '#8247e5',
      status: 'coming-soon',
      description: 'Ethereum scaling solution'
    },
    {
      id: 'binance',
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      icon: '🟡',
      color: '#f3ba2f',
      status: 'coming-soon',
      description: 'High performance blockchain'
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      icon: '🌅',
      color: '#9945ff',
      status: 'coming-soon',
      description: 'High-speed blockchain'
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      symbol: 'AVAX',
      icon: '🏔️',
      color: '#e84142',
      status: 'coming-soon',
      description: 'Blazingly fast consensus'
    },
    {
      id: 'flow',
      name: 'Flow',
      symbol: 'FLOW',
      icon: '🌊',
      color: '#00ef8b',
      status: 'coming-soon',
      description: 'Built for gaming and NFTs'
    },
    {
      id: 'immutablex',
      name: 'Immutable X',
      symbol: 'IMX',
      icon: '⚡',
      color: '#60ddb2',
      status: 'coming-soon',
      description: 'Layer 2 for NFT gaming'
    },
    {
      id: 'wax',
      name: 'WAX',
      symbol: 'WAXP',
      icon: '🎮',
      color: '#f79220',
      status: 'coming-soon',
      description: 'Designed for gaming'
    },
    {
      id: 'enjin',
      name: 'Enjin',
      symbol: 'ENJ',
      icon: '🎯',
      color: '#624dbf',
      status: 'coming-soon',
      description: 'Gaming ecosystem blockchain'
    },
    {
      id: 'ronin',
      name: 'Ronin',
      symbol: 'RON',
      icon: '⚔️',
      color: '#1273ea',
      status: 'coming-soon',
      description: 'Built for Axie Infinity'
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      symbol: 'ARB',
      icon: '🔵',
      color: '#28a0f0',
      status: 'coming-soon',
      description: 'Ethereum Layer 2'
    },
    {
      id: 'optimism',
      name: 'Optimism',
      symbol: 'OP',
      icon: '🔴',
      color: '#ff0420',
      status: 'coming-soon',
      description: 'Optimistic rollups'
    },
    {
      id: 'fantom',
      name: 'Fantom',
      symbol: 'FTM',
      icon: '👻',
      color: '#1969ff',
      status: 'coming-soon',
      description: 'Fast and secure'
    },
    {
      id: 'harmony',
      name: 'Harmony',
      symbol: 'ONE',
      icon: '🎵',
      color: '#00aee9',
      status: 'coming-soon',
      description: 'Sharding-based blockchain'
    },
    {
      id: 'tezos',
      name: 'Tezos',
      symbol: 'XTZ',
      icon: '🏛️',
      color: '#2c7df7',
      status: 'coming-soon',
      description: 'Self-amending blockchain'
    },
    {
      id: 'near',
      name: 'NEAR Protocol',
      symbol: 'NEAR',
      icon: '🌐',
      color: '#00c08b',
      status: 'coming-soon',
      description: 'Developer-friendly platform'
    },
    {
      id: 'cardano',
      name: 'Cardano',
      symbol: 'ADA',
      icon: '💙',
      color: '#0033ad',
      status: 'coming-soon',
      description: 'Research-driven blockchain'
    },
    {
      id: 'algorand',
      name: 'Algorand',
      symbol: 'ALGO',
      icon: '⚪',
      color: '#000000',
      status: 'coming-soon',
      description: 'Pure proof-of-stake'
    },
    {
      id: 'cosmos',
      name: 'Cosmos',
      symbol: 'ATOM',
      icon: '🌌',
      color: '#2e3148',
      status: 'coming-soon',
      description: 'Internet of blockchains'
    },
    {
      id: 'cronos',
      name: 'Cronos',
      symbol: 'CRO',
      icon: '💎',
      color: '#103f68',
      status: 'coming-soon',
      description: 'Crypto.com blockchain'
    }
  ];

  const isStartGameDisabled = () => {
    if (!isBettingEnabled) {
      return false; // Enable button if betting is not enabled
    }
    
    // If betting is enabled, check for valid bet amount
    return !betAmount || parseFloat(betAmount) <= 0;
  };

  const handleStartGame = async () => {
    setError(null);
    setIsProcessing(true);
    
    try {
      const finalBetAmount = isBettingEnabled ? betAmount : '0';
      
      if (isBettingEnabled && betAmount && parseFloat(betAmount) > 0) {
        // Show betting preparation dialog for real betting
        setShowBettingPreparation(true);
        setIsProcessing(false);
        return;
      }

      // For non-betting games, start immediately
      onStartGame(difficulty, finalBetAmount);
      
    } catch (error) {
      console.error('Error starting game:', error);
      setError('Failed to start game. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBettingReady = (escrowAccount: string, gameId: string) => {
    setShowBettingPreparation(false);
    onStartGame(difficulty, betAmount, escrowAccount, gameId);
  };

  const handleBettingCancelled = () => {
    setShowBettingPreparation(false);
    setIsProcessing(false);
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetAmount(value);
    if (value && parseFloat(value) <= 0) {
      setError('Bet amount must be greater than 0');
    } else {
      setError(null);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'hard': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };

  const getSelectedBlockchain = () => {
    return blockchains.find(chain => chain.id === selectedBlockchain);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isBettingEnabled]);

  useEffect(() => {
    if (isBettingEnabled && bettingScrollRef.current) {
      setTimeout(() => {
        bettingScrollRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [isBettingEnabled]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          background: `
            radial-gradient(circle at top, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 60%),
            linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: isMobile ? 'none' : `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: isMobile ? 0 : 4,
          boxShadow: `0 0 50px ${alpha(theme.palette.primary.main, 0.2)}`,
        }
      }}
      className="cyber-border"
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <SportsEsports
            sx={{
              fontSize: { xs: 24, sm: 32 },
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
              fontSize: { xs: '1rem', sm: '1.5rem' },
              color: theme.palette.primary.main,
              textShadow: `0 0 10px ${theme.palette.primary.main}`,
            }}
            className="neon-text"
          >
            GAME SETUP
          </Typography>
        </Box>
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
      
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              background: `linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)`,
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Demo Mode Notice */}
        <Alert
          severity="info"
          sx={{
            mb: 2,
            background: `linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontFamily: '"Orbitron", monospace',
              fontWeight: 500,
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
            },
          }}
        >
          <strong>Demo Mode:</strong> No real crypto transactions are made.
        </Alert>
        
        <Box sx={{ mt: 1 }}>
          {/* Game Mode Selection */}
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 2,
              background: `
                radial-gradient(circle at center, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%),
                linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
              `,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 700,
                letterSpacing: '0.02em',
                fontSize: { xs: '0.8rem', sm: '1.25rem' },
                color: theme.palette.secondary.main,
                mb: { xs: 1, sm: 2 },
              }}
            >
              CHOOSE YOUR OPPONENT
            </Typography>

            <ToggleButtonGroup
              value={gameMode}
              exclusive
              onChange={(e, newMode) => newMode && setGameMode(newMode)}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2,
                  p: { xs: 1, sm: 2 },
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.6)}`,
                    boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                  '&.Mui-selected': {
                    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                    border: `2px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                    color: theme.palette.primary.main,
                  },
                },
              }}
            >
              <ToggleButton value="ai">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <SmartToy sx={{ fontSize: { xs: 24, sm: 32 } }} />
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    AI OPPONENT
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Challenge the machine
                  </Typography>
                </Box>
              </ToggleButton>

              <ToggleButton value="multiplayer" disabled>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Person sx={{ fontSize: { xs: 24, sm: 32 } }} />
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    REAL PLAYER
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Coming Soon
                  </Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Paper>

          {/* AI Difficulty Selection */}
          {gameMode === 'ai' && (
            <Paper
              elevation={6}
              sx={{
                p: { xs: 2, sm: 3 },
                mb: 2,
                background: `
                  radial-gradient(circle at center, ${alpha(getDifficultyColor(difficulty), 0.1)} 0%, transparent 70%),
                  linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
                `,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(getDifficultyColor(difficulty), 0.3)}`,
                borderRadius: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1, sm: 2 } }}>
                <Psychology
                  sx={{
                    fontSize: { xs: 22, sm: 28 },
                    color: getDifficultyColor(difficulty),
                    filter: `drop-shadow(0 0 10px ${getDifficultyColor(difficulty)})`,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    fontSize: { xs: '0.8rem', sm: '1.25rem' },
                    color: getDifficultyColor(difficulty),
                  }}
                >
                  AI DIFFICULTY
                </Typography>
              </Box>
              
              <FormControl fullWidth>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    '& .MuiSelect-select': {
                      color: getDifficultyColor(difficulty),
                    },
                  }}
                >
                  <MenuItem value="easy" sx={{ fontFamily: '"Orbitron", monospace' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                      EASY - Beginner Friendly
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium" sx={{ fontFamily: '"Orbitron", monospace' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.warning.main }} />
                      MEDIUM - Balanced Challenge
                    </Box>
                  </MenuItem>
                  <MenuItem value="hard" sx={{ fontFamily: '"Orbitron", monospace' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                      HARD - Expert Level
                    </Box>
                  </MenuItem>
            </Select>
          </FormControl>
            </Paper>
          )}

          {/* Betting Options */}
          <Paper
            elevation={6}
            sx={{
              p: { xs: 2, sm: 3 },
              background: `
                radial-gradient(circle at center, ${alpha(theme.palette.warning.main, 0.1)} 0%, transparent 70%),
                linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
              `,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              borderRadius: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1, sm: 2 } }}>
              <Casino
                sx={{
                  fontSize: { xs: 22, sm: 28 },
                  color: theme.palette.warning.main,
                  filter: `drop-shadow(0 0 10px ${theme.palette.warning.main})`,
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  fontSize: { xs: '0.8rem', sm: '1.25rem' },
                  color: theme.palette.warning.main,
                }}
              >
                DEMO BETTING
              </Typography>
            </Box>

          <FormControlLabel
            control={
              <Switch
                checked={isBettingEnabled}
                onChange={(e) => {
                  setIsBettingEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setBetAmount('');
                    setError(null);
                  }
                }}
                  sx={{
                    '& .MuiSwitch-thumb': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    },
                  }}
                />
              }
              label={
                <Typography 
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                  }}
                >
                  ENABLE DEMO BETTING
                </Typography>
              }
              sx={{ mb: 2 }}
          />

          {isBettingEnabled && (
            <Box ref={bettingScrollRef}>
              {/* Blockchain Selection */}
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  fontSize: { xs: '0.75rem', sm: '1.25rem' },
                  color: theme.palette.info.main,
                  mb: { xs: 1, sm: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <AccountBalanceWallet sx={{ fontSize: { xs: 18, sm: 24 } }} />
                SELECT BLOCKCHAIN
              </Typography>
              
              <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2 }}>
                {blockchains.slice(0, isMobile ? 4 : 8).map((blockchain) => (
                  <Grid item xs={3} sm={4} md={3} key={blockchain.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        background: selectedBlockchain === blockchain.id ? `
                          radial-gradient(circle at center, ${alpha(blockchain.color, 0.2)} 0%, transparent 70%),
                          linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
                        ` : `
                          linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)
                        `,
                        border: selectedBlockchain === blockchain.id ?
                          `2px solid ${blockchain.color}` :
                          `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          border: `2px solid ${blockchain.color}`,
                          boxShadow: `0 0 15px ${alpha(blockchain.color, 0.4)}`,
                        },
                      }}
                      onClick={() => setSelectedBlockchain(blockchain.id)}
                    >
                      <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } }, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: { xs: '1.2rem', sm: '2rem' }, mb: 0.5 }}>
                          {blockchain.icon}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: '"Orbitron", monospace',
                            fontWeight: 600,
                            fontSize: { xs: '0.5rem', sm: '0.75rem' },
                            color: blockchain.color,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {blockchain.symbol}
                        </Typography>
                        {blockchain.status === 'coming-soon' && !isMobile && (
                          <Chip
                            label="Demo"
                            size="small"
                            sx={{
                              fontSize: '0.55rem',
                              height: 18,
                              fontFamily: '"Orbitron", monospace',
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Show more blockchains */}
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  mb: 2,
                  background: `linear-gradient(135deg, rgba(26, 26, 46, 0.7) 0%, rgba(22, 33, 62, 0.7) 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 500,
                    fontSize: { xs: '0.6rem', sm: '0.75rem' },
                    textAlign: 'center',
                    mb: 1,
                  }}
                >
                  MORE BLOCKCHAINS (DEMO)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                  {blockchains.slice(isMobile ? 4 : 8).map((blockchain) => (
                    <Chip
                      key={blockchain.id}
                      label={`${blockchain.icon} ${blockchain.name}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontFamily: '"Orbitron", monospace',
                        fontWeight: 500,
                        fontSize: { xs: '0.55rem', sm: '0.7rem' },
                        height: { xs: 24, sm: 32 },
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* Selected Blockchain Info */}
              {getSelectedBlockchain() && (
                <Alert 
                  severity="success"
                  sx={{
                    mb: 2,
                    background: `linear-gradient(135deg, ${alpha(getSelectedBlockchain()?.color || theme.palette.info.main, 0.1)} 0%, ${alpha(getSelectedBlockchain()?.color || theme.palette.info.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(getSelectedBlockchain()?.color || theme.palette.info.main, 0.3)}`,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontFamily: '"Orbitron", monospace',
                      fontWeight: 500,
                    },
                  }}
                >
                  <strong>{getSelectedBlockchain()?.name} ({getSelectedBlockchain()?.symbol})</strong>: {getSelectedBlockchain()?.description} - Demo Mode
                </Alert>
              )}

              {/* Wallet Balance Display */}
              {isConnected && wallet && (
                <Alert 
                  severity="info"
                  sx={{
                    mb: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontFamily: '"Orbitron", monospace',
                      fontWeight: 500,
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    <strong>Wallet Balance:</strong> {wallet.balance} XLM
                  </Typography>
                </Alert>
              )}

              {/* Bet Amount Input */}
              <Box sx={{ mb: 2, position: 'relative' }}>
                <Typography 
                  variant="body2"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                    color: theme.palette.warning.main,
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    animation: !betAmount ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': {
                        transform: 'scale(1)',
                        textShadow: '0 0 5px rgba(255, 193, 7, 0.3)',
                      },
                      '50%': {
                        transform: 'scale(1.02)',
                        textShadow: '0 0 15px rgba(255, 193, 7, 0.6)',
                      },
                      '100%': {
                        transform: 'scale(1)',
                        textShadow: '0 0 5px rgba(255, 193, 7, 0.3)',
                      },
                    },
                  }}
                >
                  <TrendingUp sx={{ 
                    fontSize: 18,
                    animation: !betAmount ? 'bounce 1.5s infinite' : 'none',
                    '@keyframes bounce': {
                      '0%, 20%, 50%, 80%, 100%': {
                        transform: 'translateY(0)',
                      },
                      '40%': {
                        transform: 'translateY(-4px)',
                      },
                      '60%': {
                        transform: 'translateY(-2px)',
                      },
                    },
                  }} />
                  Please enter your bet amount below:
                  {!betAmount && (
                    <Box
                      component="span"
                      sx={{
                        animation: 'blink 1.5s infinite',
                        '@keyframes blink': {
                          '0%, 50%': { opacity: 1 },
                          '51%, 100%': { opacity: 0.3 },
                        },
                      }}
                    >
                      👈
                    </Box>
                  )}
                </Typography>
                
                <TextField
                  fullWidth
                  label={`BET AMOUNT (${getSelectedBlockchain()?.symbol || 'TOKEN'})`}
                  type="number"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  inputProps={{ min: "0", step: "0.1" }}
                  error={!!error}
                  helperText={error || (!isConnected ? "Connect wallet to see your balance" : "Enter amount to bet on this game")}
                  sx={{
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Orbitron", monospace',
                      fontWeight: 600,
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Orbitron", monospace',
                      fontWeight: 600,
                    },
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      ...((!betAmount && isBettingEnabled) && {
                        borderColor: theme.palette.warning.main,
                        boxShadow: `0 0 15px ${alpha(theme.palette.warning.main, 0.3)}`,
                        animation: 'glow 2s infinite alternate',
                        '@keyframes glow': {
                          '0%': {
                            boxShadow: `0 0 5px ${alpha(theme.palette.warning.main, 0.3)}`,
                          },
                          '100%': {
                            boxShadow: `0 0 20px ${alpha(theme.palette.warning.main, 0.6)}`,
                          },
                        },
                        '& fieldset': {
                          borderColor: `${theme.palette.warning.main} !important`,
                          borderWidth: '2px !important',
                        },
                      }),
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                    },
                  }}
                />
                
                {/* Floating attention indicator */}
                {!betAmount && isBettingEnabled && !isMobile && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      right: -40,
                      transform: 'translateY(-50%)',
                      animation: 'float 3s ease-in-out infinite',
                      '@keyframes float': {
                        '0%': {
                          transform: 'translateY(-50%) translateX(0px)',
                        },
                        '50%': {
                          transform: 'translateY(-50%) translateX(-5px)',
                        },
                        '100%': {
                          transform: 'translateY(-50%) translateX(0px)',
                        },
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '24px',
                        filter: 'drop-shadow(0 0 3px rgba(255, 193, 7, 0.8))',
                        animation: 'rotate 4s linear infinite',
                        '@keyframes rotate': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    >
                      💫
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
        <Button
          onClick={onClose}
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            letterSpacing: '0.02em',
          }}
        >
          CANCEL
        </Button>

        <Button
          onClick={handleStartGame}
          disabled={isStartGameDisabled()}
          variant="contained"
          size={isMobile ? 'medium' : 'large'}
          sx={{
            px: { xs: 2, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            fontFamily: '"Orbitron", monospace',
            fontWeight: 700,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            letterSpacing: '0.02em',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
              boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.6)}`,
              transform: 'translateY(-2px) scale(1.02)',
            },
            '&:disabled': {
              opacity: 0.5,
              background: theme.palette.action.disabledBackground,
            },
          }}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} />
              STARTING...
            </>
          ) : (
            'START GAME'
          )}
        </Button>
      </DialogActions>

      {/* Betting Preparation Dialog */}
      <BettingPreparationDialog
        open={showBettingPreparation}
        onClose={handleBettingCancelled}
        onGameReady={handleBettingReady}
        betAmount={betAmount}
        gameType={selectedGame}
      />
    </Dialog>
  );
};

export default GameSetupDialog; 