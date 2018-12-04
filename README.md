# edm-relay

Translates REST playloads into kafka messages. 

Created with Blizzard's node.js kafka producer: [node-rdkafka](https://github.com/Blizzard/node-rdkafka).

This app is part of a group of apps that all must be deployed in a particular order:

1. [edm-relay](https://github.com/trevorscott/edm-relay)
1. [edm-stream](https://github.com/trevorscott/edm-stream)
1. [edm-stats](https://github.com/trevorscott/edm-stats)
1. [edm-ui](https://github.com/trevorscott/edm-ui)
1. [edm-dashboard](https://github.com/trevorscott/edm-dashboard)

![Event Driven Microservices with Apache Kafka on Heroku Demo Architecture](https://s3.amazonaws.com/octo-public/kafka-microservices-v2.png "EDM")

# Requirements

* Heroku Account
* Apache Kafka on Heroku add-on
* Herkou Kafka CLI plug-in

# Deploy

## Terraform Deploy

To deploy this entire demo with a single command see [edm-terraform](https://github.com/trevorscott/edm-terraform).

## Initial Setup

```
git clone git@github.com:trevorscott/edm-relay.git && cd edm-relay
heroku create $appName
```

## Heroku Kafka CLI Plug-in

In order to interact with your Apache Kafka on Heroku cluster you will need the Heroku kafka CLI plug-in:

```
heroku plugins:install heroku-kafka
```

## Kafka Setup

The following steps will walk you through creating:
1. A multi-tenant (basic-0) Heroku Kafka Cluster 
1. 2 production kafka topics
1. 2 topics for local development
1. 2 production consumer groups
1. 2 local development consumer groups

First create a multi-tenant (basic-0) Kafka Cluster:

```bash
heroku addons:create heroku-kafka:basic-0 
```

We will be tracking button clicks and page load events with `edm-ui` so we will create topic names that reflect that. Below are the default topic names for this demo, it is suggested that you do not change them. If you do change them, there will be extra config that you will need to set for `edm-stats` and `edm-ui`. We need to create both production and local dev topics:

```bash
export topic1='edm-ui-click'
export topic1Dev='edm-ui-click-local'
export topic2='edm-ui-pageload'
export topic2Dev='edm-ui-pageload-local'
```

```bash
heroku kafka:topics:create $topic1
heroku kafka:topics:create $topic1Dev
heroku kafka:topics:create $topic2
heroku kafka:topics:create $topic2Dev
```

Similarly we will have a total of 4 consumer groups:

```bash
export cg1='edm-consumer-group-1'
export cg1Dev='edm-consumer-group-1-local'
export cg2='edm-consumer-group-2'
export cg2Dev='edm-consumer-group-2-local'
```

```bash
heroku kafka:consumer-groups:create $cg1
heroku kafka:consumer-groups:create $cg1Dev
heroku kafka:consumer-groups:create $cg2
heroku kafka:consumer-groups:create $cg2Dev
```

## Deploy to Heroku

```
git push heroku master
```

## Scale Up

Scale up your service to avoid sleeping dynos.

```
heroku ps:scale web=1:standard-1x
```

# local dev

Since we are using production kafka, you will need to follow the Kafka Setup instructions above first.

## Installing `lib-rdkafka` on Mac OS

Before you can `npm-install` you must set the following enviornment variables:

```bash
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

See https://github.com/Blizzard/node-rdkafka#mac-os-high-sierra for more details.

## Required config

Once you create your kafka cluster set all of the required config vars on your local machine. Run `heroku config` to see all relevant info.

```bash
export KAFKA_URL=<your broker urls> 
export KAFKA_PREFIX=<your-kafka-prefix>
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

Save this info in a safe place because you will need to set these variables for both `edm-stats` and `edm-stream`.

## Write SSL Config to File

Now that you have set the KAFKA ssl enviornment variables they will need to be written to file. A helper script is provided:

```
./.profile
```

## Run your app

Start the server from root:

```
npm install
npm start
```
