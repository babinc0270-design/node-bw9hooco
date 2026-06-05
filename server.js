require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Endpoint
app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('instagram.com/reel')) {
        return res.status(400).json({ error: 'Please provide a valid Instagram Reel URL' });
    }

    try {
        // Updated to the new EaseApi endpoint
        const options = {
            method: 'GET',
            url: 'https://instagram-reels-downloader-api.p.rapidapi.com/download', 
            params: { url: url },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 
                // Updated to match the new Host
                'X-RapidAPI-Host': 'instagram-reels-downloader-api.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        
        // --- THIS IS THE CRITICAL FIX FROM YOUR SCREENSHOT ---
        // We look inside the "medias" array for the first item's "url"
        const videoUrl = response.data.medias[0].url; 

        if (!videoUrl) {
            return res.status(404).json({ error: 'Video URL not found. The reel might be private or deleted.' });
        }

        res.json({ success: true, videoUrl: videoUrl });

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch the video. Check your API key or video status.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
