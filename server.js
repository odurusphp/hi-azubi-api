// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');

// Initialize the Express application
const app = express();
const port = 4006;

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

    // Construct the prompt for the Gemini API.
    // The prompt is framed to instruct the model to act as an HR expert.
    const prompt = `You are a helpful and knowledgeable human resources expert. Respond to the following question about an HR topic. Be concise and professional.\n\nUser Question: ${userMessage}`;

    // Prepare the payload for the Gemini API call
    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            responseMimeType: "text/plain"
        }
    };

    // The API key is set to an empty string. The Canvas environment will automatically
    // provide the correct key at runtime.
    const apiKey = "AIzaSyCn00f6JvOqePAtajhyQWEzb-FWznOIWWg";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // Exponential backoff variables for handling API throttling
    const maxRetries = 5;
    const initialDelay = 1000; // 1 second

    try {
        let response;
        for (let i = 0; i < maxRetries; i++) {
            try {
                // Make the API call to the Gemini API
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                // If the response is successful, break the loop
                if (response.ok) {
                    break;
                }

                // If not successful, throw an error to trigger the catch block
                throw new Error(`API call failed with status ${response.status}`);
            } catch (err) {
                if (i < maxRetries - 1) {
                    const delay = initialDelay * Math.pow(2, i);
                    console.log(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw err; // Re-throw the error on the last retry
                }
            }
        }

        // Check if a successful response was received
        if (!response || !response.ok) {
            throw new Error('Failed to get a successful response from the Gemini API after multiple retries.');
        }

        const result = await response.json();

        // Extract the generated text from the API response
        const aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        // If a response was found, send it back to the client
        if (aiResponse) {
            res.status(200).json({ response: aiResponse });
        } else {
            // Handle cases where the response is missing or in an unexpected format
            console.log('API response was missing expected content:', result);
            res.status(500).json({ error: 'Failed to get a valid response from the AI model.' });
        }

    } catch (error) {
        // Log the error and send a 500 status back to the client
        console.error('Error during API call:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Send a POST request to http://localhost:${port}/api/chat with a JSON body:`);
    console.log(`{ "message": "What is a performance review?" }`);
});
