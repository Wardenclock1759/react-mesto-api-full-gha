const allowedCors = [
  'https://mesto.wardenclock.nomoredomains.xyz',
  'http://mesto.wardenclock.nomoredomains.xyz',
];

function cors(req, res, next) {
  const { origin } = req.headers;
  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', true);
  }

  next();
}

module.exports = cors;
