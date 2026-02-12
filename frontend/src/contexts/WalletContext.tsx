import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import CryptoJS from 'crypto-js';
import { stellarService } from '../services/stellar.service';

interface WalletInfo {
  type: 'stellar' | 'freighter' | 'albedo' | 'rabet' | 'lobstr';
  publicKey: string;
  balance: string;
  isTestAccount: boolean;
}

interface WalletContextType {
  isConnected: boolean;
  wallet: WalletInfo | null;
  isLoading: boolean;
  error: string | null;
  connectStellar: (publicKey: string) => Promise<void>;
  createTestWallet: () => Promise<WalletInfo>;
  refreshBalance: () => Promise<void>;
  disconnect: () => void;
  clearWallet: () => void;
  getWalletPrivateKey: () => string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
  userId: string | null;
}

const ENCRYPTION_KEY = 'fairchain-wallet-key-v1';

// Initialize Stellar server for balance queries (testnet)
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

export const WalletProvider: React.FC<WalletProviderProps> = ({ children, userId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStorageKeys = (uid: string) => ({
    wallet: `fairchain-wallet-${uid}`,
    privateKey: `fairchain-private-key-${uid}`,
  });

  const encryptPrivateKey = (privateKey: string): string => {
    return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
  };

  const decryptPrivateKey = (encryptedKey: string): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  // Load wallet from localStorage when userId changes
  useEffect(() => {
    const loadStoredWallet = async () => {
      if (!userId) {
        setWallet(null);
        setIsConnected(false);
        return;
      }

      try {
        const keys = getStorageKeys(userId);
        const storedWallet = localStorage.getItem(keys.wallet);

        if (storedWallet) {
          const walletData = JSON.parse(storedWallet);
          const currentBalance = await getBalance(walletData.publicKey);
          const updatedWallet = { ...walletData, balance: currentBalance };

          setWallet(updatedWallet);
          setIsConnected(true);
          localStorage.setItem(keys.wallet, JSON.stringify(updatedWallet));
        }
      } catch (error) {
        console.error('Error loading stored wallet:', error);
        if (userId) {
          const keys = getStorageKeys(userId);
          localStorage.removeItem(keys.wallet);
          localStorage.removeItem(keys.privateKey);
        }
      }
    };

    loadStoredWallet();
  }, [userId]);

  const getBalance = async (publicKey: string): Promise<string> => {
    try {
      const account = await server.loadAccount(publicKey);
      const xlmBalance = account.balances.find(
        (balance: any) => balance.asset_type === 'native'
      );
      return xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : '0.00';
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0.00';
    }
  };

  const connectStellar = async (publicKey: string) => {
    if (!userId) {
      setError('Please log in first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!StellarSdk.StrKey.isValidEd25519PublicKey(publicKey)) {
        throw new Error('Invalid Stellar public key format');
      }

      const balance = await getBalance(publicKey);

      const walletInfo: WalletInfo = {
        type: 'stellar',
        publicKey,
        balance,
        isTestAccount: false,
      };

      setWallet(walletInfo);
      setIsConnected(true);

      const keys = getStorageKeys(userId);
      localStorage.setItem(keys.wallet, JSON.stringify(walletInfo));
    } catch (error: any) {
      setError(error.message || 'Failed to connect Stellar wallet');
      console.error('Error connecting Stellar wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create test wallet via backend
  const createTestWallet = async (): Promise<WalletInfo> => {
    if (!userId) {
      setError('Please log in first');
      throw new Error('Please log in first');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call backend to create and fund test account
      const response = await stellarService.createTestAccount();
      const { publicKey, secretKey } = response.data;

      // Wait for funding to propagate
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const balance = await getBalance(publicKey);

      const walletInfo: WalletInfo = {
        type: 'stellar',
        publicKey,
        balance,
        isTestAccount: true,
      };

      setWallet(walletInfo);
      setIsConnected(true);

      // Store wallet info and encrypted private key
      const keys = getStorageKeys(userId);
      localStorage.setItem(keys.wallet, JSON.stringify(walletInfo));
      localStorage.setItem(keys.privateKey, encryptPrivateKey(secretKey));

      return walletInfo;
    } catch (error: any) {
      setError(error.message || 'Failed to create test wallet');
      console.error('Error creating test wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (!wallet || !userId) return;

    setIsLoading(true);
    try {
      const newBalance = await getBalance(wallet.publicKey);
      const updatedWallet = { ...wallet, balance: newBalance };

      setWallet(updatedWallet);

      const keys = getStorageKeys(userId);
      localStorage.setItem(keys.wallet, JSON.stringify(updatedWallet));
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setError('Failed to refresh balance');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    if (!userId) return;

    setWallet(null);
    setIsConnected(false);
    setError(null);

    const keys = getStorageKeys(userId);
    localStorage.removeItem(keys.wallet);
    localStorage.removeItem(keys.privateKey);
  };

  const clearWallet = () => {
    setWallet(null);
    setIsConnected(false);
    setError(null);
  };

  const getWalletPrivateKey = (): string | null => {
    if (!userId) return null;

    try {
      const keys = getStorageKeys(userId);
      const encryptedKey = localStorage.getItem(keys.privateKey);
      if (encryptedKey) {
        return decryptPrivateKey(encryptedKey);
      }
    } catch (error) {
      console.error('Error retrieving wallet private key:', error);
    }
    return null;
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        wallet,
        isLoading,
        error,
        connectStellar,
        createTestWallet,
        refreshBalance,
        disconnect,
        clearWallet,
        getWalletPrivateKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
