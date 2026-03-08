require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

app.use('/api/admin', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api', (req, res) => {
  return res.status(404).json({ message: 'API route not found.' });
});

const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');

if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistPath));

  // Express 5 does not support app.get('*'); use named wildcard catch-all.
  app.get('/{*splat}', (req, res) => {
    return res.sendFile(clientIndexPath);
  });
} else {
  console.warn(`Client build not found at ${clientIndexPath}`);
}

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
