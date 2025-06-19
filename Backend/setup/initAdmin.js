// setup/initAdmin.js
const db = require('../connection/db');
const bcrypt = require('bcryptjs');

const initAdmin = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS login (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255)
    )
  `;

  db.execute(createTableQuery, (err) => {
    if (err) return console.error('❌ Error creating login table:', err.message);
    console.log('✅ login table ready');

    db.execute('SELECT * FROM login WHERE email = ?', ['admin@gmail.com'], (err, results) => {
      if (err) return console.error('❌ Error checking admin:', err.message);

      if (results.length === 0) {
        const plainPassword = 'admin@1234';
        bcrypt.hash(plainPassword, 10, (err, hash) => {
          if (err) return console.error('❌ Error hashing password:', err.message);

          db.execute(
            'INSERT INTO login (name, email, password) VALUES (?, ?, ?)',
            ['Admin', 'admin@gmail.com', hash],
            (err) => {
              if (err) console.error('❌ Error inserting admin:', err.message);
              else console.log('✅ Default admin user inserted');
            }
          );
        });
      } else {
        console.log('✅ Admin user already exists');
      }
    });
  });
};

module.exports = initAdmin;
