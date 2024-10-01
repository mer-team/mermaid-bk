const { Song, Log: SongLog, Song_Segments: SongSegment, Source } = require('../models/Index');

const handleProcessingComplete = async (req, res) => {
  const { songId, emotion, lyrics, voice, instrumental} = req.body;

  try {
    await Song.update(
      { status: 'processed', general_classification: emotion },
      { where: { external_id: songId.external_id } }
    );

    await Source.create(
      { song_id: songId.id, lyrics, voice, instrumental, createdAt: new Date() }
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
    await SongLog.create({ song_id: songId, message: logMessage, type: "info" });
    res.status(200).json({ message: 'Log received' });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const handleSongSegments = async (req, res) => {
  const { songId, segmentStart, segmentEnd, emotion } = req.body;

  try {
    // Save the segments to the database
    await SongSegment.create(
      { song_id: songId, start: segmentStart, end: segmentEnd, emotion }
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
