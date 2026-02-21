require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const defaultAllowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const envAllowedOrigins = String(process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

app.use('/api/admin', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', (req, res) => {
  return res.status(404).json({ message: 'API route not found.' });
});

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use((error, req, res, next) => {
  if (error?.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS origin denied.' });
  }
  return next(error);
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
