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
    console.log(event);
    var entity_id = event.data.id;

    console.log("action=message_processing status=START entity_id=" + entity_id)

    var subscriptions = fetchSubscriptions(entity_id, event.type);
    //for every subscription, send the notification and store it in a history of notifications
    sendNotification(event, entity_id);

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
 * has access to entity_id
 *
 * This data should be cached to process notification quickly
 * @param entity_id
 * @param event_type
 */
function fetchSubscriptions(entity_id, event_type) {
    //e.g. fetch it from MongoDB
}

function sendNotification(event, entity_id) {
    if (config.has("Notifications.slack_uri")) {
        slack.webhook({username: "apiarybot", text: getNotificationContent(event)}, function (err, response) {
            handleSlackResponse(response, entity_id);
        });
    } else {
        //log it at least
        console.log("notification - " + JSON.stringify(event));

        console.log("action=message_processing status=FINISH entity_id=" + entity_id)
    }
}

function handleSlackResponse(response, entity_id) {
    if (response.status !== 'ok') {
        console.log("action=message_processing status=ERROR entity_id=" + entity_id +
                    ", response=" + JSON.stringify(response))
        // retry a few times or store it to collection of events to retry (with precise time of a next try)
    } else {
        console.log("action=message_processing status=FINISH entity_id=" + entity_id);
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
