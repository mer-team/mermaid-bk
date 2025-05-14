var amqp = require('amqplib/callback_api');

// Read RabbitMQ credentials from environment variables
const rabbitmqHost = process.env.MQ_HOST;
const rabbitmqPort = process.env.MQ_PORT;
const rabbitmqUsername = process.env.MQ_USER;
const rabbitmqPassword = process.env.MQ_PASS;

// Construct RabbitMQ connection URL
const connectionUrl = `amqp://${rabbitmqUsername}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}`;

function simulateProcessingStep(message) {
  return new Promise((resolve) => {
    const delay = Math.floor(Math.random() * 10000); // Random delay between 0 and 5 seconds
    setTimeout(() => {
      console.log(message);
      resolve();
    }, delay);
  });
}

/**
 * Inicializa a comunicacao com o server rabbitMQ
 */
startScript = async () => {
  console.log('Connecting to RabbitMQ.');
  amqp.connect(connectionUrl, function (err, conn) {
    conn.createChannel(function (err, ch) {
      console.log('Connected');
      var q = 'mer-management';
      ch.assertQueue(q, { durable: false });
      ch.assertQueue('video-downloader', { durable: false });
      ch.assertQueue('audio-extractor', { durable: false });
      ch.assertQueue('lyrics-extractor', { durable: false });
      ch.assertQueue('audio-feature-extractor', { durable: false });
      ch.assertQueue('lyrics-feature-extractor', { durable: false });

      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q);
      ch.consume(
        q,
        async function (msg) {
          // Simulate processing steps, the goal here as to call an api to report logs and pass info
          await processSong(msg);
        },
        { noAck: true },
      );
    });
  });
};

/**
 * Executa o método startScript
 */
startScript();
