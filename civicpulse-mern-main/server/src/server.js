require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API: http://localhost:${PORT}/api/v1`);
  });
};

startServer();
