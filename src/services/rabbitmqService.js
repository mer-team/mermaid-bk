const amqp = require('amqplib/callback_api');

const winston = require('../utils/logger'); // Custom logger
require('dotenv').config();

const { MQ_HOST, MQ_PORT, MQ_USER, MQ_PASS } = process.env;

function sendMessage(queue, msg) {
  amqp.connect(
    `amqp://${MQ_USER}:${MQ_PASS}@${MQ_HOST}:${MQ_PORT}`,
    function (error0, connection) {
      if (error0) {
        winston.error(`Failed to connect to RabbitMQ: ${error0.message}`);
        return;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          console.error('Failed to create a channel:', error1);
          return;
        }
        channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(msg));
        winston.info(
          `Message sent to RabbitMQ: queue=${queue}, message=${msg}`
        );
      });

      setTimeout(function () {
        connection.close();
        winston.debug('RabbitMQ connection closed');
      }, 500);
    }
  );
}

module.exports = { sendMessage };
