import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login,
  AccountCircle,
} from '@mui/icons-material';

interface SignInProps {
  onSwitchToSignUp: () => void;
  onSignInSuccess: (userData: any) => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitchToSignUp, onSignInSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      // Get users from localStorage
      const existingUsersJson = localStorage.getItem('fairchain-users') || '[]';
      const existingUsers = JSON.parse(existingUsersJson);
      
      // Find user by email
      const user = existingUsers.find((user: any) => 
        user.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!user) {
        throw new Error('No account found with this email address');
      }
      
      // Check password (in a real app, this would compare hashed passwords)
      if (user.password !== password) {
        throw new Error('Incorrect password');
      }

      // Store current user session
      const sessionData = {
        id: user.id,
        userId: user.userId,
        email: user.email,
        username: user.username,
        level: user.level,
        gamesPlayed: user.gamesPlayed,
        winRate: user.winRate,
      };
      
      localStorage.setItem('fairchain-current-user', JSON.stringify(sessionData));

      setTimeout(() => {
        onSignInSuccess(sessionData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed');
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 50%),
          linear-gradient(135deg, rgba(10, 10, 15, 0.9) 0%, rgba(26, 26, 46, 0.8) 50%, rgba(22, 33, 62, 0.9) 100%)
        `,
        p: 3,
      }}
      className="gaming-gradient-bg"
    >
      <Paper
        elevation={20}
        sx={{
          p: 4,
          maxWidth: 450,
          width: '100%',
          background: `
            radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%),
            linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 4,
          boxShadow: `0 0 50px ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
        className="cyber-border"
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccountCircle 
            sx={{ 
              fontSize: 60, 
              color: theme.palette.primary.main,
              filter: `drop-shadow(0 0 20px ${theme.palette.primary.main})`,
              mb: 2,
            }} 
          />
          <Typography 
            variant="h4"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: theme.palette.primary.main,
              textShadow: `2px 2px 4px ${alpha(theme.palette.primary.main, 0.3)}`,
              mb: 1,
            }}
            className="neon-text"
          >
            WELCOME BACK
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontFamily: '"Roboto", sans-serif',
              fontWeight: 500,
            }}
          >
            Enter the cyber gaming realm
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              background: `linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)`,
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontFamily: '"Orbitron", monospace',
                fontWeight: 500,
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Sign In Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="EMAIL ADDRESS"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiInputLabel-root': {
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
              },
              '& .MuiInputBase-input': {
                fontFamily: '"Orbitron", monospace',
                fontWeight: 500,
              },
            }}
          />

          <TextField
            fullWidth
            label="PASSWORD"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: theme.palette.primary.main }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiInputLabel-root': {
                fontFamily: '"Orbitron", monospace',
                fontWeight: 600,
              },
              '& .MuiInputBase-input': {
                fontFamily: '"Orbitron", monospace',
                fontWeight: 500,
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            startIcon={<Login />}
            sx={{
              py: 1.5,
              mb: 3,
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundSize: '200% 200%',
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.6)}`,
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                opacity: 0.7,
                background: theme.palette.action.disabledBackground,
              },
            }}
          >
            {isLoading ? 'LOGGING IN...' : 'LOG IN'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontFamily: '"Roboto", sans-serif',
                fontWeight: 500,
              }}
            >
              New to FairChain?{' '}
              <Link
                component="button"
                type="button"
                onClick={onSwitchToSignUp}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontFamily: '"Orbitron", monospace',
                  '&:hover': {
                    textDecoration: 'underline',
                    textShadow: `0 0 5px ${theme.palette.primary.main}`,
                  },
                }}
              >
                SIGN UP
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignIn; 