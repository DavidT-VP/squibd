// backend/controllers/authController.js
const db = require('../config/database');

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (!row) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Simple prototype check (production: use bcrypt compare, etc.)
    if (row.password === password) {
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: row.id,
          email: row.email,
          role: row.role
        }
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  });
};
