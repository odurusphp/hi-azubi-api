// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');

// Initialize the Express application
const app = express();
const port = 4008;

// Middleware to parse JSON bodies from incoming requests
app.use(bodyParser.json());

// Main API endpoint to handle chat requests
app.post('/api/chat', async (req, res) => {
    // Log the incoming request body for debugging purposes
    console.log('Received request:', req.body);
    // Get the user's message from the request body
    const userMessage = req.body.message;
    // Check if the message is provided
    if (!userMessage) {
        return res.status(400).json({ error: 'Please provide a message in the request body.' });
    }

    return res.status(200).json({ response: userMessage });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Send a POST request to http://localhost:${port}/api/chat with a JSON body:`);
    console.log(`{ "message": "What is a performance review?" }`);
});
