var chai = require('chai');
var expect = chai.expect;
var kafkaHelper = require("../src/kafkaHelper.js")

describe('kafkaHelper', function() {
    it('partitionNumber() should return same number for same entity ids', function() {
        var partitionFirstCall = kafkaHelper.partitionNumber("ssaa-223", 24);
        var partitionSecondCall = kafkaHelper.partitionNumber("ssaa-223", 24);
        expect(partitionFirstCall).to.equal(partitionSecondCall);
    });
    it('partitionNumber() should be within partitions boundaries', function() {
        expect(kafkaHelper.partitionNumber("ssaa-223", 24)).to.be.within(0,23);
        expect(kafkaHelper.partitionNumber("ssaa-223", 2)).to.be.within(0,1);
        expect(kafkaHelper.partitionNumber("ssaa-12131", 120)).to.be.within(0,119);
        expect(kafkaHelper.partitionNumber("ssaa-223", 1)).to.be.equal(0);
    });
    it('partitionNumber() should throw exception when numberOfPartitions is invalid', function() {
        expect(function() {
            kafkaHelper.partitionNumber("ssaa-223", -1);
        }).to.throw("Number of partitions needs to be at least 1!");
        expect(function() {
            kafkaHelper.partitionNumber("ssaa-223", "sas");
        }).to.throw("Number of partitions needs to be at least 1!");
    });
});