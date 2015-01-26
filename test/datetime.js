var chai = require('chai');
var expect = chai.expect;
var lacona = require('lacona');
var moment = require('moment');

var datetime = require('..');
var u = require('./util');

chai.use(require('chai-datetime'));

describe('datetime', function () {

  describe('en_US', function () {
    var test;

    beforeEach(function () {
      test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return datetime.datetime({id: 'test'});
        }
      });
    });

    it('handles "time date"', function (done) {
      u.parse(test, ['en_US'], '2:00pm tomorrow', function (err, data) {
        var expectedDate = moment({hours: 14}).add({days: 1}).toDate();
        expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
        done();
      });
    });

    it('handles "date at time"', function (done) {
      u.parse(test, ['en_US'], 'tomorrow at 2:00pm', function (err, data) {
        var expectedDate = moment({hours: 14}).add({days: 1}).toDate();
        expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
        done();
      });
    });
  });
});
