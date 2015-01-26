var lacona = require('lacona');
var moment = require('moment');

var datetime = require('..');
var u = require('./util');

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
      var expectedDate = moment({hours: 14}).add({days: 1}).toDate();
      u.parse(test, ['en_US'], '2:00pm tomorrow', expectedDate, done);
    });

    it('handles "date at time"', function (done) {
      var expectedDate = moment({hours: 14}).add({days: 1}).toDate();
      u.parse(test, ['en_US'], 'tomorrow at 2:00pm', expectedDate, done);
    });
  });
});
