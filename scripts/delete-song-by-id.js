/**
 * Delete Song by ID Script
 * 
 * This script deletes a specific song by its ID from the database.
 * Run with: node scripts/delete-song-by-id.js <song_id>
 * 
 * Example: node scripts/delete-song-by-id.js 123
 */

require('dotenv').config();

const { Song, Song_Segments, Song_Classification, Log, Source, Feedback } = require('../src/models/Index');

async function deleteSongById(songId) {
    try {
        if (!songId) {
            console.error('❌ Error: Song ID is required');
            console.log('\nUsage: node scripts/delete-song-by-id.js <song_id>');
            console.log('Example: node scripts/delete-song-by-id.js 123');
            process.exit(1);
        }

        // Validate that songId is a number
        const id = parseInt(songId, 10);
        if (isNaN(id)) {
            console.error('❌ Error: Song ID must be a valid number');
            process.exit(1);
        }

        console.log(`🔍 Finding song with ID: ${id}...`);

        // Find the song
        const song = await Song.findByPk(id, {
            attributes: ['id', 'external_id', 'title', 'status', 'createdAt']
        });

        if (!song) {
            console.log(`❌ Song with ID ${id} not found.`);
            process.exit(1);
        }

        console.log('\n📋 Found song:\n');
        console.log(`   ID: ${song.id}`);
        console.log(`   Title: ${song.title}`);
        console.log(`   External ID: ${song.external_id}`);
        console.log(`   Status: ${song.status}`);
        console.log(`   Created: ${song.createdAt}`);

        console.log('\n🗑️  Deleting related data...');

        // Delete related records first (foreign key constraints)
        const deletedSegments = await Song_Segments.destroy({ where: { song_id: id } });
        console.log(`   - Deleted ${deletedSegments} segment(s)`);

        const deletedClassifications = await Song_Classification.destroy({ where: { song_id: id } });
        console.log(`   - Deleted ${deletedClassifications} classification(s)`);

        const deletedLogs = await Log.destroy({ where: { song_id: id } });
        console.log(`   - Deleted ${deletedLogs} log(s)`);

        const deletedSources = await Source.destroy({ where: { song_id: id } });
        console.log(`   - Deleted ${deletedSources} source(s)`);

        const deletedFeedback = await Feedback.destroy({ where: { song_id: id } });
        console.log(`   - Deleted ${deletedFeedback} feedback(s)`);

        // Delete the song
        await Song.destroy({ where: { id: id } });
        console.log(`   - Deleted song`);

        console.log(`\n✅ Successfully deleted song "${song.title}" (ID: ${id})!`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error deleting song:', error);
        process.exit(1);
    }
}

// Get song ID from command line arguments
const songId = process.argv[2];
deleteSongById(songId);
