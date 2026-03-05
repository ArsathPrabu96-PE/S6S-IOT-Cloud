import app, { initializeApp } from './app.js';
import config from './config/index.js';

const startServer = async () => {
  try {
    // Initialize the application (database, MQTT, etc.)
    await initializeApp();
    
    // Start Express server
    app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    S6S IoT Platform                          ║
║                                                              ║
║  🌐 API Server:     http://localhost:${config.port}                 ║
║  📡 MQTT Broker:    mqtt://localhost:${config.mqtt.port}           ║
║  🔌 WebSocket:     ws://localhost:${config.mqtt.websocketPort}       ║
║  🌍 Environment:    ${config.env.padEnd(42)}║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
