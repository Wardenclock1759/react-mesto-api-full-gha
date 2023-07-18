const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const isURL = require('validator/lib/isURL');
const NotAuthenticated = require('../errors/not-authenticated');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator: (v) => isURL(v),
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  const NotAuthenticatedError = new NotAuthenticated('Неправильный email или пароль');
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw NotAuthenticatedError;
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw NotAuthenticatedError;
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
