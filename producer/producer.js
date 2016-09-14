'use strict';

var config = require('config');

var express = require('express');
var bodyParser = require('body-parser');

var kafka = require('kafka-node');
var encode = require('hashcode').hashCode;

var Producer = kafka.Producer;
var client = new kafka.Client('zookeeper');
var producer = new Producer(client);
var notificationsTopic = config.get("Notifications.topic");

var app = express();
app.use(bodyParser.json());

//initialize connection to zookeeper/kafka and http server
producer.on('ready', function () {
    var server = app.listen(process.env.PORT || 8080, function () {
        var port = server.address().port;
        console.log("action=kafka_producer_start status=READY port=" + port)
    });

});

producer.on('error', function (err) {
    console.log("action=kafka_producer_start status=ERROR err=" + err)
    process.exit(1);
})

process.on('SIGINT', function () {
    client.close(function () {
        process.exit();
    });
});

//API to create notification
app.post("/notifications", function(req, res) {
    var notification = req.body;
    notification.timestamp = new Date();

    if (!(req.body.event_type && req.body.data.id)) {
        handleError(res, "validate_notification", "Event type or id of associated entity is missing", 400);
    }
    //tried keypartitioner, but it doesn't seem to work in kafka-node (see https://github.com/SOHU-Co/kafka-node/issues/354)
    var payloads = [
        { topic: config.get("Notifications.topic"), messages: JSON.stringify(notification),
            partition: partitionNumber(notification.data.id) } ];

    producer.send(payloads, function (err, data) {
        if (err) {
            handleError(res, "notification_sent", err)
        } else {
            console.log('action=notification_sent status=OK response=' + JSON.stringify(data));
            res.status(201).json(notification);
        }
    });
});

/**
 * Error handler for API calls
 *
 * @param res response object
 * @param action - action to log
 * @param message - message to return in response and log
 * @param code - http response code
 */
function handleError(res, action, message, code) {
    console.log("action=" + action + " status=ERROR msg=" + message);
    res.status(code || 500).json({"error": message});
}

/**
 * Returns partition number to send the message with entity_id to - messages with same entity_id land in the same
 * partition to maintain order
 *
 * @param entity_id id of the entity changed in notification
 * @returns partition number in kafka
 */
function partitionNumber(entity_id){
    var numberOfPartitions = config.get('Notifications.partitions');
    var hashcode = encode().value(entity_id);
    return Math.abs(hashcode % numberOfPartitions); //basically the same as kafka keyed partitioner
}
