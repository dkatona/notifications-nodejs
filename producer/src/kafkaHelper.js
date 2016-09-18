'use strict';

var encode = require('hashcode').hashCode;

/**
 * Returns partition number to send the message with entityId to - messages with same entityId land in the same
 * partition to maintain order
 *
 * @param entityId id of the entity changed in notification
 * @param numberOfPartitions - number of partitions in kafka, must be positive number
 * @returns partition number in kafka
 */
exports.partitionNumber = function(entityId, numberOfPartitions){
    if (numberOfPartitions < 1 || isNaN(numberOfPartitions)) {
        throw new Error("Number of partitions needs to be at least 1!");
    }
    var hashcode = encode().value(entityId);
    return Math.abs(hashcode % numberOfPartitions); //basically the same as kafka keyed partitioner
}