import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StellarContextType {
  isConnected: boolean;
  publicKey: string | null;
  secretKey: string | null;
  connect: (publicKey: string, secretKey?: string) => void;
  disconnect: () => void;
  signTransaction: (xdr: string) => Promise<string>;
}

const StellarContext = createContext<StellarContextType | undefined>(undefined);

interface StellarProviderProps {
  children: ReactNode;
}

export const StellarProvider: React.FC<StellarProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);

  const connect = (newPublicKey: string, newSecretKey?: string) => {
    setPublicKey(newPublicKey);
    if (newSecretKey) {
      setSecretKey(newSecretKey);
    }
    setIsConnected(true);
  };

  const disconnect = () => {
    setPublicKey(null);
    setSecretKey(null);
    setIsConnected(false);
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    if (!secretKey) {
      throw new Error('No secret key available for signing');
    }

    // Return the XDR as is since we have the secret key
    return xdr;
  };

  return (
    <StellarContext.Provider
      value={{
        isConnected,
        publicKey,
        secretKey,
        connect,
        disconnect,
        signTransaction,
      }}
    >
      {children}
    </StellarContext.Provider>
  );
};

export const useStellar = () => {
  const context = useContext(StellarContext);
  if (context === undefined) {
    throw new Error('useStellar must be used within a StellarProvider');
  }
  return context;
}; 