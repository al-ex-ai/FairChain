import React, { useState, useEffect } from 'react';
import { CssBaseline, Container, Box, IconButton, AppBar, Toolbar, Typography, Button, Menu, MenuItem, Avatar, Chip } from '@mui/material';
import { Home, ArrowBack, Login, PersonAdd, AccountCircle, Logout, AccountBalanceWallet, Refresh } from '@mui/icons-material';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameProvider } from './contexts/GameContext';
import { WalletProvider, useWallet } from './contexts/WalletContext';
import GameBoard from './components/GameBoard';
import BlackjackBoard from './components/BlackjackBoard';
import RockPaperScissorsBoard from './components/RockPaperScissorsBoard';
import CoinFlipBoard from './components/CoinFlipBoard';
import DiceRollBoard from './components/DiceRollBoard';
import GameSetupDialog from './components/GameSetupDialog';
import WalletConnectionDialog from './components/WalletConnectionDialog';
import WalletManagementDialog from './components/WalletManagementDialog';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { StellarProvider } from './contexts/StellarContext';
import { useGame } from './contexts/GameContext';

interface UserData {
  id: string;
  email: string;
  username: string;
  level: number;
  gamesPlayed: number;
  winRate: number;
  userId: string;
}

interface AppContentProps {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
}

const AppContent: React.FC<AppContentProps> = ({ user, setUser }) => {
  const { startNewGame } = useGame();
  const { isConnected, wallet, isLoading: walletLoading, refreshBalance, clearWallet } = useWallet();
  const [currentView, setCurrentView] = useState<'landing' | 'game' | 'signin' | 'signup'>('landing');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isWalletManagementOpen, setIsWalletManagementOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleGameSelect = (gameId: string) => {
    // Require login to start any game
    if (!user) {
      setCurrentView('signin');
      return;
    }

    const validGames = ['tic-tac-toe', 'blackjack', 'rock-paper-scissors', 'coin-flip', 'dice-roll'];
    if (validGames.includes(gameId)) {
      setSelectedGame(gameId);
      setCurrentView('game');
      setIsDialogOpen(true);
    }
  };

  const handleStartGame = async (difficulty: string, betAmount: string, escrowAccount?: string, gameId?: string) => {
    try {
      setGameStarted(true);

      if (escrowAccount) {
        await startNewGame(difficulty, betAmount, escrowAccount, gameId);
      } else {
        await startNewGame(difficulty, betAmount);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error starting game:', error);
      // Reset gameStarted if there's an error
      setGameStarted(false);
      // Don't close dialog if there's an error
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // Only navigate back to landing if the game wasn't successfully started
    if (!gameStarted) {
      setCurrentView('landing');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setGameStarted(false);
    setSelectedGame('');
    setIsDialogOpen(false);
  };

  const handleSignInSuccess = (userData: UserData) => {
    setUser(userData);
    setCurrentView('landing');
  };

  const handleSignUpSuccess = (userData: UserData) => {
    setUser(userData);
    setCurrentView('landing');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setAnchorEl(null);
    // Clear user session from localStorage
    localStorage.removeItem('fairchain-current-user');
    // Clear wallet when user logs out
    clearWallet();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleWalletRefresh = async () => {
    await refreshBalance();
  };

  const gameDisplayNames: Record<string, string> = {
    'tic-tac-toe': 'Tic-Tac-Toe',
    'blackjack': 'Blackjack',
    'rock-paper-scissors': 'Rock Paper Scissors',
    'coin-flip': 'Coin Flip',
    'dice-roll': 'Dice Roll',
  };

  const getGameDisplayName = (gameId: string): string => {
    return gameDisplayNames[gameId as keyof typeof gameDisplayNames] || gameId;
  };

  const renderGameBoard = () => {
    switch (selectedGame) {
      case 'tic-tac-toe':
        return <GameBoard />;
      case 'blackjack':
        return <BlackjackBoard />;
      case 'rock-paper-scissors':
        return <RockPaperScissorsBoard />;
      case 'coin-flip':
        return <CoinFlipBoard />;
      case 'dice-roll':
        return <DiceRollBoard />;
      default:
        return <div>Game not found</div>;
    }
  };

  const renderAuthButtons = () => {
    if (user) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
          {/* Wallet Connection */}
          {!isConnected ? (
            <IconButton
              onClick={() => setIsWalletDialogOpen(true)}
              sx={{
                display: { xs: 'flex', sm: 'none' },
                color: '#00ffff',
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                '&:hover': {
                  background: 'rgba(0, 255, 255, 0.2)',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
                },
              }}
              size="small"
            >
              <AccountBalanceWallet sx={{ fontSize: 20 }} />
            </IconButton>
          ) : null}
          {!isConnected ? (
            <Button
              variant="outlined"
              startIcon={<AccountBalanceWallet />}
              onClick={() => setIsWalletDialogOpen(true)}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                letterSpacing: '0.02em',
                borderColor: '#00ffff',
                color: '#00ffff',
                background: 'rgba(0, 255, 255, 0.1)',
                '&:hover': {
                  borderColor: '#4dffff',
                  bgcolor: 'rgba(0, 255, 255, 0.2)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                  textShadow: '0 0 8px rgba(0, 255, 255, 0.8)',
                },
              }}
            >
              CONNECT WALLET
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              <Chip
                icon={<AccountBalanceWallet sx={{ '&.MuiChip-icon': { color: '#000014 !important' }, fontSize: { xs: 16, sm: 20 } }} />}
                label={`${wallet?.balance} XLM`}
                clickable
                onClick={() => setIsWalletManagementOpen(true)}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 700,
                  fontSize: { xs: '0.6rem', sm: '0.9rem' },
                  height: { xs: 28, sm: 40 },
                  background: 'linear-gradient(45deg, #00ffff 0%, #4dffff 100%)',
                  color: '#000014',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '& .MuiChip-icon': { ml: { xs: 0.5, sm: 1 } },
                  '& .MuiChip-label': {
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 700,
                    color: '#000014',
                    textShadow: 'none',
                    px: { xs: 0.5, sm: 1 },
                  },
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4dffff 0%, #00ffff 100%)',
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-1px)',
                  },
                }}
              />
              <IconButton
                onClick={handleWalletRefresh}
                disabled={walletLoading}
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  color: '#00ffff',
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'rgba(0, 255, 255, 0.2)',
                    boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
                  },
                  '&:disabled': {
                    color: 'rgba(0, 255, 255, 0.5)',
                    background: 'rgba(0, 255, 255, 0.05)',
                  },
                }}
                size="small"
              >
                <Refresh sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          )}

          <Chip
            avatar={
              <Avatar
                sx={{
                  bgcolor: 'transparent',
                  background: 'linear-gradient(45deg, #ff0080 0%, #ff4da6 100%)',
                  color: '#ffffff',
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 800,
                  fontSize: { xs: '0.7rem', sm: '1rem' },
                  width: { xs: 22, sm: 32 },
                  height: { xs: 22, sm: 32 },
                  boxShadow: '0 0 10px rgba(255, 0, 128, 0.4)',
                }}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
            }
            label={`Lv.${user.level}`}
            variant="outlined"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              fontSize: { xs: '0.6rem', sm: '0.9rem' },
              height: { xs: 28, sm: 40 },
              color: '#ff0080',
              borderColor: '#ff0080',
              background: 'rgba(255, 0, 128, 0.1)',
              boxShadow: '0 0 10px rgba(255, 0, 128, 0.2)',
              transition: 'all 0.3s ease',
              '& .MuiChip-label': {
                fontFamily: '"Orbitron", monospace',
                fontWeight: 700,
                color: '#ff0080',
                textShadow: '0 0 5px rgba(255, 0, 128, 0.5)',
                px: { xs: 0.5, sm: 1 },
              },
              '&:hover': {
                borderColor: '#ff4da6',
                background: 'rgba(255, 0, 128, 0.2)',
                boxShadow: '0 0 15px rgba(255, 0, 128, 0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          />
          <IconButton
            onClick={handleMenuClick}
            size="small"
            sx={{
              color: 'primary.main',
              p: { xs: 0.5, sm: 1 },
              '&:hover': {
                bgcolor: 'rgba(139, 69, 19, 0.1)',
              },
            }}
          >
            <AccountCircle sx={{ fontSize: { xs: 24, sm: 32 } }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                background: `
                  linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                borderRadius: 3,
                mt: 1,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              },
            }}
          >
            <MenuItem 
              sx={{ 
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                color: 'text.primary',
                borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
                '&:hover': { 
                  bgcolor: 'rgba(0, 255, 255, 0.1)',
                  boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)',
                },
              }}
            >
              <AccountCircle sx={{ mr: 2, color: 'primary.main' }} />
              {user.username}
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                color: 'error.main',
                '&:hover': { 
                  bgcolor: 'rgba(255, 7, 58, 0.1)',
                  boxShadow: '0 0 10px rgba(255, 7, 58, 0.2)',
                },
              }}
            >
              <Logout sx={{ mr: 2, fontSize: 20 }} />
              LOGOUT
            </MenuItem>
          </Menu>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
        <IconButton
          onClick={() => setCurrentView('signin')}
          size="small"
          sx={{
            display: { xs: 'flex', sm: 'none' },
            color: '#00ffff',
            background: 'rgba(0, 255, 255, 0.1)',
            border: '1px solid rgba(0, 255, 255, 0.4)',
            '&:hover': {
              background: 'rgba(0, 255, 255, 0.2)',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
            },
          }}
        >
          <Login sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton
          onClick={() => setCurrentView('signup')}
          size="small"
          sx={{
            display: { xs: 'flex', sm: 'none' },
            color: '#ffffff',
            background: 'linear-gradient(45deg, #ff0080, #ff4da6)',
            border: '1px solid rgba(255, 0, 128, 0.5)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ff4da6, #ff0080)',
              boxShadow: '0 0 15px rgba(255, 0, 128, 0.4)',
            },
          }}
        >
          <PersonAdd sx={{ fontSize: 20 }} />
        </IconButton>
        <Button
          variant="outlined"
          startIcon={<Login />}
          onClick={() => setCurrentView('signin')}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            letterSpacing: '0.02em',
            borderColor: 'primary.main',
            color: 'primary.main',
            background: 'rgba(0, 255, 255, 0.1)',
            border: '2px solid rgba(0, 255, 255, 0.5)',
            '&:hover': {
              borderColor: '#4dffff',
              bgcolor: 'rgba(0, 255, 255, 0.2)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
              textShadow: '0 0 8px rgba(0, 255, 255, 0.8)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          SIGN IN
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setCurrentView('signup')}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            letterSpacing: '0.02em',
            background: 'linear-gradient(45deg, #ff0080, #ff4da6)',
            color: '#ffffff',
            border: '2px solid rgba(255, 0, 128, 0.5)',
            boxShadow: '0 0 15px rgba(255, 0, 128, 0.4)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ff4da6, #ff0080)',
              boxShadow: '0 0 25px rgba(255, 0, 128, 0.6)',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              transform: 'translateY(-1px) scale(1.02)',
            },
          }}
        >
          SIGN UP
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh' }} className="gaming-gradient-bg">
      <CssBaseline />
      <AppBar position="static" elevation={currentView === 'landing' ? 0 : 1}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: { xs: 48, sm: 64 } }}>
          {(currentView === 'game' || currentView === 'signin' || currentView === 'signup') && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBackToLanding}
              sx={{ mr: { xs: 0.5, sm: 2 } }}
              size="small"
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              fontSize: { xs: '0.75rem', sm: '1.25rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
            className="neon-text"
          >
            {currentView === 'landing' ? 'FairChain' :
             currentView === 'game' ? getGameDisplayName(selectedGame) :
             currentView === 'signin' ? 'Sign In' :
             'Sign Up'}
          </Typography>
          
          {currentView === 'game' && (
            <IconButton
              color="inherit"
              onClick={handleBackToLanding}
              size="small"
              sx={{ mr: { xs: 0, sm: 1 } }}
            >
              <Home sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          )}
          
          {(currentView === 'landing' || currentView === 'game') && renderAuthButtons()}
        </Toolbar>
      </AppBar>

      {currentView === 'landing' && (
        <LandingPage onGameSelect={handleGameSelect} />
      )}
      
      {currentView === 'game' && (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {renderGameBoard()}
          <GameSetupDialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            onStartGame={handleStartGame}
            selectedGame={selectedGame}
          />
        </Container>
      )}
      
      {currentView === 'signin' && (
        <SignIn 
          onSwitchToSignUp={() => setCurrentView('signup')}
          onSignInSuccess={handleSignInSuccess}
        />
      )}
      
      {currentView === 'signup' && (
        <SignUp 
          onSwitchToSignIn={() => setCurrentView('signin')}
          onSignUpSuccess={handleSignUpSuccess}
        />
      )}

      {/* Wallet Connection Dialog */}
      <WalletConnectionDialog
        open={isWalletDialogOpen}
        onClose={() => setIsWalletDialogOpen(false)}
      />

      {/* Wallet Management Dialog */}
      <WalletManagementDialog
        open={isWalletManagementOpen}
        onClose={() => setIsWalletManagementOpen(false)}
      />
    </Box>
  );
};

const App = () => {
  const [user, setUser] = useState<UserData | null>(null);

  // Load user session from localStorage on app start
  useEffect(() => {
    const savedUserSession = localStorage.getItem('fairchain-current-user');
    if (savedUserSession) {
      try {
        const userData = JSON.parse(savedUserSession);
        setUser(userData);
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('fairchain-current-user');
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <CssBaseline />
      <StellarProvider>
        <GameProvider>
          <WalletProvider userId={user?.userId || null}>
            <AppContent user={user} setUser={setUser} />
          </WalletProvider>
        </GameProvider>
      </StellarProvider>
    </ThemeProvider>
  );
};

export default App;
