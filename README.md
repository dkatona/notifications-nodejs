# notifications-nodejs

This is a showcase of a sample notification system built on Kafka. It has 3 parts:
* broker - Apache Kafka and Zookeeper
* producer - node.js app which sends events to Kafka
* consumer - node.js app which consumes events from topic in Kafka and 
optionally send them to Slack channel (or just logs them)

##How to run it

The whole sample can be run in docker (tested on docker 1.12 on Mac) with docker-compose:
* **docker-compose.yml** - runs Kafka with Zookeeper and creates notifications topic
* **docker-compose-producer-consumers.yml** - runs one producer on port 8080 and 2 consumers

If you need to run another consumer/producer, there are bash scripts to do so:
* **run_single_producer.sh PORT** - runs producer in docker on a given port
* **run_single_consumer.sh** - runs consumer in docker

So the whole example can be run with these 2 commands:
```
docker-compose up -d
docker-compose -f docker-compose-producer-consumers.yml up -d
```

###Configuration

Configuration is done with [config module](https://www.npmjs.com/package/config), you can find
configurations in `config` folder. There is one optional configuration, which is 
uri for slack under the Notifications tree:
* **slack_uri** - URI to slack webhook, can be generated [here](https://snapshot-offtopic.slack.com/apps/new/A0F7XDUAZ-incoming-webhooks)

###Sample notification

Each producer exposes notifications API endpoint where you can POST new
notification (in a real world, it would be the app generating the notification/event, but
we need an external way how to invoke it). 

You can run a helper script with two arguments - id and name as follows to post a new notification for processing:
```
./sample_notification.sh 1234 "My new API document"
```

###What happens in the background
If you post a new notification for processing, the producer enriches it with the timestamp and sends it to the appropriate
partition of the topic in Kafka. Changes to the same entity (e.g. API document updated, deleted) are sent to the same partition
so that notifications are delivered in order (you wouldn't like to get delete notification first and then update for the same entity).

Consumers are listening to several partitions and every consumer has only one subset of partitions assigned, when new message is consumed,
the consumer either post it to slack (if configured) or simply logs it - you can view the notification in ``docker logs <container_id>`` of
a consumer or on the slack channel :)
