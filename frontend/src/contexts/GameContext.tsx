import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AIService } from '../services/ai.service';

interface GameContextType {
  board: string[];
  currentPlayer: string;
  winner: string | null;
  isGameOver: boolean;
  gameId: string | null;
  betAmount: string | null;
  escrowAccount: string | null;
  isProcessing: boolean;
  difficulty: string;
  showPayoutDialog: boolean;
  startNewGame: (difficulty: string, betAmount: string, escrowAccount?: string, gameId?: string) => Promise<void>;
  makeMove: (index: number) => void;
  resetGame: () => void;
  closePayoutDialog: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState<string>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string | null>(null);
  const [escrowAccount, setEscrowAccount] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [showPayoutDialog, setShowPayoutDialog] = useState<boolean>(false);

  const aiService = new AIService();

  const checkWinner = (squares: string[]): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }

    if (squares.every((square) => square !== '')) {
      return 'draw';
    }

    return null;
  };

  const startNewGame = async (newDifficulty: string, amount: string, escrowAccount?: string, backendGameId?: string) => {
    setIsProcessing(true);
    try {
      // Use backend gameId if provided (betting games), otherwise generate local one
      const resolvedGameId = backendGameId || `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setGameId(resolvedGameId);
      setBetAmount(amount);
      setEscrowAccount(escrowAccount || null);
      setDifficulty(newDifficulty);

      setBoard(Array(9).fill(''));
      setCurrentPlayer('X');
      setWinner(null);
      setIsGameOver(false);

    } catch (error) {
      console.error('Error starting new game:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const makeAIMove = (currentBoard: string[]) => {
    const aiMove = aiService.getBestMove(currentBoard, difficulty);
    if (aiMove !== -1) {
      const newBoard = [...currentBoard];
      newBoard[aiMove] = 'O';
      setBoard(newBoard);

      const newWinner = checkWinner(newBoard);
      if (newWinner) {
        setWinner(newWinner);
        setIsGameOver(true);
        handleGameEnd(newWinner);
        return;
      }

      setCurrentPlayer('X');
    }
  };

  const makeMove = (index: number) => {
    if (board[index] || winner || isGameOver || currentPlayer !== 'X') {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      setIsGameOver(true);
      handleGameEnd(newWinner);
      return;
    }

    setCurrentPlayer('O');
    // Add a small delay before AI move
    setTimeout(() => makeAIMove(newBoard), 500);
  };

  const handleGameEnd = async (gameWinner: string) => {
    if (!gameId) return;

    setIsProcessing(true);
    try {
      if (escrowAccount && betAmount && parseFloat(betAmount) > 0) {
        // Record the initial betting transaction in history
        const userId = 'current-user'; // In real app, get from auth context
        const historyKey = `fairchain-tx-history-${userId}`;
        const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        const bettingTransaction = {
          id: `bet-${gameId}`,
          hash: `betting-${Date.now()}`,
          type: 'game_bet',
          amount: `-${betAmount}`,
          date: new Date().toISOString(),
          gameType: 'tic-tac-toe',
          gameId: gameId,
          gameResult: 'pending',
          memo: `TIC_TAC_TOE_BET_${gameId}_${new Date().toISOString()}`.substring(0, 28),
          status: 'completed'
        };
        
        const updatedHistory = [bettingTransaction, ...existingHistory].slice(0, 100);
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
        
        // Only show payout dialog for player wins and draws
        if (gameWinner === 'X' || gameWinner === 'draw') {
          setShowPayoutDialog(true);
        }
      }
      
    } catch (error) {
      console.error('Error handling game end:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setWinner(null);
    setIsGameOver(false);
    setGameId(null);
    setBetAmount(null);
    setEscrowAccount(null);
  };

  const closePayoutDialog = () => {
    setShowPayoutDialog(false);
  };

  return (
    <GameContext.Provider
      value={{
        board,
        currentPlayer,
        winner,
        isGameOver,
        gameId,
        betAmount,
        escrowAccount,
        isProcessing,
        difficulty,
        showPayoutDialog,
        startNewGame,
        makeMove,
        resetGame,
        closePayoutDialog,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 