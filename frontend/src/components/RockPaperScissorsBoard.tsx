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
  Card,
  CardContent,
} from '@mui/material';
import { MonetizationOn, Psychology, SmartToy } from '@mui/icons-material';
import { useGame } from '../contexts/GameContext';
import PayoutDialog from './PayoutDialog';

interface RockPaperScissorsBoardProps {}

type Choice = 'rock' | 'paper' | 'scissors' | null;
type GameResult = 'win' | 'lose' | 'draw' | null;

const choices: { id: Choice; name: string; emoji: string; beats: Choice }[] = [
  { id: 'rock', name: 'Rock', emoji: '🪨', beats: 'scissors' },
  { id: 'paper', name: 'Paper', emoji: '📄', beats: 'rock' },
  { id: 'scissors', name: 'Scissors', emoji: '✂️', beats: 'paper' },
];

const RockPaperScissorsBoard: React.FC<RockPaperScissorsBoardProps> = () => {
  const { gameId, betAmount, difficulty, escrowAccount, showPayoutDialog, closePayoutDialog } = useGame();
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [aiChoice, setAiChoice] = useState<Choice>(null);
  const [result, setResult] = useState<GameResult>(null);
  const [gameState, setGameState] = useState<'waiting' | 'choosing' | 'revealing' | 'finished'>('waiting');
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const [isRevealing, setIsRevealing] = useState(false);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [showLocalPayoutDialog, setShowLocalPayoutDialog] = useState(false);
  const theme = useTheme();

  const maxRounds = 5; // Best of 5 rounds

  const getAIChoice = (): Choice => {
    const difficultySettings = {
      easy: { randomness: 0.8 }, // 80% random, 20% strategy
      medium: { randomness: 0.5 }, // 50% random, 50% strategy  
      hard: { randomness: 0.2 }, // 20% random, 80% strategy
    };

    const settings = difficultySettings[difficulty as keyof typeof difficultySettings] || difficultySettings.medium;

    if (Math.random() < settings.randomness) {
      // Random choice
      const randomChoices: Choice[] = ['rock', 'paper', 'scissors'];
      return randomChoices[Math.floor(Math.random() * 3)];
    } else {
      // Strategic choice based on player's last choice
      if (!playerChoice) {
        return ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)] as Choice;
      }
      
      // Counter the player's last choice
      const counters = {
        rock: 'paper',
        paper: 'scissors', 
        scissors: 'rock'
      };
      
      return counters[playerChoice] as Choice;
    }
  };

  const determineWinner = (player: Choice, ai: Choice): GameResult => {
    if (!player || !ai) return null;
    
    if (player === ai) return 'draw';
    
    const playerChoiceObj = choices.find(c => c.id === player);
    if (playerChoiceObj && playerChoiceObj.beats === ai) {
      return 'win';
    }
    
    return 'lose';
  };

  const handlePlayerChoice = async (choice: Choice) => {
    if (gameState !== 'choosing') return;
    
    setPlayerChoice(choice);
    setGameState('revealing');
    setIsRevealing(true);
    
    // Add suspense delay
    setTimeout(() => {
      const aiChoice = getAIChoice();
      setAiChoice(aiChoice);
      
      const result = determineWinner(choice, aiChoice);
      setResult(result);
      
      // Update score
      setScore(prev => ({
        player: prev.player + (result === 'win' ? 1 : 0),
        ai: prev.ai + (result === 'lose' ? 1 : 0),
        draws: prev.draws + (result === 'draw' ? 1 : 0),
      }));
      
      setIsRevealing(false);
      
      // Check if game is finished
      setTimeout(() => {
        if (round >= maxRounds) {
          setGameState('finished');
          // Determine overall winner and trigger game end
          const finalScore = {
            player: score.player + (result === 'win' ? 1 : 0),
            ai: score.ai + (result === 'lose' ? 1 : 0),
          };
          
          let winner;
          if (finalScore.player > finalScore.ai) {
            winner = 'X'; // Player wins
          } else if (finalScore.ai > finalScore.player) {
            winner = 'O'; // AI wins
          } else {
            winner = 'draw'; // Tie
          }
          
          // Trigger game end with winner
          handleGameEnd(winner);
        } else {
          // Next round
          setTimeout(() => {
            setRound(prev => prev + 1);
            setPlayerChoice(null);
            setAiChoice(null);
            setResult(null);
            setGameState('choosing');
          }, 2000);
        }
      }, 2000);
    }, 1500);
  };

  const startGame = () => {
    setGameState('choosing');
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setScore({ player: 0, ai: 0, draws: 0 });
    setRound(1);
  };

  const resetGame = () => {
    setGameState('waiting');
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setScore({ player: 0, ai: 0, draws: 0 });
    setRound(1);
  };

  // Auto-start when game is created
  useEffect(() => {
    if (gameId && gameState === 'waiting') {
      startGame();
    }
  }, [gameId]);

  const getResultMessage = () => {
    if (!result) return '';
    
    switch (result) {
      case 'win':
        return '🎉 You Win This Round!';
      case 'lose':
        return '🤖 AI Wins This Round!';
      case 'draw':
        return '🤝 This Round is a Tie!';
      default:
        return '';
    }
  };

  const getChoiceCard = (choice: Choice, isPlayer: boolean, isRevealed: boolean) => {
    const choiceObj = choices.find(c => c.id === choice);
    
    return (
      <Card
        sx={{
          minHeight: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isRevealed
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.grey[500], 0.1)} 0%, ${alpha(theme.palette.grey[300], 0.05)} 100%)`,
          border: `2px solid ${isRevealed ? theme.palette.primary.main : theme.palette.grey[500]}`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          {isRevealed && choiceObj ? (
            <>
              <Typography variant="h2" sx={{ mb: 1 }}>
                {choiceObj.emoji}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {choiceObj.name}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h2" sx={{ mb: 1 }}>
                {isRevealing ? '🎭' : '❓'}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                {isRevealing ? 'Thinking...' : 'Hidden'}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
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
        gameType: 'rock-paper-scissors',
        gameId: gameId,
        gameResult: 'pending',
        memo: `RPS_BET_${gameId}_${new Date().toISOString()}`.substring(0, 28),
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
        🪨📄✂️ ROCK PAPER SCISSORS
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
              icon={<SmartToy />}
              label={`AI: ${score.ai}`}
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
              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
              px: 4,
              py: 2,
            }}
          >
            START GAME
          </Button>
        </Box>
      )}

      {(gameState === 'choosing' || gameState === 'revealing') && (
        <>
          {/* Choice Buttons */}
          {gameState === 'choosing' && (
            <Box sx={{ mb: 4 }}>
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
                Choose Your Move:
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {choices.map((choice) => (
                  <Grid item key={choice.id}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => handlePlayerChoice(choice.id)}
                      sx={{
                        minWidth: 120,
                        minHeight: 120,
                        borderRadius: 3,
                        border: `2px solid ${theme.palette.primary.main}`,
                        background: `linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, transparent 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.1) 100%)`,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ mb: 1 }}>
                          {choice.emoji}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: '"Orbitron", monospace',
                            fontWeight: 600,
                          }}
                        >
                          {choice.name}
                        </Typography>
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Battle Display */}
          {(gameState === 'revealing' || (playerChoice && aiChoice)) && (
            <Box sx={{ mb: 4 }}>
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
                {isRevealing ? 'Revealing Choices...' : getResultMessage()}
              </Typography>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={5}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Orbitron", monospace',
                      textAlign: 'center',
                      mb: 2,
                      color: 'success.main',
                    }}
                  >
                    👤 YOU
                  </Typography>
                  {getChoiceCard(playerChoice, true, true)}
                </Grid>
                
                <Grid item xs={2}>
                  <Typography
                    variant="h3"
                    sx={{ textAlign: 'center', color: 'primary.main' }}
                  >
                    VS
                  </Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Orbitron", monospace',
                      textAlign: 'center',
                      mb: 2,
                      color: 'error.main',
                    }}
                  >
                    🤖 AI
                  </Typography>
                  {getChoiceCard(aiChoice, false, !isRevealing)}
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      )}

      {gameState === 'finished' && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              background: `linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)`,
              border: `2px solid ${theme.palette.success.main}`,
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
                color: score.player > score.ai ? 'success.main' : score.ai > score.player ? 'error.main' : 'info.main',
              }}
            >
              {score.player > score.ai ? '🏆 YOU WIN!' : score.ai > score.player ? '🤖 AI WINS!' : '🤝 TIE GAME!'}
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Final Score: You {score.player} - {score.ai} AI
            </Typography>
          </Paper>
          
          <Button
            variant="contained"
            size="large"
            onClick={resetGame}
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
              px: 4,
              py: 2,
            }}
          >
            PLAY AGAIN
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
          gameType="rock-paper-scissors"
          gameId={gameId || ''}
        />
      )}
    </Box>
  );
};

export default RockPaperScissorsBoard; 