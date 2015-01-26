var chai = require('chai');
var expect = chai.expect;
var lacona = require('lacona');
var moment = require('moment');

var datetime = require('..');
var u = require('./util');

chai.use(require('chai-datetime'));

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
      u.parse(test, ['en_US'], '3:31 am', function (err, data) {
        var expectedDate = moment({hours: 3, minutes: 31}).toDate();
        expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
        done();
      });
    });

    it('handles h:mm am', function (done) {
      u.parse(test, ['en_US'], '3:31 pm', function (err, data) {
        var expectedDate = moment({hours: 15, minutes: 31}).toDate();
        expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
        done();
      });
    });
  });
});
