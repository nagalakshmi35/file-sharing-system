const db = require("../config/db");
const multer = require("multer");
const jwt = require('jsonwebtoken');
const path = require("path");
require('dotenv').config();

const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid name clashes
  },
});

// Set up file upload with multer
const upload = multer({
  storage, // Temporary folder to store uploaded files
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]; // xlsx

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Invalid file type. Only .pptx, .docx, and .xlsx are allowed."
        ),
        false
      );
    }
    cb(null, true);
  },
});

// API to upload the file
const uploadFile = async (req, res) => {
  // Check if the user is an ops_user
  const { id, user_id, uploaded_at } = req.body;

  // Fetch user details from the database to check their role (example query)
  await db.get("SELECT role FROM users WHERE id = ?", [user_id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Failed to verify user role" });
    }

    // Ensure the user is an 'ops_user'
    if (user && user.role !== "ops_user") {
      return res
        .status(403)
        .json({ error: "Permission denied. Only ops_user can upload files." });
    }

    // File upload logic
    const uploadedFile = req.file; // multer stores the file info in `req.file`
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log(uploadedFile);
    // Process and save the file information into the database
    db.run(
      `INSERT INTO files (id, file_name, file_type, user_id, uploaded_at) VALUES (?, ?, ?, ?, ?)`,
      [id, uploadedFile.originalname, uploadedFile.mimetype, user_id, uploaded_at],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "File upload failed" });
        }
        res.json({ message: "File uploaded successfully" });
      }
    );
  });
};

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Bearer token

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;  // Store the decoded user in the request
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};



module.exports = { upload, uploadFile, authenticateUser };
