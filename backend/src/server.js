import 'dotenv/config';

import dns from 'node:dns';

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Use Google's public DNS servers for MongoDB Atlas SRV lookups.
dns.setServers([
  '8.8.8.8',
  '8.8.4.4',
]);

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `Fit Forge API running on http://localhost:${PORT}`
    );
  });
}

startServer();