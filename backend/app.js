const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const { PORT, MONGO_URL } = require('./config');
const routes = require('./routes/index');
const cors = require('./middlewares/cors');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./middlewares/limiter');
const NotFoundError = require('./errors/not-found-error');
const { NOT_FOUND_MESSAGE } = require('./constants');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
});

app.use(limiter);

app.use(cors);

app.use((req, res, next) => {
  const { method } = req;

  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const requestHeaders = req.headers['access-control-request-headers'];

  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);

    return res.end();
  }
  return next();
});

app.use(requestLogger);

app.use('/', routes);

app.use('*', (req, res, next) => {
  const error = new NotFoundError(NOT_FOUND_MESSAGE);
  next(error);
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT);
