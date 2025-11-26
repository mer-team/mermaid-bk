const amqp = require('amqplib/callback_api');
const axios = require('axios');

require('dotenv').config();

const { MQ_HOST, MQ_PORT, MQ_USER, MQ_PASS, API_BASE_URL } = process.env;

function startConsumer(queue) {
  amqp.connect(`amqp://${MQ_USER}:${MQ_PASS}@${MQ_HOST}:${MQ_PORT}`, function (error0, connection) {
    if (error0) {
      console.error('Failed to connect to RabbitMQ:', error0);
      return;
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        console.error('Failed to create a channel:', error1);
        return;
      }

      channel.assertQueue(queue, { durable: true });
      console.log(`Waiting for messages in queue: ${queue}`);

      channel.consume(queue, function (msg) {
        if (msg !== null) {
          const message = msg.content.toString();
          console.log(`\n[RabbitMQ Consumer] Received message on queue '${queue}':`);
          console.log(message);

          try {
            // Parse the message
            const parsedMessage = JSON.parse(message);
            console.log(`[RabbitMQ Consumer] Parsed message type: ${parsedMessage.type}`);

            // Route the message to the correct API endpoint
            handleMessage(parsedMessage, connection, queue);

            channel.ack(msg);
            console.log(`[RabbitMQ Consumer] Message acknowledged on queue '${queue}'`);
          } catch (error) {
            console.error(
              `[RabbitMQ Consumer] Error processing message on queue '${queue}':`,
              error,
            );
            channel.nack(msg, false, false); // Don't requeue failed messages
          }
        }
      });
    });
  });
}

async function handleMessage(message, connection, queue) {
  try {
    console.log(
      `[RabbitMQ Handler] Processing message type: '${message.type}' from queue: '${queue}'`,
    );

    switch (message.type) {
      case 'song_processing_complete':
        // Final result from pipeline manager
        console.log(
          '[RabbitMQ Handler] Completion message data:',
          JSON.stringify(message.data, null, 2),
        );
        console.log(`[RabbitMQ Handler] Posting to: ${API_BASE_URL}/processing/completed`);
        const response = await axios.post(`${API_BASE_URL}/processing/completed`, message.data);
        console.log('[RabbitMQ Handler] API Response:', response.status, response.data);
        break;

      case 'song_processing_log':
        // Progress logs from microservices
        await axios.post(`${API_BASE_URL}/processing/log`, message.data);
        break;

      case 'song_segments':
        // Segment data from emotion classification
        await axios.post(`${API_BASE_URL}/processing/segments`, message.data);
        break;

      case 'pipeline_stage_update':
        // Stage updates from pipeline manager (download, segmentation, separation, transcription)
        console.log(
          '[RabbitMQ Handler] Stage update received:',
          JSON.stringify(message.data, null, 2),
        );
        await axios.post(`${API_BASE_URL}/processing/stage-update`, message.data);
        console.log('[RabbitMQ Handler] Stage update forwarded to API');
        break;

      case 'pipeline_error':
        // Error notifications from pipeline
        await axios.post(`${API_BASE_URL}/processing/error`, message.data);
        break;

      default:
        console.warn(`[RabbitMQ Handler] Unhandled message type: '${message.type}'`);
    }
  } catch (error) {
    console.error(
      `[RabbitMQ Handler] ERROR handling message of type '${message.type}':`,
      error.message,
    );
    if (error.response) {
      console.error(
        '[RabbitMQ Handler] API Error Response:',
        error.response.status,
        error.response.data,
      );
    }
    console.error('[RabbitMQ Handler] Full error:', error);
  }
}

module.exports = { startConsumer }; // Export startConsumer
