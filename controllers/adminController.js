// backend/controllers/adminController.js
const db = require('../config/database');

// Get all users
exports.getAllUsers = (req, res) => {
  db.all(`SELECT id, email, role FROM Users`, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    return res.status(200).json(rows);
  });
};

// Update user (email/password)
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;

  db.run(
    `UPDATE Users SET email = ?, password = ? WHERE id = ?`,
    [email, password, id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ message: 'User updated successfully' });
    }
  );
};

// Create new user
//exports.createUser = (req, res) => {
  //const { email, password, role } = req.body;
  //if (!email || !password || !role) {
    //return res.status(400).json({ message: 'Missing fields' });
  //}

  //db.run(
    //`INSERT INTO Users (email, password, role) VALUES (?, ?, ?)`,
    //[email, password, role],
    //function (err) {
      //if (err) {
        //console.error(err);
        //return res.status(500).json({ message: 'Database error' });
      //}
      //return res.status(200).json({ message: 'User created successfully' });
    //}
  //);
//};

// Get all records
exports.getAllRecords = (req, res) => {
  const { orgId } = req.query;
  let query = `SELECT *, datetime(created_at) as created_at FROM EmploymentRecords`;
  const params = [];

  if (orgId) {
    query += ` WHERE organization_id = ?`;
    params.push(orgId);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    return res.status(200).json(rows);
  });
};

// Update record
exports.updateRecord = (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    ssn,
    job_start_date,
    job_end_date,
    status,
    job_type,
    organization_id
  } = req.body;

  db.run(
    `UPDATE EmploymentRecords
     SET full_name = ?, ssn = ?, job_start_date = ?, job_end_date = ?, status = ?, job_type = ?, organization_id = ?
     WHERE id = ?`,
    [full_name, ssn, job_start_date, job_end_date, status, job_type, organization_id, id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Record not found' });
      }
      return res.status(200).json({ message: 'Record updated successfully' });
    }
  );
};

// Reset database
exports.resetDatabase = (req, res) => {
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS EmploymentRecords');
    db.run('DROP TABLE IF EXISTS Users');

    // Recreate
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS EmploymentRecords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        ssn TEXT,
        job_start_date TEXT,
        job_end_date TEXT,
        status TEXT,
        job_type TEXT,
        organization_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert preload
    const usersToPreload = [
      { email: 'org1@example.com',    password: 'orgpass1',    role: 'org' },
      { email: 'org2@example.com',    password: 'orgpass2',    role: 'org' },
      { email: 'worker1@example.com', password: 'workerpass',  role: 'worker' },
      { email: 'admin@example.com',   password: 'adminpass',   role: 'admin' }
    ];

    usersToPreload.forEach((user) => {
      db.run(
        `INSERT OR IGNORE INTO Users (email, password, role) VALUES (?, ?, ?)`,
        [user.email, user.password, user.role]
      );
    });
  });

  return res.status(200).json({ message: 'Database has been reset.' });
};
