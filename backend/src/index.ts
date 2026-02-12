import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/game.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  })
);
app.use(express.json());

// Routes
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'FairChain server is running' });
});

app.listen(port, () => {
  console.log(`FairChain server running on port ${port}`);
});
