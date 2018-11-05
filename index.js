require('dotenv').config();
const fs         = require('fs');
const URL        = require('url');
const path       = require('path');
const bodyParser = require('body-parser');
const Kafka      = require('node-rdkafka');
const express    = require('express');
const app        = express();
const server     = require('http').createServer(app);

const PORT       = process.env.PORT || 5000;
const nodeEnv    = process.env.NODE_ENV || 'development';

const currentPath  = process.cwd();

// Kafka Config
const kafkaBrokerUrls = process.env.KAFKA_URL;
const kafkaTopics = `${process.env.KAFKA_PREFIX}${process.env.KAFKA_TOPIC}`;
let brokerHostnames = kafkaBrokerUrls.split(",").map((u)=>{
  return URL.parse(u).host;
});

//
// Kafka Producer
//

var producer = new Kafka.Producer({
  'group.id': `${process.env.KAFKA_PREFIX}dfe-dashboard`,
  'metadata.broker.list': brokerHostnames.toString(),
  'security.protocol': 'SSL',
  'ssl.ca.location':          "tmp/env/KAFKA_TRUSTED_CERT",
  'ssl.certificate.location': "tmp/env/KAFKA_CLIENT_CERT",
  'ssl.key.location':         "tmp/env/KAFKA_CLIENT_CERT_KEY",
  'enable.auto.commit': true
}, {});


// Connect to the broker manually
producer.connect();

// Wait for the ready event before proceeding
producer.on('ready', function() {
  console.log(`Kafka producer ready to produce to ${process.env.KAFKA_PREFIX}${process.env.KAFKA_TOPIC}`)
});

// Any errors we encounter, including connection errors
producer.on('event.error', function(err) {
  console.error('Error from producer');
  console.error(err);
})


//
// Server
//

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));
app.use(bodyParser.json());

app.use(function(req,res,next){
  if(req.header.origin) res.setHeader('Access-Control-Allow-Origin', req.header.origin);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
})

app.post('/produceMessage', function (req, res) {
  console.log(req.body);
  try {
    producer.produce(
      // Topic to send the message to
      kafkaTopics,
      // optionally we can manually specify a partition for the message
      // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
      null,
      // Message to send. Must be a buffer
      Buffer.from(JSON.stringify(req.body)),
      // for keyed messages, we also specify the key - note that this field is optional
      'test-key',
      // you can send a timestamp here. If your broker version supports it,
      // it will get added. Otherwise, we default to 0
      Date.now(),
      // you can send an opaque token here, which gets passed along
      // to your delivery reports
    );
  } catch (err) {
    console.error('A problem occurred when sending our message');
    console.error(err);
  }
  res.send("{\"message\":\"Success!\"}")
});

server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});


