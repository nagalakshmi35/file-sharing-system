const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtSecret'); // Make sure to store your secret key in a config file
const nodemailer = require('nodemailer');  // For sending emails
require('dotenv').config();

const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';


const registerUser = async (req, res) => {
    const { id, username, email, password, role, email_verified } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        // Check if the user is a 'client_user' and handle email verification first
        if (role === 'client_user') {
            const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour
            const encryptedUrl = `https://yourwebsite.com/verify-email?token=${token}`;

            // Setup nodemailer transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: "smtp.example.com",
                port: 587,
                secure: false, 
                auth: {
                    user: process.env.USER, // Replace with your email
                    pass: process.env.APP_PASSWORD, // Replace with your app password
                },
            });

            // Email options
            const mailOptions = {
                from: {
                    name: 'Venkata Sai',
                    address: process.env.USER
                },
                to: ['karnatinagalakshmi35@gmail.com'],
                subject: 'Email Verification',
                text: `Please verify your email by clicking the following link: ${encryptedUrl}`,
            };

            // Try sending the email
            const sendEmail = async(transporter, mailOptions) => {
                try {
                    await transporter.sendMail(mailOptions)
                    console.log('Email has been sent!')
                }catch(error) {
                    console.error(error)
                }
            } // Send email

            sendEmail(transporter, mailOptions)
        }

        // Insert the user into the database
        await db.run(
            `INSERT INTO users (id, username, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, username, email, hashedPassword, role, email_verified],
            (err) => {
                if (err) {
                    return res.status(400).json({ error: 'Email already exists' });
                }

                res.json({
                    message: role === 'client_user'
                        ? 'User registered successfully. Please check your email for verification.'
                        : 'User registered successfully.',
                });
            }
        );
    } catch (error) {
        // Handle errors in sending email or database insertion
        console.error('Error:', error);
        if (role === 'client_user') {
            return res.status(500).json({ error: 'Failed to send verification email. User not registered.' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Endpoint to verify email
const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        // Decode the token
        const decoded = jwt.verify(token, secretKey);
        const { email } = decoded;

        // Update the user's email_verified status in the database
        await db.run(
            `UPDATE users SET email_verified = 1 WHERE email = ?`,
            [email],
            (err) => {
                if (err) {
                    return res.status(400).json({ error: 'Failed to verify email' });
                }
                res.json({ message: 'Email verified successfully. You can now log in.' });
            }
        );
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Step 1: Check if the user exists
    await db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Step 2: Verify the password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Error comparing passwords' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            // Step 3: Generate a JWT token
            const payload = {
                "userId": user.id,
                "email": user.email,
                "role": user.role,
            };

            const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

            // Step 4: Send the token as response
            res.json({ message: 'Login successful', token });
        });
    });
};


module.exports = { registerUser, loginUser, verifyEmail };
