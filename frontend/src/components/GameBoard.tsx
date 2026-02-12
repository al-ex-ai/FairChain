import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Button, useTheme, alpha } from '@mui/material';
import { SportsEsports, Refresh, EmojiEvents } from '@mui/icons-material';
import { useGame } from '../contexts/GameContext';
import GameSetupDialog from './GameSetupDialog';
import PayoutDialog from './PayoutDialog';

const GameBoard: React.FC = () => {
  const { 
    board, 
    makeMove, 
    winner, 
    isGameOver, 
    isProcessing, 
    startNewGame, 
    gameId, 
    betAmount, 
    escrowAccount, 
    showPayoutDialog, 
    closePayoutDialog 
  } = useGame();
  const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false);
  const theme = useTheme();

  const handleStartNewGame = async (difficulty: string, betAmount: string, escrowAccount?: string, gameId?: string) => {
    await startNewGame(difficulty, betAmount, escrowAccount, gameId);
    setIsSetupDialogOpen(false);
  };

  const getSquareColor = (value: string) => {
    if (value === 'X') return theme.palette.primary.main;
    if (value === 'O') return theme.palette.secondary.main;
    return theme.palette.background.paper;
  };

  const renderSquare = (index: number) => {
    const value = board[index];
    const isEmpty = !value;
    
    return (
      <Paper
        sx={{
          width: '100%',
          paddingBottom: '100%',
          position: 'relative',
          cursor: isEmpty && !isGameOver ? 'pointer' : 'default',
          opacity: isProcessing ? 0.7 : 1,
          background: isEmpty ? `
            radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%),
            linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
          ` : `
            radial-gradient(circle at center, ${alpha(getSquareColor(value), 0.1)} 0%, transparent 70%),
            linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
          `,
          backdropFilter: 'blur(10px)',
          border: `2px solid ${alpha(theme.palette.primary.main, isEmpty ? 0.3 : 0.6)}`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': isEmpty && !isGameOver ? {
            border: `2px solid ${alpha(theme.palette.primary.main, 0.8)}`,
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            transform: 'translateY(-2px)',
          } : {},
        }}
        elevation={value ? 8 : 4}
        onClick={() => isEmpty && !isGameOver && makeMove(index)}
        className="cyber-border"
      >
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
            fontSize: { xs: '2.5rem', sm: '3rem' },
            fontWeight: 900,
            fontFamily: '"Orbitron", monospace',
            color: isEmpty ? theme.palette.text.disabled : getSquareColor(value),
            textShadow: value ? `0 0 20px ${getSquareColor(value)}` : 'none',
            letterSpacing: '0.05em',
            transition: 'all 0.3s ease',
          }}
          className={value ? "neon-text" : ""}
        >
          {value}
        </Box>
      </Paper>
    );
  };

  const getWinnerColor = () => {
    if (winner === 'X') return theme.palette.primary.main;
    if (winner === 'O') return theme.palette.secondary.main;
    return theme.palette.warning.main;
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        maxWidth: 500, 
        margin: '0 auto',
        p: 3,
      }}
    >
      {/* Game Status */}
      {(winner || isGameOver) && (
        <Paper
          elevation={12}
          sx={{
            mb: 4,
            p: 4,
            textAlign: 'center',
            background: `
              radial-gradient(circle at center, ${alpha(getWinnerColor(), 0.15)} 0%, transparent 70%),
              linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
            `,
            backdropFilter: 'blur(15px)',
            border: `2px solid ${alpha(getWinnerColor(), 0.4)}`,
            borderRadius: 4,
            boxShadow: `0 0 30px ${alpha(getWinnerColor(), 0.3)}`,
          }}
          className="cyber-border"
        >
          <Box sx={{ mb: 3 }}>
            <EmojiEvents 
              sx={{ 
                fontSize: 60, 
                color: getWinnerColor(),
                filter: `drop-shadow(0 0 20px ${getWinnerColor()})`,
                mb: 2,
              }} 
            />
          </Box>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: getWinnerColor(),
              textShadow: `0 0 20px ${getWinnerColor()}`,
            }}
            className="neon-text"
          >
            {winner === 'draw' ? "IT'S A DRAW!" : winner ? `${winner} WINS!` : 'GAME OVER'}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            {winner === 'draw' 
              ? "Well played! It's a strategic tie." 
              : winner 
                ? `Congratulations! ${winner} dominated the board.`
                : "Game completed. Ready for another round?"
            }
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Refresh />}
            onClick={() => setIsSetupDialogOpen(true)}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundSize: '200% 200%',
              animation: 'gradient-shift 3s ease infinite',
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.6)}`,
                transform: 'translateY(-2px) scale(1.02)',
              },
            }}
          >
            NEW GAME
          </Button>
        </Paper>
      )}

      {/* Current Player Indicator */}
      {!isGameOver && !winner && (
        <Paper
          elevation={6}
          sx={{
            mb: 3,
            p: 2,
            textAlign: 'center',
            background: `
              radial-gradient(circle at center, ${alpha(theme.palette.info.main, 0.1)} 0%, transparent 70%),
              linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
            `,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            borderRadius: 3,
          }}
        >
          <Typography 
            variant="h6"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: theme.palette.info.main,
            }}
          >
            {isProcessing ? 'AI THINKING...' : 'YOUR TURN'}
          </Typography>
        </Paper>
      )}

      {/* Game Board */}
      <Paper
        elevation={16}
        sx={{
          p: 3,
          background: `
            radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 80%),
            linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 4,
          boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
        className="cyber-border"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <SportsEsports 
            sx={{ 
              fontSize: 30, 
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 0 10px ${theme.palette.primary.main})`,
              mr: 1,
            }} 
          />
          <Typography 
            variant="h6"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: theme.palette.primary.main,
            }}
          >
            TIC-TAC-TOE ARENA
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          {[0, 1, 2].map((row) => (
            <Grid container item spacing={2} key={row}>
              {[0, 1, 2].map((col) => (
                <Grid item xs={4} key={col}>
                  {renderSquare(row * 3 + col)}
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Game Info */}
      <Paper
        elevation={4}
        sx={{
          mt: 3,
          p: 2,
          background: `
            linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(22, 33, 62, 0.8) 100%)
          `,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h5"
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  textShadow: `0 0 10px ${theme.palette.primary.main}`,
                }}
              >
                X
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PLAYER
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h5"
                sx={{
                  fontFamily: '"Orbitron", monospace',
                  fontWeight: 700,
                  color: theme.palette.secondary.main,
                  textShadow: `0 0 10px ${theme.palette.secondary.main}`,
                }}
              >
                O
              </Typography>
              <Typography variant="caption" color="text.secondary">
                AI OPPONENT
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <GameSetupDialog
        open={isSetupDialogOpen}
        onClose={() => setIsSetupDialogOpen(false)}
        onStartGame={handleStartNewGame}
        selectedGame="tic-tac-toe"
      />

      {/* Payout Dialog for Betting Games */}
      {showPayoutDialog && gameId && winner && escrowAccount && betAmount && (winner === 'X' || winner === 'draw') && (
        <PayoutDialog
          open={showPayoutDialog}
          onClose={closePayoutDialog}
          winner={winner}
          escrowAccount={escrowAccount}
          betAmount={betAmount}
          gameType="tic-tac-toe"
          gameId={gameId}
        />
      )}
    </Box>
  );
};

export default GameBoard; 