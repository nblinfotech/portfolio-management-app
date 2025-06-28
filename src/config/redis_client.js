const { createClient } = require('redis');
const config = require('./config');

const redisClient = createClient({
  password: config.redis.password || null,
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
  db: config.redis.db,
});

module.exports = {
  redisClient
};




