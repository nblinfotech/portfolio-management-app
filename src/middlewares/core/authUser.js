const jwt = require('jsonwebtoken');

const models = require('../../models/core');
const User = models.users;

const authUser = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(400).json({ message: 'No token, authorization denied' });
  }
  try {
    const jwtToken = token.split(' ')[1].replaceAll(`"`, '');

    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const userData = await User.findByPk(isVerified?.sub, {
      attributes: { exclude: ['password'] },
    });

    req.token = token;
    req.user = userData;

    next();
  } catch (err) {
    console.log(err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, err: err.name });
    }
    res.status(400).json({ message: 'Token is not valid' });
  }
};

module.exports = authUser;
