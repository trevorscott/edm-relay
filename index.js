require('dotenv').config();
const path       = require('path');
const cluster    = require('cluster');
const numCPUs    = require('os').cpus().length;
const fs         = require('fs');
const URL        = require('url');
const bodyParser = require('body-parser');
const Kafka      = require('node-rdkafka');
const express    = require('express');


const PORT       = process.env.PORT || 5000;
const nodeEnv    = process.env.NODE_ENV || 'development';

const currentPath  = process.cwd();

const connectTimeout = 5000;

if (!process.env.KAFKA_PREFIX)          throw new Error('KAFKA_PREFIX is not set.')
if (!process.env.KAFKA_URL)             throw new Error('KAFKA_URL is not set.')
if (!process.env.KAFKA_TRUSTED_CERT)    throw new Error('KAFKA_TRUSTED_CERT is not set.')
if (!process.env.KAFKA_CLIENT_CERT)     throw new Error('KAFKA_CLIENT_CERT is not set.')
if (!process.env.KAFKA_CLIENT_CERT_KEY) throw new Error('KAFKA_CLIENT_CERT_KEY is not set.')

// Multi-process to utilize all CPU cores.
if (cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs-1; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const connectTimoutId = setTimeout(() => {
      const message = `Failed to connect Kafka producer (${connectTimeout}-ms timeout)`;
      const e = new Error(message);
      throw e;
    }, connectTimeout)

  // Kafka Config
  const kafkaBrokerUrls = process.env.KAFKA_URL;
  let brokerHostnames = kafkaBrokerUrls.split(",").map((u)=>{
    return URL.parse(u).host;
  });

  //
  // Kafka Producer
  //
  // SSL certs written to file from config vars. See .profile script for more info
  //
  var producer = new Kafka.Producer({
    'client.id': `edm-relay/${process.env.DYNO || 'localhost'}`,
    'metadata.broker.list': brokerHostnames.toString(),
    'security.protocol': 'SSL',
    'ssl.ca.location':          "tmp/env/KAFKA_TRUSTED_CERT",
    'ssl.certificate.location': "tmp/env/KAFKA_CLIENT_CERT",
    'ssl.key.location':         "tmp/env/KAFKA_CLIENT_CERT_KEY",
    'enable.auto.commit': true
  }, {});


  // Connect to the broker manually
  producer.connect({}, (err, data) => {
    if(err) {
      console.error(`producer connection callback err: ${err}`);
    }
  });

  // Wait for the ready event before proceeding
  producer.on('ready', function() {
    console.log(`Kafka producer ready`)
    clearTimeout(connectTimoutId);
  });

  // Any errors we encounter, including connection errors
  producer.on('event.error', function(err) {
    console.error('Kafka Producer event error:');
    console.error(err);
  })


  //
  // Server
  //

  const app = express();

  app.use(bodyParser.json());

  app.use(function(req,res,next){
    if(req.header.origin) res.setHeader('Access-Control-Allow-Origin', req.header.origin);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
  })

  app.post('/produceClickMessage', function (req, res) {
    console.log(req.body);
    try {
      const topic = `${process.env.KAFKA_PREFIX}${req.body.topic}`;
      console.log(`topic: ${topic}`);
      producer.produce(
        topic,
        // optionally we can manually specify a partition for the message
        // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
        null,
        // Message to send. Must be a buffer
        Buffer.from(JSON.stringify(req.body)),
        // for keyed messages, we also specify the key - note that this field is optional
        null,
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
    res.status(200).send("{\"message\":\"Success!\"}")
  });

  app.post('/producePageLoad', function (req, res) {
    console.log(req.body);
    try {
      const topic = `${process.env.KAFKA_PREFIX}${req.body.topic}`;
      console.log(`topic: ${topic}`);
      producer.produce(
        topic,
        // optionally we can manually specify a partition for the message
        // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
        null,
        // Message to send. Must be a buffer
        Buffer.from(JSON.stringify(req.body)),
        // for keyed messages, we also specify the key - note that this field is optional
        null,
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
    res.status(200).send("{\"message\":\"Success!\"}")
  });

  app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
  });
}

