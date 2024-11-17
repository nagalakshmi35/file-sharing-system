const createUserTable = async (db) => {
  try {
    await db.exec(
      `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            email_verified INTEGER DEFAULT 0
        )`
    )
    console.log("User table initialized.");

  } catch (err) {
   
      console.error("Error creating User table:", err.message);

  }
};

module.exports = { createUserTable };
