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

      channel.assertQueue(queue, { durable: false });
      console.log(`Waiting for messages in queue: ${queue}`);

      channel.consume(queue, function (msg) {
        if (msg !== null) {
          const message = msg.content.toString();
          console.log(`Received message: ${message}`);

          // Parse the message
          const parsedMessage = JSON.parse(message);

          // Route the message to the correct API endpoint
          handleMessage(parsedMessage);

          channel.ack(msg);
        }
      });
    });
  });
}

async function handleMessage(message) {
  try {
    if (message.type === 'song_processing_complete') {
      await axios.post(`${API_BASE_URL}/processing/completed`, message.data);
    } else if (message.type === 'processing_log') {
      await axios.post(`${API_BASE_URL}/processing/log`, message.data);
    } else if (message.type === 'song_segments') {
      await axios.post(`${API_BASE_URL}/processing/segments`, message.data);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
}

module.exports = { startConsumer }; // Export startConsumer
