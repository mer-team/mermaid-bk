const { Song, Log: SongLog, Song_Segments: SongSegment, Source } = require('../models/Index');

// Stage to progress mapping (based on pipeline stages)
const STAGE_PROGRESS = {
  queued: 5,
  download: 20,
  segmentation: 35,
  separation: 50,
  transcription_full: 65,
  transcription_vocals: 75,
  emotion_classification: 85,
  completed: 100,
};

const handleProcessingComplete = async (req, res) => {
  const { songId, emotion, lyrics, voice, instrumental } = req.body;

  try {
    // Paths from microservices follow the pattern:
    // lyrics: /app/lyrics/{title}_lyrics.txt or {title}_vocals_lyrics.txt
    // voice: /app/separated/htdemucs/{title}/vocals.mp3
    // instrumental: /app/separated/htdemucs/{title}/other.mp3 (or combination of drums+bass+other)

    await Song.update(
      { status: 'processed', general_classification: emotion },
      { where: { external_id: songId.external_id } },
    );

    await Source.create({ song_id: songId.id, lyrics, voice, instrumental, createdAt: new Date() });

    console.log(`[API] Song processing completed: ${songId.external_id}`);
    res.status(200).json({ message: 'Song processing completed' });
  } catch (error) {
    console.error('Error processing song completion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const handleProcessingLog = async (req, res) => {
  const { songId, logMessage, service } = req.body;

  try {
    await SongLog.create({
      song_id: songId,
      message: logMessage,
      service: service || 'unknown',
      type: 'info',
    });

    console.log(`[LOG] [${service || 'unknown'}] ${logMessage}`);
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
    await SongSegment.create({ song_id: songId, start: segmentStart, end: segmentEnd, emotion });

    console.log(`[API] Segment saved: ${segmentStart}-${segmentEnd}s, emotion: ${emotion}`);
    res.status(200).json({ message: 'Song segments received' });
  } catch (error) {
    console.error('Error saving song segments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// New handler for pipeline stage updates
const handleStageUpdate = async (req, res) => {
  const { songId, external_id, stage, status, message } = req.body;

  try {
    // Log the stage update
    await SongLog.create({
      song_id: songId,
      message: message || `Stage: ${stage} - Status: ${status}`,
      service: 'pipeline-manager',
      type: 'info',
    });

    // Emit progress via Socket.io if needed
    // You can access req.app.get('io') if you set it up in index.js
    const io = req.app.get('io');
    if (io) {
      const progress = STAGE_PROGRESS[stage] || 50;
      io.emit('progress', {
        progress: progress,
        song_id: external_id,
        state: message || `Stage: ${stage}`,
      });
    }

    console.log(`[STAGE UPDATE] ${external_id}: ${stage} - ${status}`);
    res.status(200).json({ message: 'Stage update received' });
  } catch (error) {
    console.error('Error handling stage update:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// New handler for pipeline errors
const handlePipelineError = async (req, res) => {
  const { songId, external_id, stage, error: errorMessage } = req.body;

  try {
    // Update song status to error
    await Song.update({ status: 'error' }, { where: { id: songId } });

    // Log the error
    await SongLog.create({
      song_id: songId,
      message: `Error at stage ${stage}: ${errorMessage}`,
      service: 'pipeline-manager',
      type: 'error',
    });

    // Emit error via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('classification-error', {
        songId: external_id,
        error: errorMessage,
        stage: stage,
      });
    }

    console.error(`[PIPELINE ERROR] ${external_id}: ${errorMessage}`);
    res.status(200).json({ message: 'Error logged' });
  } catch (error) {
    console.error('Error handling pipeline error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  handleProcessingComplete,
  handleProcessingLog,
  handleSongSegments,
  handleStageUpdate,
  handlePipelineError,
};
