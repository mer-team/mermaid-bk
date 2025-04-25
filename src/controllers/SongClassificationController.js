require('dotenv').config();
const { Song_Classification } = require('../models/index');
const { Log, Song } = require('../models/index');
const async = require('async');
const { io } = require('../index');
const { Op } = require('sequelize');
var search = require('youtube-search');
const { sendMessage } = require('../Services/rabbitmqService');
const formatter = require('../utils/responseFormatter');

//////////////////////////////////////////////////////////////
//Functions in test///////////////////////////////////////////
var ip, userId, request; //Ip of the user

async function saveLog(msg, id) {
  await Log.create({
    message: msg,
    service: 'song classification',
    song_id: id,
    type: 'info',
  })
    .then((log) => {
      console.log('Log created');
    })
    .catch((e) => {
      console.log(e);
    });
}
//Save the song to the database
function saveTheSong(songId) {
  var opts = {
    key: process.env.YOUTUBE_API_KEY,
  };

  search(`https://www.youtube.com/watch?v=${songId}`, opts, async function (err, results) {
    if (err) return console.log(err);

    //Keep the song in the database
    const song = await Song.create({
      external_id: results[0].id,
      link: results[0].link,
      title: results[0].title,
      artist: results[0].channelTitle,
      duration: new Date(0, 0, 0, 0, 2, 20), //Default the api dont give this data
      year: new Date(results[0].publishedAt).getFullYear(),
      date: new Date(results[0].publishedAt),
      genre: 'Salsa, Kuduro, Romance', //Default the api dont give this data
      description: results[0].description,
      thumbnailHQ: results[0].thumbnails.high.url,
      thumbnailMQ: results[0].thumbnails.medium.url,
      hits: 0,
      waveform: 'dQw4w9WgXcQ.png',
      status: 'queued',
      added_by_ip: ip,
      added_by_user: userId,
      general_classification: '',
    })
      .then((song) => {
        console.log('Song saved');
      })
      .catch((e) => {
        console.log(e);
      });
  });
}

//See if the user has

//Update the state of the song
async function updateStateSong(status, songId) {
  await Song.update(
    {
      status: status,
    },
    {
      where: { external_id: songId },
    },
  );
}

//Update the classifitication of the song
async function updateProcessed(emotion, songId) {
  await Song.update(
    {
      status: 'processed',
      general_classification: emotion,
    },
    {
      where: { external_id: songId },
    },
  );
}
///////////////////////////////////////////////////7777777////
//////////////////////////////////////////////////////////////

//Here is the list of classification of the songs
const classificationQueue = async.queue(async (song, callback) => {
  //To which id send the updates
  const songSocket = request.connectedSong[song];
  try {
    updateStateSong('processing', song);
    //////////////////////////////////////////////////////////////////////////
    //Here we want to send the song we want to classify to the dummy service//
    //////////////////////////////////////////////////////////////////////////
    //Simulating the classification of the songs (temporary)
    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 10,
          song_id: `${song}`,
          state: 'Song Received',
        });

        //await saveLog("Song Received", song)
      }
    }, 6000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 30,
          song_id: `${song}`,
          state: 'Video Dowloaded',
        });
        const songDetails = await Song.findOne({ where: { external_id: song } });
        await sendMessage(
          'videoDownloadQueue',
          `Video downloaded for song ID: ${song}, Title: ${songDetails.title}`,
        );
      }
    }, 8000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 50,
          song_id: `${song}`,
          state: 'Audio Channel exctracted from audio',
        });
        //await saveLog("Audio Channel exctracted from audio", song)
      }
    }, 10000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 60,
          song_id: `${song}`,
          state: 'Features Extracted',
        });
        //await saveLog("Features Extracted", song)
      }
    }, 12000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 80,
          song_id: `${song}`,
          state: 'Classification in process',
        });
        //await saveLog("Classification in process", song)
      }
    }, 15000);

    setTimeout(async () => {
      if (songSocket) {
        request.io.emit('progress', {
          progress: 100,
          song_id: `${song}`,
          state: 'Classification finished',
        });
      }
      const emotions = ['Happy', 'Sad', 'Calm', 'Tense'];
      var rnd = Math.floor(Math.random() * emotions.length);
      const emotion = emotions[rnd];
      await updateProcessed(emotion, song);

      // Emit event when classification is finished
      request.io.emit('song-classified', {
        songId: song,
        message: 'The song classification is finished',
      });
    }, 16000);
  } catch (error) {
    updateStateSong('error', song);
    console.error('Error');
    callback(error);
  }
}, 1); //This one means that we only accept one song at time and the others have to wait to be added to the classification queue

function startClassification(song) {
  saveTheSong(song);
  //Push the song to the queue
  classificationQueue.push(song, (error) => {
    console.log('hey i passed');
    if (error) {
      console.error(error);
    } else {
      console.log('The song was classified');
    }
  });
}

//see if the song is already on the database
async function isAlreadyOnTheDatabase(song_id) {
  const song = await Song.findOne({
    where: {
      external_id: song_id,
    },
  });
  return song;
}

//see if the user based on his id has how many songs in the database
async function howManySongsBasedOnUserId(id) {
  const song = await Song.findAll({
    where: {
      added_by_user: id,
      status: {
        [Op.ne]: 'processed',
      },
    },
  });

  return song.length;
}

async function howManySongsBasedOnUserIp() {
  const song = await Song.findAll({
    where: {
      added_by_ip: ip,
      status: {
        [Op.ne]: 'processed',
      },
    },
  });

  return song.length;
}
module.exports = {
  //Get the Song classifications given the song_id
  async index(req, res) {
    try {
      const { id } = req.headers;
      console.log(id);
      const classifications = await Song_Classification.findAll({
        where: {
          song_id: id,
        },
      });
      return formatter.success(res, classifications);
    } catch (e) {
      console.log(e);
      return formatter.error(res, 'Error fetching song classifications', 500);
    }
  },

  async classify(req, res) {
    try {
      //Here we receive the external link of the song we want to classify (external id : means the id of the video on youtube)
      const { external_id, user_id } = req.params;
      ip = req.clientIp;
      request = req;
      userId = user_id;
      //Before doing any classification we have to see if the song is already on the database
      if ((await isAlreadyOnTheDatabase(external_id)) != null) {
        return formatter.error(res, 'This song is already in the queue for classification.', 400);
      }
      //Calculate the song limits the user has to have in the queue based on if they are logged in or not
      if (user_id != 'null') {
        ip = '';
        var lim = await howManySongsBasedOnUserId(user_id);
        if (lim >= 6) {
          return formatter.error(
            res,
            'You have already reached the limit for song classification',
            400,
          );
        }
      } else {
        var lim = await howManySongsBasedOnUserIp();
        console.log(lim);
        if (lim >= 3) {
          return formatter.error(
            res,
            'You have already reached the limit for song classification',
            400,
          );
        }
      }

      //We have to see if the classification is made by a logged user or not
      //If not we have to know the user IP

      startClassification(external_id);

      //Simulating the classification and creating random logs to send to the frontend
      return formatter.success(res, 'The song was added to the queue');
    } catch (error) {
      console.log(error);
      return formatter.error(res, 'Error classifying the song', 500);
    }
  },
};
