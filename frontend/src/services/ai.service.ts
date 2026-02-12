export class AIService {
  private checkWinner(board: string[]): string | null {
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
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every((square) => square !== '')) {
      return 'draw';
    }

    return null;
  }

  private getAvailableMoves(board: string[]): number[] {
    return board
      .map((square, index) => (square === '' ? index : -1))
      .filter((index) => index !== -1);
  }

  private minimax(
    board: string[],
    depth: number,
    isMaximizing: boolean,
    alpha: number = -Infinity,
    beta: number = Infinity
  ): { score: number; move?: number } {
    const winner = this.checkWinner(board);
    if (winner === 'O') return { score: 10 - depth };
    if (winner === 'X') return { score: depth - 10 };
    if (winner === 'draw') return { score: 0 };
    if (depth >= 9) return { score: 0 };

    const availableMoves = this.getAvailableMoves(board);

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove;

      for (const move of availableMoves) {
        const newBoard = [...board];
        newBoard[move] = 'O';
        const result = this.minimax(newBoard, depth + 1, false, alpha, beta);
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) break;
      }

      return { score: bestScore, move: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove;

      for (const move of availableMoves) {
        const newBoard = [...board];
        newBoard[move] = 'X';
        const result = this.minimax(newBoard, depth + 1, true, alpha, beta);
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = move;
        }
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) break;
      }

      return { score: bestScore, move: bestMove };
    }
  }

  private getRandomMove(board: string[]): number {
    const availableMoves = this.getAvailableMoves(board);
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  getBestMove(board: string[], difficulty: string): number {
    const availableMoves = this.getAvailableMoves(board);
    if (availableMoves.length === 0) return -1;

    switch (difficulty) {
      case 'easy':
        // 20% chance of optimal move, 80% chance of random move
        return Math.random() < 0.2
          ? this.minimax(board, 0, true).move!
          : this.getRandomMove(board);

      case 'medium':
        // 60% chance of optimal move, 40% chance of random move
        return Math.random() < 0.6
          ? this.minimax(board, 0, true).move!
          : this.getRandomMove(board);

      case 'hard':
        // Always make the optimal move
        return this.minimax(board, 0, true).move!;

      default:
        return this.getRandomMove(board);
    }
  }
} 