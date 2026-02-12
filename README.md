# FairChain

A blockchain-based gaming platform built on the Stellar testnet. Players can play games against AI opponents and place bets using XLM tokens with provably fair escrow-based transactions.

**Live Demo:** [fairchain-gaming-app.netlify.app](https://fairchain-gaming-app.netlify.app/)
*(Frontend-only deployment — games and UI are fully playable. Blockchain betting features require the backend running locally.)*

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

**Frontend:** React 18, TypeScript, Material-UI
**Backend:** Express, TypeScript
**Blockchain:** Stellar SDK (testnet)

## How It Works

1. Sign up and create a Stellar test wallet (funded with 10,000 XLM via Friendbot)
2. Select a game and optionally enable betting
3. Bets are sent to an escrow account on the Stellar blockchain
4. When the game ends, winnings are distributed from escrow to the winner

## Getting Started

### Prerequisites

- Node.js 18+

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
npm start
```

The app opens at `http://localhost:3000`.

## Deployment

### Frontend (Netlify)

The frontend includes `netlify.toml` config. Connect your GitHub repo to Netlify and set:
- **Build command:** `npm run build`
- **Publish directory:** `build`
- **Base directory:** `frontend`
- **Environment variable:** `REACT_APP_API_URL` = your backend URL

### Backend (Render)

A `render.yaml` blueprint is included. On [Render](https://render.com):
1. New > Web Service > Connect your GitHub repo
2. Set **Root Directory** to `backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`
5. Set **CORS_ORIGIN** env var to your frontend URL

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
├── render.yaml        # Render deployment blueprint
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
