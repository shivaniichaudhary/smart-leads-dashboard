import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes'; // 👈 Import the new lead routes

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Mount the API Resource paths
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes); // 👈 Map leads path operations layer

// Basic Test Route
app.get('/', (req, res) => {
  res.send('API is up and running smoothly!');
});

const PORT = process.env.PORT || 5000;

// Start Server after connecting to DB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});