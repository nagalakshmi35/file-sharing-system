Overview

  The File Sharing System is a Node.js application that handles file uploads securely and efficiently. It uses a RESTful API to enable users to upload files to the server and manage them seamlessly. This system is built using Express.js and SQLite for simplicity and scalability.

Purpose

  Secure File Sharing: Allows users to upload files securely.
Database Integration: Stores metadata of uploaded files in a SQLite database for easy retrieval and management.
Scalable Design: Easily extendable for authentication, file previews, and sharing features.

Features

  File upload functionality with Multer middleware.
  File metadata storage using SQLite.
  Simple and lightweight REST API.
  Modular and maintainable code structure.

Technologies Used

  Backend: Node.js, Express.js
  Database: SQLite
  Middleware: Multer for file handling
  Utilities: Body-parser for parsing JSON requests

Setup Instructions

  Prerequisites
  Ensure you have the following installed:
    Node.js (v16 or higher)
    npm (Node Package Manager)

Future Enhancements

  Authentication: Add JWT-based authentication for secure access,
  File Previews: Support file previews for common file types,
  Sharing Links: Generate public or private sharing links for uploaded files.

# Postman API Collection

## Purpose
This folder contains the exported Postman collection for the File Sharing System API. Use it to test the available API endpoints.

## Usage
1. Import the `postman-collection.json` file into Postman.
2. Configure the environment variables (e.g., API base URL) if needed.
3. Test the endpoints as needed.
