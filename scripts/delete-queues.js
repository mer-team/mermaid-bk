const amqp = require('amqplib/callback_api');
require('dotenv').config();

const { MQ_HOST, MQ_PORT, MQ_USER, MQ_PASS } = process.env;

const queues = [
  'song_processing_log',
  'song_processing_segments',
  'song_processing_complete',
  'pipeline_stage_update',
  'pipeline_error',
  'manager-requests',
];

amqp.connect(`amqp://${MQ_USER}:${MQ_PASS}@${MQ_HOST}:${MQ_PORT}`, function (error0, connection) {
  if (error0) {
    console.error('Failed to connect to RabbitMQ:', error0);
    process.exit(1);
  }

  connection.createChannel(function (error1, channel) {
    if (error1) {
      console.error('Failed to create a channel:', error1);
      connection.close();
      process.exit(1);
    }

    console.log('🗑️  Deleting old queues...\n');

    queues.forEach((queue) => {
      try {
        channel.deleteQueue(queue);
        console.log(`✅ Deleted queue: ${queue}`);
      } catch (error) {
        console.log(`⚠️  Could not delete ${queue} (may not exist): ${error.message}`);
      }
    });

    console.log('\n✅ All queues deleted. You can now restart the API.\n');

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  });
});
