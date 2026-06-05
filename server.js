require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
// Render automatically assigns a PORT env variable, so we listen to that, or fallback to 3000 locally
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your index.html and village background image

// API Endpoint
app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    // Basic validation to check if a URL is provided and looks like an Instagram link
    if (!url || !url.includes('instagram.com')) {
        return res.status(400).json({ error: 'Please provide a valid Instagram URL.' });
    }

    try {
        const options = {
            method: 'GET',
            url: 'https://instagram-reels-downloader-api.p.rapidapi.com/download', 
            params: { url: url },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 
                'X-RapidAPI-Host': 'instagram-reels-downloader-api.p.rapidapi.com'
            }
        };

        // Send request to RapidAPI
        const response = await axios.request(options);
        
        // Extract the video URL safely using optional chaining (?.)
        // This targets the first item inside the 'medias' array directly from the response object
        const videoUrl = response.data?.medias?.[0]?.url; 

        if (!videoUrl) {
            // Logs the unexpected structure to your Render console so you can see what the API returned
            console.log("RapidAPI returned data, but video URL structure was missing:", response.data); 
            return res.status(404).json({ error: 'Video not found. The reel might be private, deleted, or the link is invalid.' });
        }

        // Return the extracted direct video link back to your frontend
        res.json({ success: true, videoUrl: videoUrl });

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch the video. Check your API key or video status.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
