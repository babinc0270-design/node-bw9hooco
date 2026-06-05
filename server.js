require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
// Render automatically assigns a PORT, so we listen to theirs first, or fallback to 3000 locally
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves your index.html and village image

// API Endpoint
app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('instagram.com/reel')) {
        return res.status(400).json({ error: 'Please provide a valid Instagram Reel URL.' });
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

        const response = await axios.request(options);
        
        // The magical fix: accessing the first item in the array, then the medias array
        const videoUrl = response.data[0]?.medias[0]?.url; 

        if (!videoUrl) {
            console.log("RapidAPI returned:", response.data); // Logs to Render so you can debug if it fails
            return res.status(404).json({ error: 'Video not found. The reel might be private or deleted.' });
        }

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
