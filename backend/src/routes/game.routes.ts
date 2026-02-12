import express from 'express';
import {
  createEscrowAccount,
  generateTestAccount,
  placeBet,
  submitTransaction,
  distributeWinnings,
} from '../services/stellar.service';

const router = express.Router();

// In-memory game state (for demo purposes)
const activeGames = new Map<
  string,
  { escrowSecretKey: string; escrowPublicKey: string; betAmount: string }
>();

// Create a new game with escrow account
router.post('/create', async (req, res) => {
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

    // Store game state so we can distribute winnings later
    activeGames.set(gameId, {
      escrowSecretKey: escrowAccount.secretKey,
      escrowPublicKey: escrowAccount.publicKey,
      betAmount,
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
    console.error('Error creating game:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to create game',
    });
  }
});

// Create a test account
router.post('/create-test-account', async (req, res) => {
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
    console.error('Error creating test account:', error);
    res.status(500).json({
      status: 'error',
      message:
        error instanceof Error ? error.message : 'Failed to create test account',
    });
  }
});

// Place a bet
router.post('/bet', async (req, res) => {
  try {
    const { playerPublicKey, gameId, amount } = req.body;

    if (!playerPublicKey || !gameId || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: playerPublicKey, gameId, amount',
      });
    }

    const game = activeGames.get(gameId);
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

    res.json({
      status: 'success',
      data: { transactionXdr },
    });
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to place bet',
    });
  }
});

// Submit signed transaction
router.post('/submit-transaction', async (req, res) => {
  try {
    const { signedXdr } = req.body;

    if (!signedXdr) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing signed transaction XDR',
      });
    }

    const result = await submitTransaction(signedXdr);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Error submitting transaction:', error);
    res.status(500).json({
      status: 'error',
      message:
        error instanceof Error ? error.message : 'Failed to submit transaction',
    });
  }
});

// Handle game end and distribute winnings
router.post('/game-end', async (req, res) => {
  try {
    const { gameId, winnerPublicKey } = req.body;

    if (!gameId || !winnerPublicKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: gameId, winnerPublicKey',
      });
    }

    const game = activeGames.get(gameId);
    if (!game) {
      return res.status(404).json({
        status: 'error',
        message: 'Game not found',
      });
    }

    // Distribute winnings from escrow to winner
    const result = await distributeWinnings(
      game.escrowSecretKey,
      winnerPublicKey,
      game.betAmount
    );

    // Clean up game state
    activeGames.delete(gameId);

    res.json({
      status: 'success',
      data: {
        message: 'Winnings distributed successfully',
        transactionHash: result.hash,
        ledger: result.ledger,
      },
    });
  } catch (error) {
    console.error('Error handling game end:', error);
    res.status(500).json({
      status: 'error',
      message:
        error instanceof Error ? error.message : 'Failed to distribute winnings',
    });
  }
});

export default router;
