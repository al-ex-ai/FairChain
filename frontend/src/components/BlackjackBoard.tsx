import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  useTheme,
  alpha,
  LinearProgress,
  Paper,
} from '@mui/material';
import { Casino, Refresh, MonetizationOn } from '@mui/icons-material';
import { useGame } from '../contexts/GameContext';

interface PlayingCard {
  suit: string;
  rank: string;
  value: number;
}

interface BlackjackBoardProps {}

const BlackjackBoard: React.FC<BlackjackBoardProps> = () => {
  const theme = useTheme();
  const { gameId, betAmount, resetGame } = useGame();
  
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer-turn' | 'finished'>('betting');
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [message, setMessage] = useState('Place your bet and start the game!');
  const [canDouble, setCanDouble] = useState(false);
  const [showDealerCard, setShowDealerCard] = useState(false);
  const [dealerProgress, setDealerProgress] = useState(0);

  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const createDeck = (): PlayingCard[] => {
    const newDeck: PlayingCard[] = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        let value = parseInt(rank);
        if (isNaN(value)) {
          value = rank === 'A' ? 11 : 10;
        }
        newDeck.push({ suit, rank, value });
      });
    });
    return shuffleDeck([...newDeck]);
  };

  const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateScore = (hand: PlayingCard[]): number => {
    let score = 0;
    let aces = 0;
    
    hand.forEach(card => {
      if (card.rank === 'A') {
        aces++;
        score += 11;
      } else {
        score += card.value;
      }
    });
    
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    
    return score;
  };

  const dealCard = (currentDeck: PlayingCard[]) => {
    if (currentDeck.length === 0) return { card: null, newDeck: [] };
    const newDeck = [...currentDeck];
    const card = newDeck.pop();
    return { card, newDeck };
  };

  const startGame = () => {
    const newDeck = createDeck();
    let currentDeck = [...newDeck];
    
    // Deal two cards to player
    const { card: playerCard1, newDeck: deck1 } = dealCard(currentDeck);
    const { card: playerCard2, newDeck: deck2 } = dealCard(deck1);
    
    // Deal two cards to dealer
    const { card: dealerCard1, newDeck: deck3 } = dealCard(deck2);
    const { card: dealerCard2, newDeck: finalDeck } = dealCard(deck3);
    
    if (!playerCard1 || !playerCard2 || !dealerCard1 || !dealerCard2) return;
    
    const newPlayerHand = [playerCard1, playerCard2];
    const newDealerHand = [dealerCard1, dealerCard2];
    
    setDeck(finalDeck);
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameState('playing');
    setShowDealerCard(false);
    setCanDouble(true);
    setDealerProgress(0);
    
    const playerTotal = calculateScore(newPlayerHand);
    setPlayerScore(playerTotal);
    setDealerScore(calculateScore([dealerCard1])); // Only show first card
    
    if (playerTotal === 21) {
      setMessage('Blackjack! Checking dealer...');
      setTimeout(() => checkForBlackjack(newPlayerHand, newDealerHand), 1000);
    } else {
      setMessage('Your turn! Hit, Stand, or Double Down?');
    }
  };

  const checkForBlackjack = (playerCards: PlayingCard[], dealerCards: PlayingCard[]) => {
    const playerTotal = calculateScore(playerCards);
    const dealerTotal = calculateScore(dealerCards);
    
    setShowDealerCard(true);
    setDealerScore(dealerTotal);
    
    if (playerTotal === 21 && dealerTotal === 21) {
      setMessage('Both have Blackjack! It\'s a push.');
      setGameState('finished');
    } else if (playerTotal === 21) {
      setMessage('Blackjack! You win!');
      setGameState('finished');
    } else {
      dealerTurn(dealerCards);
    }
  };

  const hit = () => {
    const { card, newDeck } = dealCard(deck);
    if (!card) return;
    
    const newPlayerHand = [...playerHand, card];
    const newScore = calculateScore(newPlayerHand);
    
    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setPlayerScore(newScore);
    setCanDouble(false);
    
    if (newScore > 21) {
      setMessage('Bust! You lose.');
      setShowDealerCard(true);
      setDealerScore(calculateScore(dealerHand));
      setGameState('finished');
    } else if (newScore === 21) {
      setMessage('21! Standing...');
      setTimeout(() => dealerTurn(dealerHand), 1000);
    } else {
      setMessage('Hit or Stand?');
    }
  };

  const stand = () => {
    setCanDouble(false);
    setMessage('Standing. Dealer\'s turn...');
    setTimeout(() => dealerTurn(dealerHand), 1000);
  };

  const double = () => {
    const { card, newDeck } = dealCard(deck);
    if (!card) return;
    
    const newPlayerHand = [...playerHand, card];
    const newScore = calculateScore(newPlayerHand);
    
    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setPlayerScore(newScore);
    setCanDouble(false);
    
    if (newScore > 21) {
      setMessage('Bust! You lose. (Double bet lost)');
      setShowDealerCard(true);
      setDealerScore(calculateScore(dealerHand));
      setGameState('finished');
    } else {
      setMessage('Doubled down! Dealer\'s turn...');
      setTimeout(() => dealerTurn(dealerHand), 1500);
    }
  };

  const dealerTurn = async (currentDealerHand: PlayingCard[]) => {
    setGameState('dealer-turn');
    setShowDealerCard(true);
    setMessage('Dealer is playing...');
    
    let dealerCards = [...currentDealerHand];
    let dealerTotal = calculateScore(dealerCards);
    let currentDeck = [...deck];
    setDealerScore(dealerTotal);
    
    // Animate dealer progress
    setDealerProgress(25);
    
    while (dealerTotal < 17) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { card, newDeck } = dealCard(currentDeck);
      if (!card) break;
      
      dealerCards = [...dealerCards, card];
      dealerTotal = calculateScore(dealerCards);
      currentDeck = newDeck;
      
      setDealerHand(dealerCards);
      setDealerScore(dealerTotal);
      setDealerProgress(prev => Math.min(prev + 25, 100));
    }
    
    setDealerProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Determine winner
    if (dealerTotal > 21) {
      setMessage('Dealer busts! You win!');
    } else if (dealerTotal > playerScore) {
      setMessage('Dealer wins!');
    } else if (playerScore > dealerTotal) {
      setMessage('You win!');
    } else {
      setMessage('Push! It\'s a tie.');
    }
    
    setGameState('finished');
  };

  const getCardDisplay = (card: PlayingCard) => {
    return `${card.rank}${card.suit}`;
  };

  const resetToNewGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerScore(0);
    setDealerScore(0);
    setGameState('betting');
    setMessage('Place your bet and start the game!');
    setCanDouble(false);
    setShowDealerCard(false);
    setDealerProgress(0);
  };

  useEffect(() => {
    if (gameId) {
      startGame();
    }
  }, [gameId]);

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
        🃏 BLACKJACK
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
            <strong>Demo Bet: {betAmount} tokens</strong>
          </Box>
        </Alert>
      )}

      {/* Dealer Section */}
      <Paper
        elevation={8}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)`,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          borderRadius: 3,
        }}
      >
        <Typography 
          variant="h6" 
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            color: theme.palette.secondary.main,
            mb: 2,
          }}
        >
          DEALER ({showDealerCard ? dealerScore : '?'})
        </Typography>
        
        {gameState === 'dealer-turn' && (
          <LinearProgress 
            variant="determinate" 
            value={dealerProgress} 
            sx={{ mb: 2, height: 8, borderRadius: 4 }}
          />
        )}
        
        <Grid container spacing={1}>
          {dealerHand.map((card, index) => (
            <Grid item key={index}>
              <Card
                sx={{
                  width: 80,
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: index === 1 && !showDealerCard ? 
                    'linear-gradient(45deg, #333, #666)' :
                    'linear-gradient(45deg, #f5f5f5, #fff)',
                  color: index === 1 && !showDealerCard ? 
                    '#fff' :
                    (card.suit === '♥️' || card.suit === '♦️') ? '#d32f2f' : '#000',
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {index === 1 && !showDealerCard ? '🂠' : getCardDisplay(card)}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Player Section */}
      <Paper
        elevation={8}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
        }}
      >
        <Typography 
          variant="h6" 
          sx={{
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            color: theme.palette.primary.main,
            mb: 2,
          }}
        >
          PLAYER ({playerScore})
        </Typography>
        
        <Grid container spacing={1}>
          {playerHand.map((card, index) => (
            <Grid item key={index}>
              <Card
                sx={{
                  width: 80,
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(45deg, #f5f5f5, #fff)',
                  color: (card.suit === '♥️' || card.suit === '♦️') ? '#d32f2f' : '#000',
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {getCardDisplay(card)}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Game Status */}
      <Alert 
        severity={gameState === 'finished' ? 
          (message.includes('win') ? 'success' : message.includes('lose') || message.includes('Bust') ? 'error' : 'info') : 
          'info'
        }
        sx={{ 
          mb: 3,
          '& .MuiAlert-message': {
            fontFamily: '"Orbitron", monospace',
            fontWeight: 600,
            fontSize: '1.1rem',
          },
        }}
      >
        {message}
      </Alert>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {gameState === 'betting' && (
          <Button
            variant="contained"
            size="large"
            startIcon={<Casino />}
            onClick={startGame}
            sx={{
              px: 4,
              py: 1.5,
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            DEAL CARDS
          </Button>
        )}

        {gameState === 'playing' && (
          <>
            <Button
              variant="contained"
              onClick={hit}
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                background: theme.palette.success.main,
                '&:hover': { background: theme.palette.success.dark },
              }}
            >
              HIT
            </Button>
            
            <Button
              variant="contained"
              onClick={stand}
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                background: theme.palette.warning.main,
                color: '#000',
                '&:hover': { background: theme.palette.warning.dark },
              }}
            >
              STAND
            </Button>
            
            {canDouble && (
              <Button
                variant="contained"
                onClick={double}
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 600,
                  background: theme.palette.error.main,
                  '&:hover': { background: theme.palette.error.dark },
                }}
              >
                DOUBLE
              </Button>
            )}
          </>
        )}

        {gameState === 'finished' && (
          <Button
            variant="contained"
            size="large"
            startIcon={<Refresh />}
            onClick={resetToNewGame}
            sx={{
              px: 4,
              py: 1.5,
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            NEW GAME
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BlackjackBoard; 