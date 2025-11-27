const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

const generateToken = (userId) => {
  return jwt.sign({}, process.env.JWT_SECRET, {
    expiresIn: '7d',
    subject: String(userId),
  });
};

module.exports = { authenticateToken, generateToken };

