const path = require('path')
const sqlite3 = require("sqlite3");

const dbPath = path.resolve(__dirname, '../file_sharing.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Export the db instance
module.exports = db;
