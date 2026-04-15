import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import { sequelize } from './db';
import './models';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './controllers/auth.controller';
import { campaignRouter } from './controllers/campaign.controller';
import { recipientRouter } from './controllers/recipient.controller';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/auth', authRouter);
app.use('/campaigns', campaignRouter);
app.use('/recipients', recipientRouter);
app.use('/recipient', recipientRouter); // Singular alias for POST /recipient

app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { app };
