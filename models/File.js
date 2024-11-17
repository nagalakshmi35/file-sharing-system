const createFileTable = async (db) => {
  try {
    await db.run(`
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                file_type TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        `);
    console.log("File table initialized.");
  } catch (err) {
    console.error("Error creating File table:", err.message);
  }
};

module.exports = { createFileTable };
