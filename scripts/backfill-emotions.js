const { Song } = require('../src/models/Index');
const { getVideoProcessingResults } = require('../src/Services/mongodbService');

async function backfillEmotions() {
  try {
    // Get all processed songs without emotion
    const songs = await Song.findAll({
      where: {
        status: 'processed',
        general_classification: ['', null]
      }
    });

    console.log(`Found ${songs.length} songs without emotion classification`);

    for (const song of songs) {
      console.log(`\nProcessing song ${song.id}: ${song.title}`);

      // Fetch MongoDB data
      const mongoData = await getVideoProcessingResults(song.external_id);

      if (!mongoData) {
        console.log(`  ❌ No MongoDB data found`);
        continue;
      }

      // Check for emotion classification stage
      if (mongoData.stages?.emotion_classification?.status === 'completed') {
        const emotion = mongoData.stages.emotion_classification.emotion;
        console.log(`  ✅ Found emotion: ${emotion}`);

        await Song.update(
          { general_classification: emotion },
          { where: { id: song.id } }
        );

        console.log(`  ✅ Updated song ${song.id} with emotion: ${emotion}`);
      } else {
        console.log(`  ❌ No emotion_classification stage or not completed`);
        console.log(`  Available stages: ${Object.keys(mongoData.stages || {}).join(', ')}`);
      }
    }

    console.log('\n✅ Backfill complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

backfillEmotions();
