const db = require('./config/database');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS EmploymentRecords');
  db.run('DROP TABLE IF EXISTS Users');
});

db.close();
