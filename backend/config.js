require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  PORT: isProduction ? process.env.PORT : process.env.PORT || 3000,
  MONGO_URL: isProduction ? process.env.MONGO_URL : process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/mestodb',
  JWT_SECRET: isProduction ? process.env.JWT_SECRET : process.env.JWT_SECRET || 'super-strong-secret',
};
