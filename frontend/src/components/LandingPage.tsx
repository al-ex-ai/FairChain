import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Paper,
  Chip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Fade,
} from '@mui/material';
import {
  Casino,
  SportsEsports,
  EmojiEvents,
  Security,
  TrendingUp,
  PlayArrow,
  Bolt,
  Shield,
  Stars,
  AccountBalanceWallet,
  Speed,
  CheckCircle,
  ArrowBackIos,
  ArrowForwardIos,
  CurrencyExchange,
  Public,
  Verified,
} from '@mui/icons-material';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  players: string;
  status: 'available' | 'coming-soon';
  image?: string;
}

interface LandingPageProps {
  onGameSelect: (gameId: string) => void;
}

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  onPlay: () => void;
  features: string[];
  disabled?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, onPlay, features, disabled = false }) => {
  const theme = useTheme();
  
  return (
    <Card
      elevation={12}
      sx={{
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        background: `
          radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%),
          linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
        `,
        backdropFilter: 'blur(15px)',
        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        borderRadius: 4,
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.6 : 1,
        '&:hover': !disabled ? {
          transform: 'translateY(-8px) scale(1.02)',
          border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.3)}`,
        } : {},
      }}
      className="cyber-border"
    >
      <CardActionArea 
        onClick={!disabled ? onPlay : undefined}
        disabled={disabled}
        sx={{ 
          height: '100%', 
          p: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <CardContent sx={{ 
          textAlign: 'center', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1,
          p: 0
        }}>
          <Typography variant="h1" sx={{ mb: 2, fontSize: '3rem' }}>
            {icon}
          </Typography>
          
          <Typography 
            variant="h5" 
            component="h3" 
            gutterBottom
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: theme.palette.primary.main,
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            paragraph
            sx={{ 
              flexGrow: 1, 
              lineHeight: 1.6,
              mb: 2,
              minHeight: '80px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            {description}
          </Typography>
          
          <Box sx={{ 
            mb: 2,
            minHeight: '80px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignContent: 'flex-start',
            gap: 0.5
          }}>
            {features.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
                sx={{
                  m: 0.25,
                  fontFamily: '"Orbitron", monospace',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ mt: 'auto' }}>
            <Chip
              label={disabled ? 'COMING SOON' : 'PLAY NOW'}
              color={disabled ? 'default' : 'primary'}
              variant={disabled ? 'outlined' : 'filled'}
              sx={{
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
                letterSpacing: '0.02em',
                ...(!disabled && {
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  '&:hover': {
                    boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.5)}`,
                  },
                }),
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

// Slideshow Component
interface SlideData {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const Slideshow: React.FC = () => {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SlideData[] = [
    {
      title: "BLOCKCHAIN GAMING REVOLUTION",
      description: "Experience true ownership of in-game assets with blockchain technology. Every item, every win, every achievement is verifiably yours.",
      icon: <Public sx={{ fontSize: 80, filter: 'drop-shadow(0 0 20px currentColor)' }} />,
      color: theme.palette.primary.main,
      features: ["True Asset Ownership", "Cross-Game Items", "Provably Fair", "Decentralized"]
    },
    {
      title: "STELLAR NETWORK POWERED",
      description: "Built on Stellar's fast and eco-friendly blockchain. Enjoy instant transactions with minimal fees while gaming.",
      icon: <Stars sx={{ fontSize: 80, filter: 'drop-shadow(0 0 20px currentColor)' }} />,
      color: theme.palette.warning.main,
      features: ["Lightning Fast", "Low Fees", "Eco-Friendly", "Global Access"]
    },
    {
      title: "SECURE & TRANSPARENT",
      description: "Every game outcome is cryptographically verifiable. No hidden algorithms, no unfair advantages - just pure skill and luck.",
      icon: <Verified sx={{ fontSize: 80, filter: 'drop-shadow(0 0 20px currentColor)' }} />,
      color: theme.palette.success.main,
      features: ["Provably Fair", "Open Source", "Audited Smart Contracts", "Community Verified"]
    },
    {
      title: "EARN REAL REWARDS",
      description: "Win cryptocurrency rewards that you can use anywhere. Your gaming skills now have real-world value.",
      icon: <CurrencyExchange sx={{ fontSize: 80, filter: 'drop-shadow(0 0 20px currentColor)' }} />,
      color: theme.palette.secondary.main,
      features: ["XLM Rewards", "Instant Payouts", "No Withdrawal Limits", "Real Value"]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '500px',
        overflow: 'hidden',
        borderRadius: 4,
        background: `
          radial-gradient(circle at center, ${alpha(slides[currentSlide].color, 0.1)} 0%, transparent 70%),
          linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
        `,
        backdropFilter: 'blur(15px)',
        border: `2px solid ${alpha(slides[currentSlide].color, 0.3)}`,
        boxShadow: `0 0 40px ${alpha(slides[currentSlide].color, 0.2)}`,
      }}
      className="cyber-border"
    >
      {slides.map((slide, index) => (
        <Fade in={index === currentSlide} timeout={1000} key={index}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
              visibility: index === currentSlide ? 'visible' : 'hidden',
            }}
          >
            <Box sx={{ maxWidth: 600 }}>
              <Box sx={{ color: slide.color, mb: 3 }}>
                {slide.icon}
              </Box>
              
              <Typography
                variant="h3"
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  color: slide.color,
                  mb: 3,
                  textShadow: `0 0 20px ${alpha(slide.color, 0.5)}`,
                }}
              >
                {slide.title}
              </Typography>
              
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 4,
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                {slide.description}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                {slide.features.map((feature, featureIndex) => (
                  <Chip
                    key={featureIndex}
                    label={feature}
                    variant="outlined"
                    sx={{
                      fontFamily: '"Orbitron", monospace',
                      fontWeight: 600,
                      borderColor: slide.color,
                      color: slide.color,
                      '&:hover': {
                        background: alpha(slide.color, 0.1),
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Fade>
      ))}
      
      {/* Navigation Arrows */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          background: alpha(slides[currentSlide].color, 0.2),
          color: slides[currentSlide].color,
          '&:hover': {
            background: alpha(slides[currentSlide].color, 0.3),
            boxShadow: `0 0 15px ${alpha(slides[currentSlide].color, 0.4)}`,
          },
        }}
      >
        <ArrowBackIos />
      </IconButton>
      
      <IconButton
        onClick={nextSlide}
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          background: alpha(slides[currentSlide].color, 0.2),
          color: slides[currentSlide].color,
          '&:hover': {
            background: alpha(slides[currentSlide].color, 0.3),
            boxShadow: `0 0 15px ${alpha(slides[currentSlide].color, 0.4)}`,
          },
        }}
      >
        <ArrowForwardIos />
      </IconButton>
      
      {/* Slide Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: index === currentSlide 
                ? slides[currentSlide].color 
                : alpha(slides[currentSlide].color, 0.3),
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: `1px solid ${slides[currentSlide].color}`,
              '&:hover': {
                transform: 'scale(1.2)',
                boxShadow: `0 0 10px ${alpha(slides[currentSlide].color, 0.6)}`,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGameSelect }) => {
  const theme = useTheme();
  const gamesRef = useRef<HTMLDivElement>(null);

  const scrollToGames = () => {
    gamesRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const games: Game[] = [
    {
      id: 'tic-tac-toe',
      name: 'Tic-Tac-Toe',
      description: 'Classic strategy game with AI opponent. Test your skills in this timeless battle of wits.',
      icon: <SportsEsports sx={{ fontSize: 50, color: theme.palette.primary.main, filter: 'drop-shadow(0 0 10px currentColor)' }} />,
      players: '1v1 vs AI',
      status: 'available',
    },
    {
      id: 'poker',
      name: 'Crypto Poker',
      description: 'Provably fair poker with smart contract betting. Coming soon to FairChain.',
      icon: <Casino sx={{ fontSize: 50, color: theme.palette.secondary.main, filter: 'drop-shadow(0 0 10px currentColor)' }} />,
      players: '2-8 Players',
      status: 'coming-soon',
    },
    {
      id: 'blackjack',
      name: 'Blockchain Blackjack',
      description: 'Beat the dealer in this classic card game with cryptocurrency betting.',
      icon: <TrendingUp sx={{ fontSize: 50, color: theme.palette.success.main, filter: 'drop-shadow(0 0 10px currentColor)' }} />,
      players: '1v1 vs Dealer',
      status: 'coming-soon',
    },
    {
      id: 'rock-paper-scissors',
      name: 'Rock Paper Scissors',
      description: 'Classic hand game - Rock beats Scissors, Scissors beats Paper, Paper beats Rock',
      icon: '🪨📄✂️',
      players: '1v1 vs AI',
      status: 'available',
    },
    {
      id: 'coin-flip',
      name: 'Coin Flip',
      description: 'Simple heads or tails betting game with instant results',
      icon: '🪙',
      players: '1v1 vs AI',
      status: 'available',
    },
    {
      id: 'dice-roll',
      name: 'Dice Roll',
      description: 'Predict the dice roll outcome. Choose your number and roll for instant wins!',
      icon: '🎲',
      players: '1v1 vs AI',
      status: 'available',
    },
  ];

  const features = [
    {
      icon: <Shield sx={{ fontSize: 40, filter: 'drop-shadow(0 0 10px currentColor)' }} />,
      title: 'Provably Fair',
      description: 'Blockchain-powered transparency ensures every game is fair',
      color: theme.palette.primary.main,
    },
    {
      icon: <Bolt sx={{ fontSize: 40, filter: 'drop-shadow(0 0 10px currentColor)' }} />,
      title: 'Multi-Chain Support',
      description: 'Connect with multiple blockchains for fast, low-cost transactions',
      color: theme.palette.warning.main,
    },
    {
      icon: <Stars sx={{ fontSize: 40, filter: 'drop-shadow(0 0 10px currentColor)' }} />,
      title: 'Win Rewards',
      description: 'Compete and earn rewards in a decentralized gaming ecosystem',
      color: theme.palette.success.main,
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          px: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontFamily: '"Courier New", monospace',
            fontWeight: 900,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem', lg: '6rem' },
            color: '#00ff41',
            textShadow: `
               0 0 5px #00ff41,
               0 0 10px #00ff41,
               0 0 20px #00ff41,
               0 0 40px #00ff41
             `,
            mb: 2,
            letterSpacing: '0.15em',
            position: 'relative',
            '@keyframes matrix-flicker': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 0.7 },
            },
            '&::before': {
              content: '"[FAIR][CHAIN]"',
              position: 'absolute',
              top: 0,
              left: 0,
              color: 'rgba(0, 255, 65, 0.3)',
              fontSize: '0.9em',
              animation: 'matrix-flicker 2s infinite',
            },
          }}
        >
          F▲I®☾H▲IN
        </Typography>
        
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 600,
            fontSize: { xs: '1.2rem', sm: '1.6rem', md: '2rem' },
            color: '#ffffff',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6)',
            mb: 3,
            maxWidth: '800px',
            letterSpacing: '0.02em',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          THE FUTURE OF BLOCKCHAIN GAMING
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrow />}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.2rem',
            borderRadius: 4,
            fontFamily: '"Orbitron", monospace',
            fontWeight: 700,
            letterSpacing: '0.02em',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 3s ease infinite',
            boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': {
              boxShadow: `0 0 50px ${alpha(theme.palette.primary.main, 0.6)}, 0 0 70px ${alpha(theme.palette.secondary.main, 0.4)}`,
              transform: 'translateY(-3px) scale(1.02)',
            },
          }}
          onClick={scrollToGames}
        >
          START PLAYING
        </Button>
      </Box>

      {/* Blockchain Gaming Slideshow */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          gutterBottom 
          sx={{ 
            textAlign: 'center',
            mb: 6,
            fontFamily: '"Orbitron", monospace',
            fontWeight: 800,
            letterSpacing: '0.02em',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          className="neon-text"
        >
          BLOCKCHAIN GAMING REVOLUTION
        </Typography>
        <Slideshow />
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          gutterBottom 
          sx={{ 
            textAlign: 'center',
            mb: 8,
            fontFamily: '"Orbitron", monospace',
            fontWeight: 800,
            letterSpacing: '0.02em',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          className="neon-text"
        >
          WHY CHOOSE FAIRCHAIN?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  background: `
                    radial-gradient(circle at center, ${alpha(feature.color, 0.1)} 0%, transparent 70%),
                    linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
                  `,
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${alpha(feature.color, 0.3)}`,
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    border: `2px solid ${alpha(feature.color, 0.6)}`,
                    boxShadow: `0 0 40px ${alpha(feature.color, 0.4)}`,
                  },
                }}
                className="cyber-border"
              >
                <Box sx={{ color: feature.color, mb: 3 }}>
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{
                    fontFamily: '"Orbitron", monospace',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    color: feature.color,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Games Section */}
      <Box ref={gamesRef} sx={{ py: 10, bgcolor: alpha(theme.palette.background.paper, 0.02) }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom 
            sx={{ 
              textAlign: 'center',
              mb: 8,
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.success.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            className="neon-text"
          >
            FEATURED GAMES
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <GameCard
                title="Tic-Tac-Toe"
                description="Classic strategy game against AI"
                icon="🎯"
                onPlay={() => onGameSelect('tic-tac-toe')}
                features={['AI Opponent', 'Multiple Difficulties', 'Quick Games']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <GameCard
                title="Blackjack"
                description="Beat the dealer in this casino classic"
                icon="🃏"
                onPlay={() => onGameSelect('blackjack')}
                features={['AI Dealer', 'Standard Rules', 'Hit/Stand/Double']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <GameCard
                title="Rock Paper Scissors"
                description="Classic hand game - Rock beats Scissors, Scissors beats Paper, Paper beats Rock"
                icon="🪨📄✂️"
                onPlay={() => onGameSelect('rock-paper-scissors')}
                features={['Best of 5 rounds', 'Strategic AI opponents', 'Perfect for betting', 'Clear win/lose outcomes']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <GameCard
                title="Coin Flip"
                description="Simple heads or tails betting game with instant results"
                icon="🪙"
                onPlay={() => onGameSelect('coin-flip')}
                features={['Best of 3 rounds', 'Pure chance game', 'Instant results', 'Perfect for quick bets']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <GameCard
                title="Dice Roll"
                description="Predict the dice roll outcome. Choose your number and roll for instant wins!"
                icon="🎲"
                onPlay={() => onGameSelect('dice-roll')}
                features={['Pure chance game', 'Instant results', 'Perfect for quick bets']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <GameCard
                title="Coming Soon"
                description="More games in development"
                icon="🚀"
                onPlay={() => {}}
                features={['Poker', 'Roulette', 'Dice Games']}
                disabled
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: 10, textAlign: 'center' }}>
        <Container maxWidth="md">
          <EmojiEvents 
            sx={{ 
              fontSize: 80, 
              color: theme.palette.warning.main,
              filter: `drop-shadow(0 0 30px ${theme.palette.warning.main})`,
              mb: 4,
            }} 
          />
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: theme.palette.warning.main,
              mb: 3,
            }}
            className="neon-text"
          >
            READY TO WIN?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{ 
              mb: 6,
              lineHeight: 1.7,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join thousands of players in the future of blockchain gaming. 
            Connect your wallet, choose your blockchain, and start earning rewards today.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={scrollToGames}
            sx={{
              px: 8,
              py: 2.5,
              fontSize: '1.3rem',
              borderRadius: 4,
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.success.main})`,
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite',
              boxShadow: `0 0 40px ${alpha(theme.palette.warning.main, 0.4)}`,
              '&:hover': {
                boxShadow: `0 0 60px ${alpha(theme.palette.warning.main, 0.6)}, 0 0 80px ${alpha(theme.palette.success.main, 0.4)}`,
                transform: 'translateY(-3px) scale(1.05)',
              },
            }}
          >
            JOIN THE GAME
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 