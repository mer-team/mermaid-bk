const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.YOUTUBE_API_KEY;

const searchYouTube = async (req, res) => {
  try {
    const { q, maxResults = 4 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`[YouTube Search] Query: ${q}, MaxResults: ${maxResults}`);

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: q,
        maxResults: maxResults,
        type: 'video',
        videoCategoryId: '10', // Music category
        key: API_KEY,
      },
    });

    // Transform data to match frontend expectations
    const videos = response.data.items.map((item) => ({
      id: item.id.videoId,
      thumbnail: item.snippet.thumbnails.default.url,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    console.log(`[YouTube Search] Found ${videos.length} results`);
    res.json(videos);
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 'Failed to search YouTube',
    });
  }
};

module.exports = {
  searchYouTube,
};
