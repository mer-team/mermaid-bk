/**
 * MongoDB Polling Service for Progress Updates
 *
 * This service polls MongoDB periodically to check processing status
 * and emits Socket.io events. Use this if the pipeline manager is not
 * sending stage updates via RabbitMQ.
 */

const { Song } = require('../models/Index');
const { getVideoProcessingResults } = require('./mongodbService');

// Stage progress mapping
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

// Track last known progress for each song to avoid duplicate emissions
const lastProgress = new Map();

async function pollProcessingSongs(io) {
  try {
    // Find all songs currently processing (logging disabled to reduce noise)
    const processingSongs = await Song.findAll({
      where: { status: 'processing' },
      attributes: ['id', 'external_id', 'title'],
      logging: false,
    });

    if (processingSongs.length === 0) {
      return; // No songs processing
    }

    console.log(`[MongoDB Poller] Checking ${processingSongs.length} processing songs`);

    // Check each song's progress in MongoDB
    for (const song of processingSongs) {
      try {
        const mongoData = await getVideoProcessingResults(song.external_id);

        if (!mongoData || !mongoData.stages) {
          continue;
        }

        // Find current stage
        const stages = mongoData.stages;
        const stageOrder = [
          'download',
          'segmentation',
          'separation',
          'transcription_full',
          'transcription_vocals',
          'emotion_classification',
        ];

        let currentStage = null;
        let currentProgress = 5;

        for (const stage of stageOrder) {
          if (stages[stage]) {
            if (stages[stage].status === 'completed') {
              currentStage = stage;
              currentProgress = STAGE_PROGRESS[stage];
            } else if (stages[stage].status === 'processing') {
              currentStage = stage;
              currentProgress = STAGE_PROGRESS[stage];
              break;
            }
          }
        }

        // Check if progress changed
        const lastKnownProgress = lastProgress.get(song.external_id) || 0;

        if (currentProgress !== lastKnownProgress) {
          // Progress changed - emit Socket.io event
          const progressData = {
            progress: currentProgress,
            song_id: song.external_id,
            state: STAGE_MESSAGES[currentStage] || 'Processing',
          };

          console.log(
            `[MongoDB Poller] Progress update for ${song.external_id}: ${currentProgress}% (${currentStage})`,
          );

          // Emit to specific song room
          io.to(`song_${song.external_id}`).emit('progress', progressData);

          // Emit to global room
          io.to('global').emit('progress', progressData);

          // Update last known progress
          lastProgress.set(song.external_id, currentProgress);
        }

        // Check if completed
        if (mongoData.status === 'completed') {
          console.log(`[MongoDB Poller] Song ${song.external_id} completed - updating database`);

          // This will be handled by the completion message from RabbitMQ
          // But if it doesn't arrive, we can handle it here
          // For now, just emit 100% progress
          const completionData = {
            progress: 100,
            song_id: song.external_id,
            state: 'Processing complete',
          };

          io.to(`song_${song.external_id}`).emit('progress', completionData);
          io.to('global').emit('progress', completionData);

          io.to(`song_${song.external_id}`).emit('song-classified', {
            songId: song.external_id,
            message: 'The song classification is finished',
          });
          io.to('global').emit('song-classified', {
            songId: song.external_id,
            message: 'The song classification is finished',
          });

          // Remove from tracking
          lastProgress.delete(song.external_id);
        }
      } catch (error) {
        console.error(`[MongoDB Poller] Error checking song ${song.external_id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[MongoDB Poller] Error in polling cycle:', error);
  }
}

// Start polling service
function startMongoDBPoller(io, intervalMs = 3000) {
  console.log(`[MongoDB Poller] Starting with ${intervalMs}ms interval`);

  // Poll immediately
  pollProcessingSongs(io);

  // Then poll at intervals
  const intervalId = setInterval(() => {
    pollProcessingSongs(io);
  }, intervalMs);

  return intervalId;
}

module.exports = { startMongoDBPoller };
