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
        return;
      }
      channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(' [x] Sent %s', msg);
    });

    setTimeout(function () {
      connection.close();
    }, 500);
  });
}

module.exports = { sendMessage };
