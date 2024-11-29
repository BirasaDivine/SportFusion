import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Importing fetch from node-fetch v3.x (ESM)

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*',  // Allow requests from any origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  credentials: true
}));

// Proxy endpoint
app.get('/football-api/*', async (req, res) => {
  const apiUrl = `https://api.football-data.org/v4${req.url.replace('/football-api', '')}`;
  
  // Log the API URL to see if it's correct
  console.log(`API Request URL: ${apiUrl}`);

  try {
    // Fetch data from external API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-auth-token': '2f648a8656184d4e867e5d8152a9427f', // Your API key
        'Content-Type': 'application/json'
      }
    });

    // Log response status
    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch data. Status: ${response.status}`);
    }

    const data = await response.json();
    // Log the response data to check what is returned from the API
    console.log('API Data:', data);
    
    res.json(data);  // Send the data back to the client

  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
