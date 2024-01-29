import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import hpp from 'hpp';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import cookieParser from 'cookie-parser';
//
import { AppError } from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import tourRoutes from './routes/tourRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reviewsRoutes from './routes/reviewsRoutes.js';
import { viewRouter } from './routes/viewRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Example of using Pug in Express.js
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
console.log(path.join(__dirname, 'views'));

// Global MiddleWares:
app.use(express.static(path.join(__dirname, 'public')));

// 1) Set Secure HTTP headers
app.use(helmet());

// 2) Set request limit on our api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// 3) Body Parser, reading data from body into req.body
app.use(
  express.json({
    limit: '10kb',
  }),
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 4) Data Sanitization against NoSql query Injection
app.use(mongoSanitize());

// 5) Data Sanitization against X55, if someone send malicious html with js attached
app.use(xssClean());

// 6) Prevent Parameter Pollution:
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// 6) Serving Static files
// app.use(express.static('./public'));
// app.use(cookieParser( ));

// Development and Production logic:
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('tiny'));
}
console.log(process.env.NODE_ENV);
app.use((req, res, next) => {
  console.log('Hello From the middleware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.headers.authorization);
  console.log(req.cookies);
  next();
});

// Routes:
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewsRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Routes Error Handling:
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Api Errors
app.use(globalErrorHandler);

export default app;
