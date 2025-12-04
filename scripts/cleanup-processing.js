require('dotenv').config();

const { Song, Log, Song_Segments, Source } = require('../src/models/Index');

async function cleanupProcessingSongs() {
  try {
    console.log('🔍 Finding songs in processing state...');

    // Find all songs in processing state
    const processingSongs = await Song.findAll({
      where: { status: 'processing' },
      attributes: ['id', 'external_id', 'title', 'artist', 'status', 'createdAt'],
    });

    if (processingSongs.length === 0) {
      console.log('✅ No songs found in processing state.');
      process.exit(0);
    }

    console.log(`\n📋 Found ${processingSongs.length} song(s) in processing state:\n`);
    processingSongs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title} by ${song.artist}`);
      console.log(`   ID: ${song.id}, External ID: ${song.external_id}`);
      console.log(`   Created: ${song.createdAt}\n`);
    });

    // Delete related data first (to avoid foreign key constraints)
    console.log('🗑️  Deleting related data...');

    for (const song of processingSongs) {
      // Delete logs
      const logsDeleted = await Log.destroy({
        where: { song_id: song.id },
      });

      // Delete segments
      const segmentsDeleted = await Song_Segments.destroy({
        where: { song_id: song.id },
      });

      // Delete source files
      const sourcesDeleted = await Source.destroy({
        where: { song_id: song.id },
      });

      console.log(
        `   Song ID ${song.id}: ${logsDeleted} logs, ${segmentsDeleted} segments, ${sourcesDeleted} sources deleted`,
      );
    }

    // Finally, delete the songs
    console.log('\n🗑️  Deleting songs...');
    const deletedCount = await Song.destroy({
      where: { status: 'processing' },
    });

    console.log(`\n✅ Successfully deleted ${deletedCount} song(s) and their related data.`);
    console.log('Songs are ready to be reprocessed!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupProcessingSongs();
