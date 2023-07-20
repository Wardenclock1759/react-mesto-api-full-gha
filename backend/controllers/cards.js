const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden');

const {
  STATUS_CREATED,
  FORBITTEN_MESSAGE,
} = require('../constants');

const NOT_FOUND_MESSAGE = 'Карточка с указанным _id не найдена.';

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ cards }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const currentUserId = req.user._id;

  return Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError(NOT_FOUND_MESSAGE);
      }
      if (card.owner.toString() !== currentUserId) {
        throw new ForbiddenError(FORBITTEN_MESSAGE);
      }
      return Card.deleteOne(card);
    })
    .then((card) => res.send({ card }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(STATUS_CREATED).send({ card }))
    .catch(next);
};

const updateCard = (updateFunction) => (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  return Card.findByIdAndUpdate(
    cardId,
    updateFunction(userId),
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError(NOT_FOUND_MESSAGE);
      }
      return res.send({ card });
    })
    .catch(next);
};

module.exports.likeCard = updateCard(
  (userId) => ({ $addToSet: { likes: userId } }),
);

module.exports.dislikeCard = updateCard(
  (userId) => ({ $pull: { likes: userId } }),
);
