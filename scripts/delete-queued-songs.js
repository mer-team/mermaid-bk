/**
 * Delete Queued Songs Script
 * 
 * This script deletes all songs with status 'queued' from the database.
 * Run with: node scripts/delete-queued-songs.js
 */

require('dotenv').config();

const { Song, Song_Segments, Log, Source, Feedback } = require('../src/models/Index');

async function deleteQueuedSongs() {
    try {
        console.log('🔍 Finding queued songs...');

        // Find all queued songs
        const queuedSongs = await Song.findAll({
            where: { status: 'queued' },
            attributes: ['id', 'external_id', 'title', 'status', 'createdAt']
        });

        if (queuedSongs.length === 0) {
            console.log('✅ No queued songs found. Nothing to delete.');
            process.exit(0);
        }

        console.log(`\n📋 Found ${queuedSongs.length} queued song(s):\n`);

        queuedSongs.forEach((song, index) => {
            console.log(`  ${index + 1}. [ID: ${song.id}] ${song.title}`);
            console.log(`     External ID: ${song.external_id}`);
            console.log(`     Created: ${song.createdAt}\n`);
        });

        // Get song IDs for deletion
        const songIds = queuedSongs.map(s => s.id);

        console.log('🗑️  Deleting related data...');

        // Delete related records first (foreign key constraints)
        const deletedSegments = await Song_Segments.destroy({ where: { song_id: songIds } });
        console.log(`   - Deleted ${deletedSegments} segment(s)`);

        const deletedLogs = await Log.destroy({ where: { song_id: songIds } });
        console.log(`   - Deleted ${deletedLogs} log(s)`);

        const deletedSources = await Source.destroy({ where: { song_id: songIds } });
        console.log(`   - Deleted ${deletedSources} source(s)`);

        const deletedFeedback = await Feedback.destroy({ where: { song_id: songIds } });
        console.log(`   - Deleted ${deletedFeedback} feedback(s)`);

        // Delete the songs
        const deletedSongs = await Song.destroy({ where: { status: 'queued' } });
        console.log(`   - Deleted ${deletedSongs} song(s)`);

        console.log('\n✅ Successfully deleted all queued songs!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error deleting queued songs:', error);
        process.exit(1);
    }
}

deleteQueuedSongs();
