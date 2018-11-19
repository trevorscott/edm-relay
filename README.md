# edm-relay

Translates REST playloads into kafka messages. 

Created with Blizzard's node.js kafka producer: [node-rdkafka](https://github.com/Blizzard/node-rdkafka).

This app is part of a group of apps that all must be deployed in a particular order:

1. [edm-relay](https://github.com/trevorscott/edm-relay)
1. [edm-stream](https://github.com/trevorscott/edm-stream)
1. [edm-stats](https://github.com/trevorscott/edm-stats)
1. [edm-ui](https://github.com/trevorscott/edm-ui)
1. [edm-dashboard](https://github.com/trevorscott/edm-dashboard)

# Requirements

* Heroku Account
* Apache Kafka on Heroku add-on
* Herkou Kafka CLI plug-in


# Deploy

## Initial Setup

```
git clone git@github.com:trevorscott/edm-relay.git && cd edm-relay
heroku create $appname
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

We will be tracking button clicks and page load events with `edm-ui` so we want to create topic names that reflect that. We need to create both production and local dev topics:

```
export topic1='edm-button-click'
export topic1Dev='edm-button-click-dev'
export topic2='edm-page-load'
export topic2Dev='edm-page-load-dev'
```

```
heroku kafka:topics:create $topic1
heroku kafka:topics:create $topic1Dev
heroku kafka:topics:create $topic2
heroku kafka:topics:create $topic2Dev
```

Similarly we will have a total of 4 consumer groups:

```
export cg1='cg-edm-stream'
export cg1Dev='cg-edm-stream-dev'
export cg2='cg-edm-stats'
export cg2Dev='cg-edm-stats-dev'
```

```
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

```
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

See https://github.com/Blizzard/node-rdkafka#mac-os-high-sierra for more details.

## Set Up
```
  git clone git@github.com:trevorscott/edm-relay.git && cd edm-relay 
  npm install
```

## Required config

Once you create your kafka cluster set all of the required config vars on your local machine. Run `heroku config` to see all relevant info.

```
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
chmod +x .profile
./.profile
```

## Run your app

Start the server from root:

```
npm start
```
