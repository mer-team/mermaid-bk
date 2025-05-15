var amqp = require('amqplib/callback_api');
const { Log, Song } = require('../../../src/models/index');
const { server } = require('../src/index');
const socketIO = require('socket.io');
var search = require('youtube-search');
require('dotenv').config();
const io = socketIO(server);
// Read RabbitMQ credentials from environment variables
const rabbitmqHost = process.env.MQ_HOST;
const rabbitmqPort = process.env.MQ_PORT;
const rabbitmqUsername = process.env.MQ_USER;
const rabbitmqPassword = process.env.MQ_PASS;
var songId = 0; //Id of the song
var msg = ''; //Message sent to the rabbitMQ
// Construct RabbitMQ connection URL
const connectionUrl = `amqp://${rabbitmqUsername}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}`;

async function saveLog(msg) {
  await Log.create({
    message: msg,
    service: 'song classification',
    song_id: songId,
    type: 'info',
  })
    .then((_log) => {
      // Changed 'log' to '_log' to match unused variable pattern
      console.log('Log created');
    })
    .catch((e) => {
      console.log(e);
    });
}

async function saveSong(id, ip, classification) {
  var opts = {
    key: 'AIzaSyC-Du9-yLtOM0ZgbNPfuTsKvQviFqaGsV0',
  };

  search(
    `https://www.youtube.com/watch?v=${id}`,
    opts,
    async function (err, results) {
      if (err) return console.log(err);

      //Keep the song in the database
      await Song.create({
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
        status: 'processed',
        added_by_ip: ip,
        general_classification: classification,
      })
        .then((_song) => {
          songId = _song.id;
          console.log(`https://www.youtube.com/watch?v=${id}`);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  );
}

async function classifySong(_message) {
  const delay = Math.floor(Math.random() * 10000); // Random delay between 0 and 5 seconds
  var log = '';
  // var result = ''; // Commented out as it's unused
  const emotions = ['Happy', 'Sad', 'Calm', 'Tense'];
  var rnd = Math.floor(Math.random() * emotions.length);
  // Safe array access with bounds check
  const emotion = rnd >= 0 && rnd < emotions.length ? emotions[rnd] : 'Unknown';
  //Salvar a musica na base de dados
  try {
    await saveSong(msg, '0.0.0.0', emotion);
  } catch (error) {
    console.log(error);
  }

  //Receive the song
  setTimeout(async () => {
    log = `Song Received`;
    //Receber a musica e guardar na base de dados
    await saveLog(log);
    console.log(log);
    //Enviar os logs
    io.emit('logs', log);
  }, delay);

  //VIdeo Dowloaded
  setTimeout(async () => {
    log = 'Video Dowloaded';
    await saveLog(log);
    console.log(log);
    //Enviar os logs
    io.emit('logs', log);
  }, delay);

  //Audio Channel exctracted from audio
  setTimeout(async () => {
    log = 'Audio Channel exctracted from audio';
    await saveLog(log);
    console.log(log);
    //Enviar os logs
    io.emit('logs', log);
  }, delay);

  //Features Extracted
  setTimeout(async () => {
    log = 'Features Extracted';
    await saveLog(log);
    console.log(log);
    //Enviar os logs
    io.emit('logs', log);
  }, delay);

  //Classification in process
  setTimeout(async () => {
    log = 'Classification in process';
    await saveLog(log);
    console.log(log);
    //Enviar os logs
    io.emit('logs', log);
  }, delay);

  //Classification finished for msg. Result = x"
  setTimeout(async () => {
    log = `Classification finished for ${msg}. Result = ${emotion}`;
    await saveLog(log);
    console.log(log);
    //Enviar os logs
    io.emit('logs', log);
  }, delay);
}

// Function to send a message to the queue
function sendMessage(message) {
  amqp.connect(connectionUrl, function (err, conn) {
    conn.createChannel(function (err, ch) {
      const q = 'mer-management';

      ch.assertQueue(q, { durable: false });

      ch.sendToQueue(q, Buffer.from(message));

      console.log('Message sent:', message);
      msg = message;
      setTimeout(function () {
        conn.close();
      }, 500);
    });
  });
}

/**
 * Inicializa a comunicacao com o server rabbitMQ
 */
const startScript = async () => {
  console.log('Connecting to RabbitMQ.');
  amqp.connect(connectionUrl, function (err, conn) {
    conn.createChannel(function (err, ch) {
      console.log('Connected');
      var q = 'mer-management';
      ch.assertQueue(q, { durable: false });
      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q);
      ch.consume(
        q,
        async function (msg) {
          await classifySong(msg);
        },
        { noAck: true }
      );
    });
  });
};

module.exports = { startScript, sendMessage };
