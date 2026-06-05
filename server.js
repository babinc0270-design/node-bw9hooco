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
        // Sanitize URL to remove tracking junk
        const cleanUrl = url.split('?')[0]; 
        
        const options = {
            method: 'GET',
            url: 'https://instagram-reels-downloader-api.p.rapidapi.com/download', 
            params: { url: cleanUrl },
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 
                'X-RapidAPI-Host': 'instagram-reels-downloader-api.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        
        // This is the raw JSON from your screenshot
        const apiResponse = response.data; 
        
        // THIS IS THE FIX: The API wraps all the good stuff inside a second 'data' object!
        const videoData = apiResponse.data; 

        let videoUrl = null;

        // Now we look inside videoData to find the medias array
        if (videoData?.medias && Array.isArray(videoData.medias) && videoData.medias.length > 0) {
            videoUrl = videoData.medias[0].url;
        } 
        else if (videoData?.video_url) {
            videoUrl = videoData.video_url;
        }

        if (!videoUrl) {
            console.log("Failed to find URL in this structure:", apiResponse);
            return res.status(404).json({ 
                error: 'Video link not found in API data. Check Render Logs to see response.' 
            });
        }

        // Send the found URL back to the frontend!
        res.json({ success: true, videoUrl: videoUrl });

    } catch (error) {
        console.error('API Error Details:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch the video. The API might be down.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
