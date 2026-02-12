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
  FormControlLabel,
  Checkbox,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  PersonAdd,
  AccountCircle,
} from '@mui/icons-material';

interface SignUpProps {
  onSwitchToSignIn: () => void;
  onSignUpSuccess: (userData: any) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn, onSignUpSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      throw new Error('Please fill in all fields');
    }

    if (formData.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (!acceptTerms) {
      throw new Error('Please accept the terms and conditions');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      validateForm();

      // Check if user already exists in localStorage
      const existingUsersJson = localStorage.getItem('fairchain-users') || '[]';
      const existingUsers = JSON.parse(existingUsersJson);
      
      // Check for duplicate email or username
      const emailExists = existingUsers.find((user: any) => user.email.toLowerCase() === formData.email.toLowerCase());
      const usernameExists = existingUsers.find((user: any) => user.username.toLowerCase() === formData.username.toLowerCase());
      
      if (emailExists) {
        throw new Error('An account with this email already exists');
      }
      
      if (usernameExists) {
        throw new Error('This username is already taken');
      }

      // Create new user data
      const userData = {
        id: Date.now().toString(),
        userId: Date.now().toString(),
        email: formData.email,
        username: formData.username,
        password: formData.password, // In a real app, this would be hashed
        level: 1,
        gamesPlayed: 0,
        winRate: 0,
        createdAt: new Date().toISOString(),
      };

      // Add user to localStorage
      const updatedUsers = [...existingUsers, userData];
      localStorage.setItem('fairchain-users', JSON.stringify(updatedUsers));
      
      // Store current user session
      localStorage.setItem('fairchain-current-user', JSON.stringify({
        id: userData.id,
        userId: userData.userId,
        email: userData.email,
        username: userData.username,
        level: userData.level,
        gamesPlayed: userData.gamesPlayed,
        winRate: userData.winRate,
      }));

      setTimeout(() => {
        onSignUpSuccess({
          id: userData.id,
          userId: userData.userId,
          email: userData.email,
          username: userData.username,
          level: userData.level,
          gamesPlayed: userData.gamesPlayed,
          winRate: userData.winRate,
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign up failed');
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
          maxWidth: 500,
          width: '100%',
          background: `
            radial-gradient(circle at center, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%),
            linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          borderRadius: 4,
          boxShadow: `0 0 50px ${alpha(theme.palette.secondary.main, 0.2)}`,
        }}
        className="cyber-border"
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccountCircle 
            sx={{ 
              fontSize: 60, 
              color: theme.palette.secondary.main,
              filter: `drop-shadow(0 0 20px ${theme.palette.secondary.main})`,
              mb: 2,
            }} 
          />
          <Typography 
            variant="h4"
            sx={{
              fontFamily: '"Orbitron", monospace',
              fontWeight: 800,
              letterSpacing: '0.02em',
              color: theme.palette.secondary.main,
              textShadow: `2px 2px 4px ${alpha(theme.palette.secondary.main, 0.3)}`,
              mb: 1,
            }}
            className="neon-text"
          >
            JOIN FAIRCHAIN
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontFamily: '"Roboto", sans-serif',
              fontWeight: 500,
            }}
          >
            Become a cyber gaming champion
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              background: `linear-gradient(135deg, rgba(220, 20, 60, 0.1) 0%, rgba(220, 20, 60, 0.05) 100%)`,
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

        {/* Sign Up Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="USERNAME"
            value={formData.username}
            onChange={handleInputChange('username')}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person sx={{ color: theme.palette.secondary.main }} />
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
            label="EMAIL ADDRESS"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: theme.palette.secondary.main }} />
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
            value={formData.password}
            onChange={handleInputChange('password')}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: theme.palette.secondary.main }} />
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
            label="CONFIRM PASSWORD"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: theme.palette.secondary.main }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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

          <FormControlLabel
            control={
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                sx={{
                  color: theme.palette.secondary.main,
                  '&.Mui-checked': {
                    color: theme.palette.secondary.main,
                  },
                }}
              />
            }
            label={
              <Typography 
                variant="body2" 
                sx={{
                  fontFamily: '"Roboto", sans-serif',
                  fontWeight: 500,
                }}
              >
                I agree to the{' '}
                <Link
                  href="#"
                  sx={{
                    color: theme.palette.secondary.main,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontFamily: '"Orbitron", monospace',
                    '&:hover': {
                      textDecoration: 'underline',
                      textShadow: `0 0 5px ${theme.palette.secondary.main}`,
                    },
                  }}
                >
                  Terms & Conditions
                </Link>
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            startIcon={<PersonAdd />}
            sx={{
              py: 1.5,
              mb: 3,
              fontFamily: '"Orbitron", monospace',
              fontWeight: 700,
              letterSpacing: '0.02em',
              background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              backgroundSize: '200% 200%',
              boxShadow: `0 0 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
              '&:hover': {
                boxShadow: `0 0 30px ${alpha(theme.palette.secondary.main, 0.6)}`,
                transform: 'translateY(-2px)',
              },
              '&:disabled': {
                opacity: 0.7,
                background: theme.palette.action.disabledBackground,
              },
            }}
          >
            {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
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
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={onSwitchToSignIn}
                sx={{
                  color: theme.palette.secondary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontFamily: '"Orbitron", monospace',
                  '&:hover': {
                    textDecoration: 'underline',
                    textShadow: `0 0 5px ${theme.palette.secondary.main}`,
                  },
                }}
              >
                SIGN IN
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignUp; 