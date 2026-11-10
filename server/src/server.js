
import app from './app.js';
import config from './config/index.js';
import connectDB, { disconnectDB } from './config/database.js';
import fileService from './services/file.service.js';
import jobs from './jobs/index.js';
import logger from './utils/logger.js';

const start = async () => {
  try {
    
    await connectDB();

    
    await fileService.ensureDirectories();

   
    await jobs.startAll();

    
    const server = app.listen(config.app.port, () => {
      logger.info(`Server started`, {
        port: config.app.port,
        env: config.env,
        apiPrefix: config.app.apiPrefix,
      });
    });

    
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully`);

      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          jobs.stopAll();
          await disconnectDB();
          logger.info('Shutdown complete');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', { error: err.message });
          process.exit(1);
        }
      });

      
      setTimeout(() => {
        logger.error('Shutdown timed out, forcing exit');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  }
};

start();