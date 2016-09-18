'use strict';

var kafka = require('kafka-node');
var config = require('config');
var Slack = require('slack-node');

if (config.has("Notifications.slack_uri")) {
    var slack = new Slack();
    slack.setWebhook(config.get("Notifications.slack_uri"));
}

var HighLevelConsumer = kafka.HighLevelConsumer;
var client = new kafka.Client('zookeeper');
var highLevelConsumer = new HighLevelConsumer(
    client, [{topic: config.get("Notifications.topic")}]);

highLevelConsumer.on('message', function (message) {
    var event = JSON.parse(message.value);
    var entityId = event.data.id;

    console.log("action=message_processing status=START entityId=" + entityId)

    var subscriptions = fetchSubscriptions(entityId, event.type);
    //for every subscription, send the notification and store it in a history of notifications
    sendNotification(event, entityId);

});

highLevelConsumer.on('error', function (err) {
    console.log("action=consumer_process status=ERROR err=" + err)
});

process.on('SIGINT', function () {
    highLevelConsumer.close(true, function () {
        process.exit();
    });
});

/**
 * Filter subscriptions based on event_type and check if account associated with subscription
 * has access to entityId
 *
 * This data should be cached to process notification quickly
 * @param entityId
 * @param eventType
 */
function fetchSubscriptions(entityId, eventType) {
    //e.g. fetch it from MongoDB
}

function sendNotification(event, entityId) {
    if (config.has("Notifications.slack_uri")) {
        slack.webhook({username: "apiarybot", text: getNotificationContent(event)}, function (err, response) {
            handleSlackResponse(response, entityId);
        });
    } else {
        //log it at least
        console.log("notification - " + JSON.stringify(event));

        console.log("action=message_processing status=FINISH entityId=" + entityId)
    }
}

function handleSlackResponse(response, entityId) {
    if (response.status !== 'ok') {
        console.log("action=message_processing status=ERROR entityId=" + entityId +
                    ", response=" + JSON.stringify(response))
        // retry a few times or store it to collection of events to retry (with precise time of a next try)
    } else {
        console.log("action=message_processing status=FINISH entityId=" + entityId);
    }
}
/**
 * Transforms event to human readable text posted to 3rd party system (e.g. slack)
 * @param event
 * @returns {string} human readable representation of the event
 */
function getNotificationContent(event) {
    // there would be probably handlers for every type (not necessarrily here)
    if (event.event_type === 'api_description_document.changed') {
        return "API description document '" + event.data.name + "' has changed"
    } else {
        return JSON.stringify(event);
    }
}
