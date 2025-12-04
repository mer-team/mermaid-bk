const { Song, Log: SongLog, Song_Segments: SongSegment, Source } = require('../models/Index');
const { getVideoProcessingResults } = require('../Services/mongodbService');

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

// User-friendly stage messages
const STAGE_MESSAGES = {
  queued: 'Queued for processing',
  download: 'Downloading audio from YouTube',
  segmentation: 'Segmenting audio into parts',
  separation: 'Separating vocals and instruments',
  transcription_full: 'Transcribing full audio',
  transcription_vocals: 'Transcribing vocals',
  emotion_classification: 'Analyzing emotions',
  completed: 'Processing complete',
};

// Function to calculate progress from MongoDB stages
const calculateProgressFromMongoDB = (mongoData) => {
  if (!mongoData || !mongoData.stages) {
    return { progress: 0, state: 'Unknown', currentStage: null };
  }

  const stages = mongoData.stages;
  const stageOrder = [
    'download',
    'segmentation',
    'separation',
    'transcription_full',
    'transcription_vocals',
    'emotion_classification',
  ];

  // Find the last completed or currently processing stage
  let lastCompletedStage = null;
  let currentStage = null;

  for (const stage of stageOrder) {
    if (stages[stage]) {
      if (stages[stage].status === 'completed') {
        lastCompletedStage = stage;
      } else if (stages[stage].status === 'processing' || stages[stage].status === 'pending') {
        currentStage = stage;
        break; // Stop at first non-completed stage
      } else if (stages[stage].status === 'failed') {
        // If failed, use the stage before it as last completed
        break;
      }
    }
  }

  // If all stages are complete or we're at the last stage
  if (mongoData.status === 'completed') {
    return {
      progress: 100,
      state: STAGE_MESSAGES.completed,
      currentStage: 'completed',
    };
  }

  // Determine progress based on current stage
  const activeStage = currentStage || lastCompletedStage;
  if (activeStage) {
    const progress = STAGE_PROGRESS[activeStage] || 0;
    const state = STAGE_MESSAGES[activeStage] || `Processing: ${activeStage}`;

    return {
      progress,
      state,
      currentStage: activeStage,
      status: stages[activeStage]?.status,
    };
  }

  return { progress: 5, state: 'Queued for processing', currentStage: 'queued' };
};

const handleProcessingComplete = async (req, res) => {
  console.log(
    '[API] handleProcessingComplete called with body:',
    JSON.stringify(req.body, null, 2),
  );

  const { songId } = req.body;

  try {
    console.log(`[API] Updating song ${songId.external_id} to processed status...`);

    // Fetch processing results from MongoDB to get emotion classification
    const mongoData = await getVideoProcessingResults(songId.external_id);

    // Extract emotion if available
    let emotion = null;
    if (mongoData?.stages?.emotion_classification?.status === 'completed') {
      emotion = mongoData.stages.emotion_classification.emotion;
      console.log(`[API] Found emotion classification: ${emotion}`);
    } else {
      console.log('[API] No emotion classification found in MongoDB');
    }

    // Update song status and emotion
    const updateData = { status: 'processed' };
    if (emotion) {
      updateData.general_classification = emotion;
    }

    const [updatedRows] = await Song.update(updateData, {
      where: { external_id: songId.external_id },
    });

    console.log(`[API] Updated ${updatedRows} rows`);
    console.log(
      `[API] Song processing completed: ${songId.external_id}${emotion ? ` (emotion: ${emotion})` : ''}`,
    );

    // Emit 100% progress and completion event
    const io = req.app.get('io');
    if (io) {
      const progressData = {
        progress: 100,
        song_id: songId.external_id,
        state: 'Processing complete',
      };

      const completionData = {
        songId: songId.external_id,
        message: 'The song classification is finished',
      };

      // Emit to specific song room
      io.to(`song_${songId.external_id}`).emit('progress', progressData);
      io.to(`song_${songId.external_id}`).emit('song-classified', completionData);

      // Emit to global room
      io.to('global').emit('progress', progressData);
      io.to('global').emit('song-classified', completionData);

      //console.log(`[Socket.io] Emitted completion for song: ${songId.external_id}`);
    }

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
      const stateMessage = STAGE_MESSAGES[stage] || message || `Processing: ${stage}`;

      const progressData = {
        progress: progress,
        song_id: external_id,
        state: stateMessage,
      };

      // Emit to specific song room (for dedicated listeners)
      io.to(`song_${external_id}`).emit('progress', progressData);

      // Emit to global room (for Queue page / global listeners)
      io.to('global').emit('progress', progressData);

      //console.log(`[Socket.io] Emitted progress: ${progress}% - ${stateMessage} (${external_id})`);
    } else {
      console.warn('[Socket.io] io instance not available');
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
      const errorData = {
        songId: external_id,
        error: errorMessage,
        stage: stage,
      };

      // Emit to specific song room
      io.to(`song_${external_id}`).emit('classification-error', errorData);

      // Emit to global room
      io.to('global').emit('classification-error', errorData);
    }

    console.error(`[PIPELINE ERROR] ${external_id}: ${errorMessage}`);
    res.status(200).json({ message: 'Error logged' });
  } catch (error) {
    console.error('Error handling pipeline error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get processing progress from MongoDB
const getProcessingProgress = async (req, res) => {
  const { external_id } = req.params;

  try {
    console.log(`[API] Checking progress for: ${external_id}`);

    // First check if song exists in SQL
    const song = await Song.findOne({ where: { external_id } });
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // If already processed, return 100%
    if (song.status === 'processed') {
      return res.status(200).json({
        progress: 100,
        state: 'Processing complete',
        status: 'processed',
        currentStage: 'completed',
      });
    }

    // If error state
    if (song.status === 'error') {
      return res.status(200).json({
        progress: 0,
        state: 'Processing failed',
        status: 'error',
        currentStage: null,
      });
    }

    // Fetch from MongoDB
    const mongoData = await getVideoProcessingResults(external_id);

    if (!mongoData) {
      // Song is queued but not yet in MongoDB
      return res.status(200).json({
        progress: 5,
        state: 'Queued for processing',
        status: song.status,
        currentStage: 'queued',
      });
    }

    // Calculate progress from MongoDB stages
    const progressInfo = calculateProgressFromMongoDB(mongoData);

    return res.status(200).json({
      ...progressInfo,
      song_id: song.id,
      external_id: external_id,
      title: song.title,
    });
  } catch (error) {
    console.error('[API] Error getting processing progress:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleProcessingComplete,
  handleProcessingLog,
  handleSongSegments,
  handleStageUpdate,
  handlePipelineError,
  getProcessingProgress,
};
