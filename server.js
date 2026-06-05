// 1. Load environment variables first!
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

  // Validate the input URL
  if (!url || !url.includes('instagram.com/reel')) {
    return res
      .status(400)
      .json({ error: 'Please provide a valid Instagram Reel URL' });
  }

  try {
    // Prepare the request to RapidAPI
    const options = {
      method: 'GET',
      url: 'https://instagram-downloader-download-instagram-videos-stories.p.rapidapi.com/index',
      params: { url: url },
      headers: {
        // This safely pulls your key from the .env file
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host':
          'instagram-downloader-download-instagram-videos-stories.p.rapidapi.com',
      },
    };

    // Send the request
    const response = await axios.request(options);

    // Extract the video URL from the API response
    const videoUrl = response.data.video_url;

    if (!videoUrl) {
      return res
        .status(404)
        .json({
          error: 'Video URL not found. The reel might be private or deleted.',
        });
    }

    // Send the direct video link back to your frontend
    res.json({ success: true, videoUrl: videoUrl });
  } catch (error) {
    console.error('API Error:', error.message);
    res
      .status(500)
      .json({
        error: 'Failed to fetch the video. Check your API key or video status.',
      });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
