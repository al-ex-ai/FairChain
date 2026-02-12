import { Request, Response } from 'express';
import {
  createEscrowAccount,
  generateTestAccount,
  placeBet,
  submitTransaction,
  distributeWinnings,
} from '../services/stellar.service';

interface GameState {
  escrowPublicKey: string;
  escrowSecretKey: string;
  betAmount: string;
  playerPublicKey: string;
}

export class GameController {
  private activeGames: Map<string, GameState>;

  constructor() {
    this.activeGames = new Map();
  }

  async createGame(req: Request, res: Response) {
    try {
      const { betAmount } = req.body;

      if (!betAmount || parseFloat(betAmount) <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid bet amount',
        });
      }

      const escrowAccount = await createEscrowAccount();
      const gameId = Math.random().toString(36).substring(2, 10);

      this.activeGames.set(gameId, {
        escrowPublicKey: escrowAccount.publicKey,
        escrowSecretKey: escrowAccount.secretKey,
        betAmount,
        playerPublicKey: '',
      });

      res.json({
        status: 'success',
        data: {
          gameId,
          betAmount,
          escrowPublicKey: escrowAccount.publicKey,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create game',
      });
    }
  }

  async createTestAccount(_req: Request, res: Response) {
    try {
      const account = await generateTestAccount();
      res.json({
        status: 'success',
        data: {
          publicKey: account.publicKey,
          secretKey: account.secretKey,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create test account',
      });
    }
  }

  async placeBet(req: Request, res: Response) {
    try {
      const { playerPublicKey, gameId, amount } = req.body;

      const game = this.activeGames.get(gameId);
      if (!game) {
        return res.status(404).json({
          status: 'error',
          message: 'Game not found',
        });
      }

      const transactionXdr = await placeBet(
        playerPublicKey,
        game.escrowPublicKey,
        amount
      );

      game.playerPublicKey = playerPublicKey;

      res.json({
        status: 'success',
        data: { transactionXdr },
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to place bet',
      });
    }
  }

  async handleGameEnd(req: Request, res: Response) {
    try {
      const { gameId, winnerPublicKey } = req.body;

      const game = this.activeGames.get(gameId);
      if (!game) {
        return res.status(404).json({
          status: 'error',
          message: 'Game not found',
        });
      }

      const result = await distributeWinnings(
        game.escrowSecretKey,
        winnerPublicKey,
        game.betAmount
      );

      this.activeGames.delete(gameId);

      res.json({
        status: 'success',
        data: {
          message: 'Winnings distributed successfully',
          transactionHash: result.hash,
          ledger: result.ledger,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to handle game end',
      });
    }
  }

  async submitSignedTransaction(req: Request, res: Response) {
    try {
      const { signedXdr } = req.body;
      const result = await submitTransaction(signedXdr);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to submit transaction',
      });
    }
  }
}
