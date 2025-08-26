// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors'); // Import the CORS middleware
require('dotenv').config(); // Load environment variables from .env file

// Initialize the Express application
const app = express();
const port = 4008;

// Middleware to parse JSON bodies from incoming requests
app.use(bodyParser.json());

// Enable CORS for all routes, or specify origins for better security
// app.use(cors()); 
// or
const corsOptions = {
    origin: '*'
};
app.use(cors(corsOptions));

// Create a reusable database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Main API endpoint to handle chat requests
app.post('/api/chat', async (req, res) => {
    try {
        console.log('Received request:', req.body);
        const { message, user_id } = req.body;

        // Check for required fields
        if (!message || !user_id) {
            return res.status(400).json({ error: 'Please provide a message and a user_id.' });
        }

        // Save user data to MySQL
        const query = 'INSERT INTO user_messages (user_id, message) VALUES (?, ?)';
        await pool.execute(query, [user_id, message]);

        console.log('User data saved successfully.');
        return res.status(200).json({ response: message });
    } catch (error) {
        console.error('Error in /api/chat:', error);
        return res.status(500).json({ error: 'Failed to process request.' });
    }
});

// Get user messages
app.get('/api/messages/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // Fetch user messages from the database
        const query = 'SELECT * FROM user_messages WHERE user_id = ? LIMIT 1';
        const [rows] = await pool.execute(query, [user_id]);

        res.status(200).json({ messages: rows });
    } catch (error) {
        console.error('Error in /api/messages/:user_id:', error);
        return res.status(500).json({ error: 'Failed to fetch user messages.' });
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`To test, send a POST request to http://localhost:${port}/api/chat with a JSON body like:`);
    console.log(`{ "message": "What is a performance review?", "user_id": 123 }`);
});