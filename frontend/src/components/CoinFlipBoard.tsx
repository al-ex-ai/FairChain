import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  Chip,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { MonetizationOn, Casino, Psychology } from '@mui/icons-material';
import { useGame } from '../contexts/GameContext';
import PayoutDialog from './PayoutDialog';

interface CoinFlipBoardProps {}

type Choice = 'heads' | 'tails' | null;
type CoinResult = 'heads' | 'tails' | null;
type GameResult = 'win' | 'lose' | null;

const CoinFlipBoard: React.FC<CoinFlipBoardProps> = () => {
  const { gameId, betAmount, difficulty, escrowAccount } = useGame();
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [coinResult, setCoinResult] = useState<CoinResult>(null);
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [gameState, setGameState] = useState<'waiting' | 'choosing' | 'flipping' | 'revealed' | 'finished'>('waiting');
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipAnimation, setFlipAnimation] = useState('');
  const [score, setScore] = useState({ player: 0, house: 0 });
  const [round, setRound] = useState(1);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [showLocalPayoutDialog, setShowLocalPayoutDialog] = useState(false);
  const theme = useTheme();

  const maxRounds = 3; // Best of 3 rounds

  const flipCoin = (): 'heads' | 'tails' => {
    return Math.random() < 0.5 ? 'heads' : 'tails';
  };

  const handlePlayerChoice = (choice: Choice) => {
    if (gameState !== 'choosing') return;
    setPlayerChoice(choice);
  };

  const handleFlipCoin = async () => {
    if (!playerChoice || gameState !== 'choosing') return;
    
    setGameState('flipping');
    setIsFlipping(true);
    setFlipAnimation('flipping');
    
    // Simulate coin flip animation
    setTimeout(() => {
      const result = flipCoin();
      setCoinResult(result);
      
      const gameResult: GameResult = playerChoice === result ? 'win' : 'lose';
      setGameResult(gameResult);
      
      // Update score
      setScore(prev => ({
        player: prev.player + (gameResult === 'win' ? 1 : 0),
        house: prev.house + (gameResult === 'lose' ? 1 : 0),
      }));
      
      setIsFlipping(false);
      setFlipAnimation('');
      setGameState('revealed');
      
      // Check if game is finished
      setTimeout(() => {
        if (round >= maxRounds) {
          setGameState('finished');
          
          // Determine overall winner and trigger game end
          const finalScore = {
            player: score.player + (gameResult === 'win' ? 1 : 0),
            house: score.house + (gameResult === 'lose' ? 1 : 0),
          };
          
          let winner;
          if (finalScore.player > finalScore.house) {
            winner = 'X'; // Player wins
          } else if (finalScore.house > finalScore.player) {
            winner = 'O'; // House wins
          } else {
            winner = 'draw'; // Tie
          }
          
          handleGameEnd(winner);
        } else {
          // Next round
          setTimeout(() => {
            nextRound();
          }, 3000);
        }
      }, 2000);
    }, 2000); // 2 second flip animation
  };

  const nextRound = () => {
    setRound(prev => prev + 1);
    setPlayerChoice(null);
    setCoinResult(null);
    setGameResult(null);
    setGameState('choosing');
  };

  const startGame = () => {
    setGameState('choosing');
    setPlayerChoice(null);
    setCoinResult(null);
    setGameResult(null);
    setScore({ player: 0, house: 0 });
    setRound(1);
  };

  const resetGame = () => {
    setGameState('waiting');
    setPlayerChoice(null);
    setCoinResult(null);
    setGameResult(null);
    setScore({ player: 0, house: 0 });
    setRound(1);
  };

  // Auto-start when game is created
  useEffect(() => {
    if (gameId && gameState === 'waiting') {
      startGame();
    }
  }, [gameId]);

  const getResultMessage = () => {
    if (!gameResult || !coinResult) return '';
    
    if (gameResult === 'win') {
      return `🎉 You Win! It's ${coinResult}!`;
    } else {
      return `😔 You Lose! It's ${coinResult}!`;
    }
  };

  const getCoinDisplay = () => {
    if (isFlipping) {
      return (
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            animation: 'spin 0.5s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotateY(0deg)' },
              '100%': { transform: 'rotateY(360deg)' },
            },
          }}
        >
          🪙
        </Box>
      );
    }
    
    if (coinResult) {
      return (
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: gameResult === 'win' 
              ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
              : 'linear-gradient(45deg, #f44336, #e57373)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            border: `3px solid ${gameResult === 'win' ? theme.palette.success.main : theme.palette.error.main}`,
            animation: 'bounce 0.5s ease-in-out',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        >
          {coinResult === 'heads' ? '👑' : '⚡'}
        </Box>
      );
    }
    
    return (
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          border: `3px solid ${theme.palette.warning.main}`,
        }}
      >
        🪙
      </Box>
    );
  };

  const handleGameEnd = async (winner: string) => {
    if (!gameId) return;
    
    setGameWinner(winner);

    if (escrowAccount && betAmount && parseFloat(betAmount) > 0) {
      // Record the initial betting transaction in history
      const userId = 'current-user';
      const historyKey = `fairchain-tx-history-${userId}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      const bettingTransaction = {
        id: `bet-${gameId}`,
        hash: `betting-${Date.now()}`,
        type: 'game_bet',
        amount: `-${betAmount}`,
        date: new Date().toISOString(),
        gameType: 'coin-flip',
        gameId: gameId,
        gameResult: 'pending',
        memo: `COIN_BET_${gameId}_${new Date().toISOString()}`.substring(0, 28),
        status: 'completed'
      };
      
      const updatedHistory = [bettingTransaction, ...existingHistory].slice(0, 100);
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      
      // Only show payout dialog for player wins and draws
      if (winner === 'X' || winner === 'draw') {
        setShowLocalPayoutDialog(true);
      }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontFamily: '"Orbitron", monospace',
          fontWeight: 700,
          letterSpacing: '0.02em',
          color: theme.palette.primary.main,
          textAlign: 'center',
          mb: 3,
        }}
        className="neon-text"
      >
        🪙 COIN FLIP
      </Typography>

      {betAmount && parseFloat(betAmount) > 0 && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            background: `linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonetizationOn />
            <strong>Betting: {betAmount} XLM</strong> - Best of {maxRounds} rounds
          </Box>
        </Alert>
      )}

      {/* Score Display */}
      <Paper
        elevation={8}
        sx={{
          p: 2,
          mb: 3,
          background: `linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item>
            <Chip
              icon={<Psychology />}
              label={`You: ${score.player}`}
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                color: theme.palette.success.main,
                borderColor: theme.palette.success.main,
              }}
            />
          </Grid>
          <Grid item>
            <Chip
              label={`Round ${round}/${maxRounds}`}
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<Casino />}
              label={`House: ${score.house}`}
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                color: theme.palette.error.main,
                borderColor: theme.palette.error.main,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Game Area */}
      {gameState === 'waiting' && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={startGame}
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              color: '#000',
              px: 4,
              py: 2,
            }}
          >
            START FLIPPING
          </Button>
        </Box>
      )}

      {gameState === 'choosing' && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              textAlign: 'center',
              mb: 3,
              color: 'primary.main',
            }}
          >
            Choose Heads or Tails:
          </Typography>
          
          <ToggleButtonGroup
            value={playerChoice}
            exclusive
            onChange={(event, newChoice) => setPlayerChoice(newChoice)}
            sx={{ mb: 4 }}
          >
            <ToggleButton
              value="heads"
              sx={{
                minWidth: 150,
                minHeight: 100,
                border: `2px solid ${theme.palette.primary.main}`,
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.1) 100%)`,
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  👑
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                  }}
                >
                  HEADS
                </Typography>
              </Box>
            </ToggleButton>
            
            <ToggleButton
              value="tails"
              sx={{
                minWidth: 150,
                minHeight: 100,
                border: `2px solid ${theme.palette.primary.main}`,
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(33, 150, 243, 0.1) 100%)`,
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ mb: 1 }}>
                  ⚡
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 600,
                  }}
                >
                  TAILS
                </Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <br />
          
          <Button
            variant="contained"
            size="large"
            onClick={handleFlipCoin}
            disabled={!playerChoice}
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              color: '#000',
              px: 4,
              py: 2,
              '&:disabled': {
                background: 'rgba(255, 215, 0, 0.3)',
                color: 'rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            FLIP COIN!
          </Button>
        </Box>
      )}

      {(gameState === 'flipping' || gameState === 'revealed') && (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              textAlign: 'center',
              mb: 3,
              color: 'primary.main',
            }}
          >
            {isFlipping ? 'Flipping...' : getResultMessage()}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            {getCoinDisplay()}
          </Box>
          
          {gameState === 'revealed' && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  color: 'text.secondary',
                  mb: 2,
                }}
              >
                You chose: {playerChoice?.toUpperCase()} | Result: {coinResult?.toUpperCase()}
              </Typography>
              
              {round < maxRounds && (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Next round starting soon...
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}

      {gameState === 'finished' && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              background: `linear-gradient(135deg, ${score.player > score.house ? 'rgba(76, 175, 80, 0.1)' : score.house > score.player ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)'} 0%, rgba(255, 152, 0, 0.05) 100%)`,
              border: `2px solid ${score.player > score.house ? theme.palette.success.main : score.house > score.player ? theme.palette.error.main : theme.palette.info.main}`,
              borderRadius: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 700,
                mb: 2,
                color: score.player > score.house ? 'success.main' : score.house > score.player ? 'error.main' : 'info.main',
              }}
            >
              {score.player > score.house ? '🏆 YOU WIN!' : score.house > score.player ? '🏠 HOUSE WINS!' : '🤝 TIE GAME!'}
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Final Score: You {score.player} - {score.house} House
            </Typography>
          </Paper>
          
          <Button
            variant="contained"
            size="large"
            onClick={resetGame}
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              color: '#000',
              px: 4,
              py: 2,
            }}
          >
            FLIP AGAIN
          </Button>
        </Box>
      )}
      
      {/* Payout Dialog */}
      {escrowAccount && betAmount && parseFloat(betAmount) > 0 && gameWinner && (gameWinner === 'X' || gameWinner === 'draw') && (
        <PayoutDialog
          open={showLocalPayoutDialog && gameState === 'finished' && !!gameWinner}
          onClose={() => {
            setShowLocalPayoutDialog(false);
            setGameWinner(null);
            resetGame();
          }}
          winner={gameWinner}
          escrowAccount={escrowAccount}
          betAmount={betAmount}
          gameType="coin-flip"
          gameId={gameId || ''}
        />
      )}
    </Box>
  );
};

export default CoinFlipBoard;