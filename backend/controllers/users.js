const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');

const {
  STATUS_CREATED,
  AUTHENTICATED,
} = require('../constants');

const NOT_FOUND_MESSAGE = 'Пользователь по указанному _id не найден.';

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const secret = JWT_SECRET;
      const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
      res.send({ message: AUTHENTICATED });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(NOT_FOUND_MESSAGE);
      } else {
        res.send({ user });
      }
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(NOT_FOUND_MESSAGE);
      }
      return res.send({ user });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name, about, avatar,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hashedPassword) => User.create({
      email,
      password: hashedPassword,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      const userObject = user.toObject();
      delete userObject.password;
      res.status(STATUS_CREATED).send({ userObject });
    })
    .catch(next);
};

function updateUser(toUpdate) {
  return (req, res, next) => {
    const userId = req.user._id;
    const updated = toUpdate(req.body);

    User.findByIdAndUpdate(userId, updated, { new: true, runValidators: true })
      .then((user) => {
        if (!user) {
          throw new NotFoundError(NOT_FOUND_MESSAGE);
        }
        return res.send({ user });
      })
      .catch(next);
  };
}

module.exports.updateUserInfo = updateUser(
  ({ name, about }) => ({ name, about }),
);

module.exports.updateUserAvatar = updateUser(({ avatar }) => ({ avatar }));
