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

function processSong(msg) {
console.log("Received request to process song_id: %s", msg);

let message = { song_id: msg,
    service: 'video_extractor',
    message: "Video downloaded to ${msg}.wav",
    output: "${msg}.wav",
    status: "processing"};

simulateProcessingStep("Video downloaded");




}

function processMessage(data) {
    // Perform different actions based on the value of the "service" field
    const service = data['service']
    switch (service) {
      case 'web-api':
        console.log('Processing message for service A:', data);
        // Your logic for service A here
        break;
      case 'service_b':
        console.log('Processing message for service B:', data);
        // Your logic for service B here
        break;
      // Add more cases for other services if needed
      default:
        console.log(' [*] Unknown service:', service);
        break;
    }
  }

/**
 * Inicializa a comunicacao com o server rabbitMQ
 */
startScript = async () => {
    console.log("Connecting to RabbitMQ.");
    amqp.connect(connectionUrl, function (err, conn) {
        conn.createChannel(function (err, ch) {
            console.log("Connected");
            var q = 'mer-management';
            ch.assertQueue(q, { durable: false });

            // simulating all other queues and workers
            ch.assertQueue("video-downloader", { durable: false });
            ch.assertQueue("audio-extractor", { durable: false });
            ch.assertQueue("lyrics-extractor", { durable: false });
            ch.assertQueue("audio-feature-extractor", { durable: false });
            ch.assertQueue("lyrics-feature-extractor", { durable: false });

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
            ch.consume(q, async function (msg) {
                // Simulate processing steps, the goal here as to call an api to report logs and pass info
                const message = msg.content.toString();
                
                try {
                    // Try to parse the received message as JSON
                    const parsedMessage = JSON.parse(message);
                    console.log('Received valid JSON message:', parsedMessage);
            
                    // Process the message here
                    await processMessage(parsedMessage);

                    // Acknowledge the message (mark it as processed)
                    channel.ack(msg);
                  } catch (error) {
                    console.error('Received invalid JSON message:', message);
                    
                    // Handle the invalid JSON message here
                    // For example, you might want to log the error, discard the message, or move it to a dead-letter queue.
                    // Note: Not acknowledging the message (channel.nack(msg)) will keep it in the queue for further processing.
                    channel.ack(msg); // Or you can nack the message using channel.nack(msg) if you want to discard it.
                  }

            }, {}); //, { noAck: true });
        });
    });
}

/**
 * Executa o método startScript
 */
startScript();

