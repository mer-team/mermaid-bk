const amqp = require('amqplib/callback_api');
require('dotenv').config();

const { MQ_HOST, MQ_PORT, MQ_USER, MQ_PASS } = process.env;

function sendMessage(queue, msg) {
  amqp.connect(`amqp://${MQ_USER}:${MQ_PASS}@${MQ_HOST}:${MQ_PORT}`, function (error0, connection) {
    if (error0) {
      console.error('Failed to connect to RabbitMQ:', error0);
      return;
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        console.error('Failed to create a channel:', error1);
        connection.close(); // Close the connection in case of channel creation failure
        return;
      }

      channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(' [x] Sent %s', msg);
    });
  });
}

module.exports = { sendMessage };
