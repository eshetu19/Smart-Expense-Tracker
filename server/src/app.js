import './models/index.js';   
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config/index.js';
import fileService from './services/file.service.js';
import routes from './routes/index.js';
import rateLimiter from './middlewares/rateLimiter.middleware.js';
import notFound from './middlewares/notFound.middleware.js';
import errorHandler from './middlewares/error.middleware.js';
const app = express();


app.use(helmet());

app.use(compression()); 

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());


if (config.isDevelopment) {
  app.use(morgan('dev'));
}


app.set('trust proxy', 1);


app.use(`${config.app.apiPrefix}`, rateLimiter.globalLimiter);


app.use(
  `${config.app.apiPrefix}/static/uploads`,
  express.static(fileService.getUploadRoot(), {
    maxAge: '1d',
    etag: true,
    fallthrough: true,
  })
);


app.use(config.app.apiPrefix, routes);


app.use(notFound);

app.use(errorHandler);

export default app;