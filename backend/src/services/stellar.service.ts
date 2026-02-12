import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = process.env.FRIENDBOT_URL || 'https://friendbot.stellar.org';
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

async function fundWithFriendbot(publicKey: string): Promise<void> {
  const response = await fetch(
    `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Friendbot funding failed (${response.status}): ${text}`);
  }
}

export const generateTestAccount = async () => {
  const keypair = StellarSdk.Keypair.random();

  await fundWithFriendbot(keypair.publicKey());

  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
  };
};

export const createEscrowAccount = async () => {
  const escrowKeypair = StellarSdk.Keypair.random();

  await fundWithFriendbot(escrowKeypair.publicKey());

  return {
    publicKey: escrowKeypair.publicKey(),
    secretKey: escrowKeypair.secret(),
  };
};

export const placeBet = async (
  playerPublicKey: string,
  escrowPublicKey: string,
  amount: string
) => {
  const account = await server.loadAccount(playerPublicKey);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: escrowPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      })
    )
    .setTimeout(30)
    .build();

  return transaction.toEnvelope().toXDR('base64');
};

export const submitTransaction = async (signedXdr: string) => {
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  );
  const response = await server.submitTransaction(transaction);
  return {
    hash: response.hash,
    ledger: response.ledger,
  };
};

export const distributeWinnings = async (
  escrowSecretKey: string,
  winnerPublicKey: string,
  amount: string
) => {
  const escrowKeypair = StellarSdk.Keypair.fromSecret(escrowSecretKey);
  const escrowAccount = await server.loadAccount(escrowKeypair.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(escrowAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: winnerPublicKey,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString(),
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(escrowKeypair);

  const response = await server.submitTransaction(transaction);
  return {
    hash: response.hash,
    ledger: response.ledger,
  };
};
