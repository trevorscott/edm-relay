# dfe-dashboard

Streams kafka messages to browser.

# Intro

This app consumes messages from a kafka broker/topic of your choice, writes those messages to postgres and streams them to a react front end with [socket.io](https://github.com/socketio/socket.io).

Created with Blizzard's node.js kafka consumer: [node-rdkafka](https://github.com/Blizzard/node-rdkafka).

# Requirements

* Heroku Account
* Heroku App with Postgres & Kafka Add-Ons

# Deploy

## Initial Setup

```
git clone https://github.com/heroku/dfe-dashboard
cd dfe-dashboard
heroku create $appname
```

## Kafka Setup

Here are guidlines for setting up a multi-tenant kafka cluster, a test topic and a consumer group. 

```bash
heroku plugins:install heroku-kafka
heroku addons:create heroku-kafka:basic-0 
heroku kafka:topics:create test-topic
heroku kafka:consumer-groups:create dfe-dashboard
```



```
git push heroku master
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
  git clone https://github.com/heroku/dfe-dashboard.git
  npm install
  cd react-ui
  npm install
```

## Event Persistence
You must create the postgres database and table for events to be saved to postgres:

```sql
psql
CREATE DATABASE "dfe-dashboard";
\c dfe-dashboard
CREATE TABLE dfe_events(
  ID              serial NOT NULL PRIMARY KEY,
  event_name      varchar(50) NOT NULL,
  event           varchar(50) NOT NULL,
  event_timestamp timestamptz NOT NULL,
  host_name       varchar(100) NOT NULL,
  app_name        varchar(50) NOT NULL,
  properties      jsonb
);
```

## Kafka Setup

```bash
heroku plugins:install heroku-kafka
heroku addons:create heroku-kafka:basic-0 
heroku kafka:topics:create test-topic
heroku kafka:consumer-groups:create dfe-dashboard
```

## Required config

Once you create your kafka cluster set all of the required config vars on your local machine:


```
export KAFKA_URL=<your broker urls> \
export KAFKA_TOPIC=<name of kafka topic>
export DATABASE_URL=<your heroku postgresql database url>
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

## Data

### Event Schema

```json
{
  "event_name": "test",
  "event": "test-event",
  "event_timestamp": "now",
  "properties": {}
}
```

## Run your app

Start the server from root:

```
npm start
```

Start the React App:

```
cd react-ui
npm start
```

It takes about a minute for the kafka consumer to start up and then all events produced to your kafka topic will be displayed on the react app in your browser.



