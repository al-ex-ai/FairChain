const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

export interface GameResponse {
  status: string;
  data: {
    gameId: string;
    betAmount: string;
    escrowPublicKey: string;
  };
}

export interface TransactionResponse {
  status: string;
  data: {
    transactionXdr: string;
  };
}

export interface TestAccountResponse {
  status: string;
  data: {
    publicKey: string;
    secretKey: string;
  };
}

export interface SubmitTransactionResponse {
  status: string;
  data: {
    hash: string;
    ledger: number;
  };
}

export interface GameEndResponse {
  status: string;
  data: {
    message: string;
    transactionHash: string;
    ledger: number;
  };
}

async function apiCall<T>(path: string, body?: object): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export class StellarService {
  async createGame(betAmount: string): Promise<GameResponse> {
    return apiCall('/game/create', { betAmount });
  }

  async createTestAccount(): Promise<TestAccountResponse> {
    return apiCall('/game/create-test-account');
  }

  async placeBet(playerPublicKey: string, gameId: string, amount: string): Promise<TransactionResponse> {
    return apiCall('/game/bet', { playerPublicKey, gameId, amount });
  }

  async submitTransaction(signedXdr: string): Promise<SubmitTransactionResponse> {
    return apiCall('/game/submit-transaction', { signedXdr });
  }

  async gameEnd(gameId: string, winnerPublicKey: string): Promise<GameEndResponse> {
    return apiCall('/game/game-end', { gameId, winnerPublicKey });
  }
}

// Singleton instance
export const stellarService = new StellarService();
