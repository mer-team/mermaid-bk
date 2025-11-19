const { MongoClient } = require('mongodb');
require('dotenv').config();

const { MONGODB_HOST, MONGODB_PORT, MONGODB_USER, MONGODB_PASS, MONGODB_DATABASE } = process.env;

const uri = `mongodb://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`;

let client = null;

async function connectMongoDB() {
  if (client && client.topology && client.topology.isConnected()) {
    return client.db(MONGODB_DATABASE);
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('[MongoDB] Connected to pipeline database');
    return client.db(MONGODB_DATABASE);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    throw error;
  }
}

async function getVideoProcessingResults(externalId) {
  try {
    const db = await connectMongoDB();
    const videosCollection = db.collection('videos');

    console.log(`[MongoDB] Querying for video_id: ${externalId}`);
    const video = await videosCollection.findOne({ video_id: externalId });

    if (!video) {
      console.log(`[MongoDB] No processing results found for video: ${externalId}`);

      // Try to list what videos exist to debug
      const count = await videosCollection.countDocuments();
      console.log(`[MongoDB] Total videos in collection: ${count}`);

      if (count > 0) {
        const sample = await videosCollection.findOne({});
        console.log(`[MongoDB] Sample document structure:`, JSON.stringify(sample, null, 2));
      }

      return null;
    }

    console.log(`[MongoDB] Found processing results for video: ${externalId}`);
    console.log(`[MongoDB] Document:`, JSON.stringify(video, null, 2));
    return video;
  } catch (error) {
    console.error('[MongoDB] Error fetching video results:', error);
    throw error;
  }
}

module.exports = {
  connectMongoDB,
  getVideoProcessingResults,
};
