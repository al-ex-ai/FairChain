# FairChain

A blockchain-based gaming platform built on the Stellar testnet. Players can play games against AI opponents and place bets using XLM tokens with provably fair escrow-based transactions.

**Live Demo:** [fairchain.al-ex.ai](https://fairchain.al-ex.ai/)
*(Full-stack deployment — all games, wallet features, and blockchain betting are fully functional.)*

## Games

- **Tic-Tac-Toe** - Classic game with AI using minimax algorithm
- **Blackjack** - Card game against the dealer
- **Rock Paper Scissors** - Quick rounds against AI
- **Coin Flip** - 50/50 chance game
- **Dice Roll** - Roll the dice and beat the house

## Architecture

```
Browser (React SPA)                    Backend (Express API)                Stellar Testnet
┌─────────────────┐                   ┌─────────────────────┐            ┌──────────────┐
│                  │  1. Create game   │                     │  Friendbot │              │
│  Game UI         │ ───────────────>  │  Create escrow      │ ─────────> │  Fund escrow │
│  Wallet Context  │  2. Get unsigned  │  keypair, store     │            │  account     │
│  Local signing   │ <───────────────  │  secret server-side │            │              │
│                  │     XDR           │                     │            │              │
│  Signs TX with   │  3. Submit signed │  Submit to Stellar  │  Submit TX │              │
│  user's key      │ ───────────────>  │  Horizon            │ ─────────> │  Record on   │
│                  │                   │                     │            │  ledger      │
│                  │  4. Game ends     │  Sign escrow TX     │  Payout TX │              │
│                  │ ───────────────>  │  with stored key    │ ─────────> │  Transfer    │
│                  │                   │  Distribute funds   │            │  winnings    │
└─────────────────┘                   └─────────────────────┘            └──────────────┘
```

**Key design decisions:**
- User private keys never leave the browser — transactions are signed client-side
- Escrow private keys are managed server-side only — the backend signs payout transactions
- All transactions are on Stellar testnet with XLM tokens

## Tech Stack

**Frontend:** React 19, TypeScript 5.9, MUI 7, Vite 8
**Backend:** Express 5, TypeScript 5.9
**Blockchain:** Stellar SDK 16 (testnet)

## How It Works

1. Sign up and create a Stellar test wallet (funded with 10,000 XLM via Friendbot)
2. Select a game and optionally enable betting
3. Bets are sent to an escrow account on the Stellar blockchain
4. When the game ends, winnings are distributed from escrow to the winner

## Getting Started

### Prerequisites

- Node.js 22+

### Backend

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:3002`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://127.0.0.1:15410`.

## Deployment

The live instance runs on a single Hetzner VPS behind Nginx, which terminates TLS,
serves the static frontend build and reverse proxies `/api` to the backend.

### Frontend

```bash
cd frontend
npm ci
npm run build     # outputs to frontend/build
```

Point the Nginx `root` at `frontend/build` and add an SPA fallback
(`try_files $uri $uri/ /index.html`). Set `VITE_API_URL` at build time if the API
is not served from the same origin.

### Backend

```bash
cd backend
npm ci
npm run build
```

Run `dist/index.js` under systemd. It binds to `127.0.0.1:3002` and is only
reachable through the Nginx proxy, never directly. Set `CORS_ORIGIN` to the
frontend origin.

## Project Structure

```
FairChain/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/    # Game boards, dialogs, auth
│   │   ├── contexts/      # Game, Wallet, Theme, Stellar state
│   │   └── services/      # API client, AI logic
│   └── public/
├── backend/           # Express API
│   └── src/
│       ├── routes/        # API endpoints
│       ├── controllers/   # Request handlers
│       └── services/      # Stellar blockchain operations
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/game/create` | Create game with escrow account |
| POST | `/api/game/create-test-account` | Generate funded test account |
| POST | `/api/game/bet` | Create bet transaction |
| POST | `/api/game/submit-transaction` | Submit signed transaction |
| POST | `/api/game/game-end` | Distribute winnings |
| GET | `/health` | Health check |

## Note

This project runs on Stellar **testnet** only. No real cryptocurrency is used.
