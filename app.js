// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2')

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
       const message = req.body.message;
       const user_id = req.body.user_id;
   
       //save user data in mysql
       const connection = mysql.createConnection({
           host: 'localhost',
           user: 'root',
           password: 'my-secret-pw',
           database: 'conversations'
       });
   
       connection.connect();
   
       // Check if the message is provided
       if (!message) {
           return res.status(400).json({ error: 'Please provide a message in the request body.' });
       }
   
      // Check if the user_id is provided
      if (!user_id) {
          return res.status(400).json({ error: 'Please provide a user_id in the request body.' });
      }
   
       const query = 'INSERT INTO user_messages (user_id, message) VALUES (?, ?)';
       connection.query(query, [user_id, message], (error, results) => {
           if (error) {
               console.error('Error saving user data:', error);
               return res.status(500).json({ error: 'Failed to save user data.' });
           }
           console.log('User data saved successfully:', results);
       });
   
   
       return res.status(200).json({ response: message });
});

//get user messages
app.get('/api/messages/:user_id', (req, res) => {
    const user_id = req.params.user_id;

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'my-secret-pw',
        database: 'conversations'
    });

    connection.connect();

    const query = 'SELECT * FROM user_messages WHERE user_id = ? limit 1';
    connection.query(query, [user_id], (error, results) => {
        if (error) {
            console.error('Error fetching user messages:', error);
            return res.status(500).json({ error: 'Failed to fetch user messages.' });
        }
        res.status(200).json({ messages: results });
    });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Send a POST request to http://localhost:${port}/api/chat with a JSON body:`);
    console.log(`{ "message": "What is a performance review?" }`);
});
