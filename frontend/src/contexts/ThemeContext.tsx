import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

interface ThemeContextType {
  // Removed isDarkMode and toggleTheme since we're using a single gaming theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Cyber Gaming Theme
  const gamingTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#00ffff', // Cyan
        light: '#4fffff',
        dark: '#00cccc',
        contrastText: '#000014',
      },
      secondary: {
        main: '#ff0080', // Hot Pink
        light: '#ff4da6',
        dark: '#cc0066',
        contrastText: '#ffffff',
      },
      success: {
        main: '#00ff41', // Neon Green
        light: '#4dff70',
        dark: '#00cc34',
      },
      warning: {
        main: '#ff9800', // Orange
        light: '#ffb74d',
        dark: '#f57c00',
      },
      error: {
        main: '#ff073a', // Neon Red
        light: '#ff4569',
        dark: '#cc052e',
      },
      info: {
        main: '#03a9f4', // Light Blue
        light: '#35baf6',
        dark: '#0287c3',
      },
      background: {
        default: '#0a0a0f', // Very Dark Blue
        paper: '#1a1a2e', // Dark Blue Paper
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
        disabled: '#666666',
      },
      divider: '#333366',
    },
    typography: {
      fontFamily: '"Orbitron", "Roboto", monospace',
      h1: {
        fontWeight: 900,
        fontSize: '3.5rem',
        letterSpacing: '0.02em',
        textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
        color: '#00ffff',
      },
      h2: {
        fontWeight: 800,
        fontSize: '2.8rem',
        letterSpacing: '0.02em',
        textShadow: '0 0 15px rgba(0, 255, 255, 0.6)',
        color: '#00ffff',
      },
      h3: {
        fontWeight: 700,
        fontSize: '2.2rem',
        letterSpacing: '0.01em',
        color: '#ffffff',
      },
      h4: {
        fontWeight: 700,
        fontSize: '1.8rem',
        letterSpacing: '0.01em',
        color: '#ffffff',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.4rem',
        letterSpacing: '0.01em',
        color: '#ffffff',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.2rem',
        letterSpacing: '0.01em',
        color: '#ffffff',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        color: '#ffffff',
      },
      button: {
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0 2px 4px rgba(0, 255, 255, 0.1)',
      '0 4px 8px rgba(0, 255, 255, 0.15)',
      '0 6px 12px rgba(0, 255, 255, 0.2)',
      '0 8px 16px rgba(0, 255, 255, 0.25)',
      '0 10px 20px rgba(0, 255, 255, 0.3)',
      '0 12px 24px rgba(0, 255, 255, 0.35)',
      '0 14px 28px rgba(0, 255, 255, 0.4)',
      '0 16px 32px rgba(0, 255, 255, 0.45)',
      '0 18px 36px rgba(0, 255, 255, 0.5)',
      '0 20px 40px rgba(255, 0, 128, 0.3)',
      '0 22px 44px rgba(255, 0, 128, 0.35)',
      '0 24px 48px rgba(255, 0, 128, 0.4)',
      '0 26px 52px rgba(255, 0, 128, 0.45)',
      '0 28px 56px rgba(255, 0, 128, 0.5)',
      '0 30px 60px rgba(255, 0, 128, 0.55)',
      '0 32px 64px rgba(0, 255, 65, 0.3)',
      '0 34px 68px rgba(0, 255, 65, 0.35)',
      '0 36px 72px rgba(0, 255, 65, 0.4)',
      '0 38px 76px rgba(0, 255, 65, 0.45)',
      '0 40px 80px rgba(0, 255, 65, 0.5)',
      '0 42px 84px rgba(0, 255, 65, 0.55)',
      '0 44px 88px rgba(3, 169, 244, 0.4)',
      '0 46px 92px rgba(3, 169, 244, 0.45)',
      '0 48px 96px rgba(3, 169, 244, 0.5)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: `
              radial-gradient(circle at 20% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 0, 128, 0.1) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0f 100%)
            `,
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            '&::before': {
              content: '""',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 255, 0.03) 2px,
                  rgba(0, 255, 255, 0.03) 4px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 255, 0.03) 2px,
                  rgba(0, 255, 255, 0.03) 4px
                )
              `,
              pointerEvents: 'none',
              zIndex: -1,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '12px 24px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            transition: 'all 0.3s ease',
            fontFamily: '"Orbitron", monospace',
            border: '2px solid transparent',
            background: 'linear-gradient(45deg, #00ffff 0%, #ff0080 100%)',
            color: '#000014',
            textShadow: 'none',
            boxShadow: '0 4px 15px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(0, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              background: 'linear-gradient(45deg, #4dffff 0%, #ff4da6 100%)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 2px 10px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            },
          },
          contained: {
            background: 'linear-gradient(45deg, #00ffff 0%, #ff0080 100%)',
            color: '#000014',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(45deg, #4dffff 0%, #ff4da6 100%)',
            },
          },
          outlined: {
            border: '2px solid #00ffff',
            color: '#00ffff',
            background: 'rgba(0, 255, 255, 0.1)',
            '&:hover': {
              border: '2px solid #4dffff',
              background: 'rgba(0, 255, 255, 0.2)',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: `
              linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(22, 33, 62, 0.9) 100%)
            `,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: 12,
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(0, 255, 255, 0.2)',
            '&:hover': {
              border: '1px solid rgba(0, 255, 255, 0.6)',
              boxShadow: '0 12px 40px rgba(0, 255, 255, 0.3)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            background: `
              linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)
            `,
            border: '1px solid rgba(0, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': {
              color: '#00ffff',
              fontFamily: '"Orbitron", monospace',
              fontWeight: 600,
            },
            '& .MuiInputBase-root': {
              background: 'rgba(26, 26, 46, 0.8)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: 8,
              '&:hover': {
                border: '1px solid rgba(0, 255, 255, 0.5)',
              },
              '&.Mui-focused': {
                border: '2px solid #00ffff',
                boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
              },
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',
              fontFamily: '"Orbitron", monospace',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: `
              linear-gradient(90deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(26, 26, 46, 0.95) 100%)
            `,
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderBottom: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
  });

  // Add custom CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
    
    @keyframes gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes neon-pulse {
      0%, 100% { text-shadow: 0 0 5px rgba(0, 255, 255, 0.8), 0 0 10px rgba(0, 255, 255, 0.6), 0 0 15px rgba(0, 255, 255, 0.4); }
      50% { text-shadow: 0 0 10px rgba(0, 255, 255, 1), 0 0 20px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.6); }
    }
    
    .neon-text {
      animation: neon-pulse 2s ease-in-out infinite alternate;
    }
    
    .gaming-gradient-bg {
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0f 100%);
      background-size: 400% 400%;
      animation: gradient-shift 8s ease infinite;
    }
    
    .cyber-border {
      position: relative;
      overflow: hidden;
    }
    
    .cyber-border::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
      animation: cyber-sweep 3s infinite;
    }
    
    @keyframes cyber-sweep {
      0% { left: -100%; }
      100% { left: 100%; }
    }
  `;
  
  if (!document.head.querySelector('style[data-gaming-theme]')) {
    style.setAttribute('data-gaming-theme', 'true');
    document.head.appendChild(style);
  }

  return (
    <ThemeContext.Provider value={{}}>
      <MuiThemeProvider theme={gamingTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 