import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/game.routes';

dotenv.config();

const app = express();
// Number(), not `|| 3002` on the raw string: Express 5's listen overloads take a
// number, and `process.env.PORT || 3002` widens to `string | 3002`.
const port = Number(process.env.PORT) || 3002;

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

// Bind to loopback only. Nginx terminates TLS and proxies to 127.0.0.1:3002,
// so the port must never be reachable on a public interface.
app.listen(port, '127.0.0.1', () => {
  console.log(`FairChain server running on 127.0.0.1:${port}`);
});
