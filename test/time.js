var lacona = require('lacona');
var moment = require('moment');

var datetime = require('..');
var u = require('./util');

describe('time', function () {

  describe('en_US', function () {
    var test;

    beforeEach(function () {
      test = lacona.createPhrase({
        name: 'test/test',
        describe: function () {
          return datetime.time({id: 'test'});
        }
      });
    });

    it('handles h:mm am', function (done) {
      var expectedDate = moment({hours: 3, minutes: 31}).toDate();
      u.parse(test, ['en_US'], '3:31 am', expectedDate, done);
    });

    it('handles h:mm pm', function (done) {
      var expectedDate = moment({hours: 15, minutes: 31}).toDate();
      u.parse(test, ['en_US'], '3:31 pm', expectedDate, done);
    });

    it('handles hpm', function (done) {
      var expectedDate = moment({hours: 15}).toDate();
      u.parse(test, ['en_US'], '3pm', expectedDate, done);
    });

    it('handles midnight', function (done) {
      var expectedDate = moment({hours: 0}).toDate();
      u.parse(test, ['en_US'], 'midnight', expectedDate, done);
    });

    it('handles noon', function (done) {
      var expectedDate = moment({hours: 12}).toDate();
      u.parse(test, ['en_US'], 'noon', expectedDate, done);
    });
  });
});
