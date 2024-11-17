const express = require("express");
const bodyParser = require("body-parser");
const { verifyEmail } = require("./controllers/authController");
const { authenticateUser } = require("./controllers/fileController");
const db = require("./config/db");
const path = require("path");
const jwt = require("jsonwebtoken");
const download = require("download");
const fs = require("fs");
require("dotenv").config();

const { createUserTable } = require("./models/User");
const { createFileTable } = require("./models/File");

const app = express();

app.use(bodyParser.json());
app.use(express.json());
const PORT = 5001;

const secretKey = process.env.JWT_SECRET || "defaultSecretKey";

// Routes (Placeholder for your actual routes)
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");

app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.get("/users", async (req, res) => {
  try {
    const resultUsers = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users;", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    res.json(resultUsers);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error retrieving users", error: err.message });
  }
});
app.get("/verify-email", verifyEmail);

// API to generate secure download URL
app.get("/generate-download-url", authenticateUser, async (req, res) => {
  const { id } = req.query; // Assume fileId is passed as a query parameter

  // Check if the user is a client_user
  if (req.user.role !== "client_user") {
    return res.status(403).json({
      error: "Access denied. Only client_user can access the download.",
    });
  }

  try {
    // Retrieve file details from the database

    const file = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
        if (err) {
          reject(err); // Reject the promise if there's an error
        } else {
          resolve(row); // Resolve the promise with the row data
        }
      });
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    console.log(file);
    // Create a JWT token for downloading the file
    const downloadToken = jwt.sign({ id }, secretKey, {
      expiresIn: "1h",
    });

    // Generate the secure download URL
    const downloadUrl = `https://yourwebsite.com/download-file?token=${downloadToken}`;

    // Send the secure URL to the client
    res.json({ message: "Secure URL generated successfully", downloadUrl });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// API to handle file download
app.get("/download-file", authenticateUser, async (req, res) => {
  const { token } = req.query; // Retrieve the token from the query parameter


  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  try {
    // Decode the token and verify the fileId
    const decoded = jwt.verify(token, secretKey);
    const { id } = decoded;

    // Check if the user is authorized (must be 'client_user')
    if (req.user.role !== "client_user") {
      return res
        .status(403)
        .json({ error: "Access denied. Only client_user can download files." });
    }

    // Retrieve the file details from the database
    const file = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM files WHERE id = ?`, [id], (err, row) => {
        if (err) {
          reject(err); // Reject the promise if there's an error
        } else {
          resolve(row); // Resolve the promise with the row data
        }
      });
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Path to the file (adjust to your actual file storage path)
    const filePath = path.join(__dirname, "uploads", file.file_name);
    
    console.log(filePath, !fs.existsSync(filePath))
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on the server" });
    }

    // Send the file as a download response
    res.download(filePath, (err) => {
      // This will prompt the user to download the file
      if (err) {
        return res.status(500).json({ error: "Failed to download the file" });
      }
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

app.get('/uploaded-files-list', authenticateUser, async (req, res) => {
  console.log(req.user.role)
  if (req.user.role !== "client_user") {
    return res.status(403).json({
      error: "Access denied. Only client_user can access the download.",
    });
  }
  
  const resultList = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM files ;`, (err, rows) => {
      if (err) {
        reject(err); // Reject the promise if there's an error
      } else {
        resolve(rows); // Resolve the promise with the row data
      }
    });
  });

  res.json({uploaded_files: resultList})
})
const startApp = async () => {
  try {
    await createUserTable(db);
    await createFileTable(db); // Create the User table
    console.log("Server and database initialized.");

    // Start your server here
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize the app:", error.message);
    process.exit(1);
  }
};

startApp();
