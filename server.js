require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Endpoint
app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('instagram.com')) {
        return res.status(400).json({ error: 'Please provide a valid Instagram URL.' });
    }

    try {
        // --- THE URL SANITIZER FIX ---
        // Splits the string at the '?' and takes the first part, completely removing tracking junk
        const cleanUrl = url.split('?')[0]; 
        
        console.log("=== URL SANITIZATION ===");
        console.log("Raw received URL:", url);
        console.log("Cleaned URL sent to API:", cleanUrl);
        console.log("========================");

        const options = {
            method: 'GET',
            url: 'https://instagram-reels-downloader-api.p.rapidapi.com/download', 
            params: { url: cleanUrl }, // Passing the cleaned URL here
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 
                'X-RapidAPI-Host': 'instagram-reels-downloader-api.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        const data = response.data;
        
        console.log("=== RAPIDAPI RAW RESPONSE ===");
        console.log(JSON.stringify(data, null, 2));
        console.log("=============================");

        let videoUrl = null;

        // Cascade extraction paths
        if (data?.medias && Array.isArray(data.medias) && data.medias.length > 0) {
            videoUrl = data.medias[0]?.url;
        } 
        else if (Array.isArray(data) && data[0]?.medias && data[0].medias.length > 0) {
            videoUrl = data[0].medias[0]?.url;
        } 
        else if (data?.video_url) {
            videoUrl = data.video_url;
        } 
        else if (data?.url) {
            videoUrl = data.url;
        }

        if (!videoUrl) {
            return res.status(404).json({ 
                error: 'Video link not found in API data. Check Render Logs to see response.' 
            });
        }

        res.json({ success: true, videoUrl: videoUrl });

    } catch (error) {
        console.error('API Error Details:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch the video. The API might be down or your key is invalid.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
