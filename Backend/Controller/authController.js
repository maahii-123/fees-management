const db = require('../connection/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  db.execute('SELECT * FROM login WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Password verification error' });

      if (!isMatch)
        return res.status(401).json({ message: 'Invalid password' });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        'secret123',
        { expiresIn: '1h' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        name: user.name,
      });
    });
  });
};
