import express from 'express';
import cors from 'cors';
import http from 'http';
import { config } from './config';
import authRoutes from './routes/auth';
import meRoutes from './routes/me';
import roomRoutes from './routes/rooms';
import teamRoutes from './routes/team';
import { setupWebSocketServer } from './websocket';

const app = express();

// Middleware
app.use(express.json());
// app.use(cors({
//   origin: config.corsOrigin,
//   credentials: true,
// }));
app.use(cors())
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use(meRoutes);
app.use(roomRoutes);
app.use(teamRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Create HTTP server
const server = http.createServer(app);
//we are using same server to run both ws and http
// Setup WebSocket server
setupWebSocketServer(server);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);

});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
