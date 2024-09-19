const { Song, Log: SongLog, Song_Segments: SongSegment } = require('../models/Index');

const handleProcessingComplete = async (req, res) => {
  const { songId, result } = req.body;

  try {
    await Song.update(
      { status: 'processed', general_classification: result }, 
      { where: { id: songId } }
    );
    res.status(200).json({ message: 'Song processing completed' });
  } catch (error) {
    console.error('Error processing song completion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const handleProcessingLog = async (req, res) => {
  const { songId, logMessage } = req.body;

  try {
    await SongLog.create({ song_id: songId, message: logMessage });
    res.status(200).json({ message: 'Log received' });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const handleSongSegments = async (req, res) => {
  const { songId, segments } = req.body;

  try {
    // Save the segments to the database
    await SongSegment.bulkCreate(
      segments.map(segment => ({
        song_id: songId, // Make sure song_id is used here and it matches your DB column
        ...segment,      // Spread other properties if they match DB columns
      }))
    );

    res.status(200).json({ message: 'Song segments received' });
  } catch (error) {
    console.error('Error saving song segments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  handleProcessingComplete,
  handleProcessingLog,
  handleSongSegments,
};
