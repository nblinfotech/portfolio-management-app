const express = require('express');

const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const httpStatus = require('http-status');
// const session = require('express-session');
const swaggerDef = require('./docs/swaggerDef')
const config = require('./config/core/config');
const morgan = require('./config/core/morgan');
const { jwtStrategy } = require('./config/core/passport');
const { authLimiter } = require('./middlewares/core/rateLimiter');
const coreRoutes = require('./routes/core');
const tenantRoutes = require('./routes/tenant');
const { createClient } = require('redis');



const { errorConverter, errorHandler } = require('./middlewares/core/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// change limit according to file upload limit as per required.
app.use(express.json({ limit: '150mb' })); 
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

app.use(cookieParser());

// const baseOrigin = process.env.CORS_ORIGIN;
// // Other allowed origins
// const otherOrigins = [
//   'http://localhost:3000',
//   'http://localhost:3009/'
// ];
// const allowedOrigins = [baseOrigin, ...otherOrigins].filter(Boolean);
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3009', 'http://localhost:3000', 'http://localhost:3001'];

// enable cors
app.use(
  cors({
    origin: (origin, callback) => {
      // If the origin is in the allowedOrigins list, allow it
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        console.log(allowedOrigins);

      } else {
        console.log(origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}





// // Redis pub/sub for notifications
// const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
// const redisClient = createClient({ url: REDIS_URL });

// redisClient.on('connect', () => {
//     console.log('Successfully connected to Redis at', REDIS_URL);
// });

// // Handle connection errors
// redisClient.on('error', (error) => {
//     console.error('Redis connection error:', error);
// });

// // Initiate connection
// redisClient.connect().catch(error => {
//     console.error('Redis initial connection failed:', error);
// });


// redisClient.subscribe('export_notifications', (message) => {
//     const { userId, event, data } = JSON.parse(message);
//     if (event === 'export_completed') {
//         io.to(userId).emit('export_completed', data);
//     }
// });




app.get('/api', (req, res) => {
  try {
    res.status(200).json({ message: 'Welcome to the Core API!' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred', message: error.message, stack: error.stack });
  }
});

// core api routes
app.use('/api/core', coreRoutes);

// tenant api routes
app.use('/api/tenant', tenantRoutes);

// DEFINE THE UPLOAD FOLDER
const uploadFolder = process.env.UPLOAD_FOLDER || '/var/www/html/uploads';

app.use('/api/uploads', express.static(uploadFolder));

app.use('/api/core/uploadsorganization', express.static('uploadsorganization'));

app.use('/api/core/uploadsapplication', express.static('uploadsapplication'));


// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  // console.log(req);
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = {
  app,
  uploadFolder,
  // redisClient
};
