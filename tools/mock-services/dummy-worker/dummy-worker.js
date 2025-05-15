var amqp = require('amqplib/callback_api');

// Read RabbitMQ credentials from environment variables
const rabbitmqHost = process.env.MQ_HOST;
const rabbitmqPort = process.env.MQ_PORT;
const rabbitmqUsername = process.env.MQ_USER;
const rabbitmqPassword = process.env.MQ_PASS;

// Construct RabbitMQ connection URL
const connectionUrl = `amqp://${rabbitmqUsername}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}`;

// This function is commented out since it's not used
// function simulateProcessingStep(message) {
//   return new Promise((resolve) => {
//     const delay = Math.floor(Math.random() * 10000);
//     setTimeout(() => {
//       console.log(message);
//       resolve();
//     }, delay);
//   });
// }

/**
 * Process a song message from the queue
 */
const processSong = async (msg) => {
  console.log('Processing song:', msg.content.toString());
  // Implementation details
};

/**
 * Inicializa a comunicacao com o server rabbitMQ
 */
const startScript = async () => {
  console.log('Connecting to RabbitMQ.');
  amqp.connect(connectionUrl, function (err, conn) {
    conn.createChannel(function (err, channel) {
      console.log('Connected');
      var q = 'mer-management';
      channel.assertQueue(q, { durable: false });
      channel.assertQueue('video-downloader', { durable: false });
      channel.assertQueue('audio-extractor', { durable: false });
      channel.assertQueue('lyrics-extractor', { durable: false });
      channel.assertQueue('audio-feature-extractor', { durable: false });
      channel.assertQueue('lyrics-feature-extractor', { durable: false });

      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q);
      channel.consume(
        q,
        async function (msg) {
          // Simulate processing steps, the goal here as to call an api to report logs and pass info
          await processSong(msg);
        },
        { noAck: true }
      );
    });
  });
};

/**
 * Executa o método startScript
 */
startScript();

// Export functions for use in other modules
module.exports = { startScript, processSong };
