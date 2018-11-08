# edm-relay

Translates REST playloads into kafka messages. 

Created with Blizzard's node.js kafka producer: [node-rdkafka](https://github.com/Blizzard/node-rdkafka).

This app is part of a group of apps that all must be deployed in a particular order:

1. [edm-relay](https://github.com/trevorscott/edm-relay)
1. [edm-ui](https://github.com/trevorscott/edm-ui)
1. [edm-stream](https://github.com/trevorscott/edm-stream)
1. [edm-dashboard](https://github.com/trevorscott/edm-dashboard)

# Requirements

* Heroku Account


# Deploy

## Initial Setup

```
git clone git@github.com:trevorscott/edm-relay.git && cd edm-relay
heroku create $appname
```

## Kafka Setup

Here are guidlines for setting up a multi-tenant kafka cluster, a test topic and a consumer group. Replace $kafka_topic1 with a string value of your choice or set it explicitly: `export kafka_topic1=<your topic name>`.

```bash
heroku plugins:install heroku-kafka
heroku addons:create heroku-kafka:basic-0 
heroku kafka:topics:create $kafka_topic1
heroku kafka:consumer-groups:create <consumer group name>
heroku config:set KAFKA_TOPIC=$kafka_topic1
```

```
git push heroku master
```

## Scale Up

Scale up your service to avoid sleeping dynos.

```
heroku ps:scale web=1:standard-1x
```

# local dev

## Mac OS High Sierra

OpenSSL has been upgraded in High Sierra and homebrew does not overwrite default system libraries. That means when building node-rdkafka, because you are using openssl, you need to tell the linker where to find it:

```
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

Then you can run npm install on your application to get it to build correctly.

See https://github.com/Blizzard/node-rdkafka#mac-os-high-sierra for more details.

## Set Up
```
  git clone 
  npm install
```

## Required config

Once you create your kafka cluster set all of the required config vars on your local machine:


```
export KAFKA_URL=<your broker urls> \
export KAFKA_TOPIC=<name of kafka topic>
export KAFKA_TRUSTED_CERT="multi
line 
cert"
export KAFKA_CLIENT_CERT="multi
line
cert"
export KAFKA_CLIENT_CERT_KEY="multi
line
cert
"
```

These files must contain values generated from your [kafka addon SSL config vars](https://devcenter.heroku.com/articles/kafka-on-heroku#connecting-to-a-kafka-cluster).

## Run your app

Start the server from root:

```
npm start
```
