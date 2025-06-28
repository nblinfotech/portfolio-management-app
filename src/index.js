const { app } = require('./app');
const config = require('./config/core/config');
const logger = require('./config/core/logger');
const { redisClient } = require('./config/core/redis_client');

const handleUnexpectedError = (error) => {
  logger.error(error);
  exitHandler();
};

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.error('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const connectToRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis...');

    redisClient.on('ready', () => logger.info('Redis authenticated and ready to use'));
    redisClient.on('end', () => logger.info('Redis connection closed'));
    redisClient.on('error', handleUnexpectedError);
  } catch (error) {
    handleUnexpectedError(error);
  }
};

const startServer = () => {
  const server = app.listen(config.port, () => {
    logger.info(`Listening to port: ${config.port} host: ${config.base_url}`);
  });

  process.on('uncaughtException', handleUnexpectedError);
  process.on('unhandledRejection', handleUnexpectedError);

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    exitHandler();
  });
};

const initializeApp = async () => {
  // await connectToRedis();
  startServer();
  // job runner
  // require('./jobs/index.js');
};

initializeApp().catch(handleUnexpectedError);
