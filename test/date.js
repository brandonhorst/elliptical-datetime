var lacona = require('lacona');
var moment = require('moment');

var datetime = require('..');
var u = require('./util');

describe('date', function () {

	describe('en_US', function () {
		var test;

		beforeEach(function () {
			test = lacona.createPhrase({
				name: 'test/test',
				describe: function () {
					return datetime.date({id: 'test'});
				}
			});
		});

		it('handles today', function (done) {
			var expectedDate = moment({hour:0}).toDate();
			u.parse(test, ['en_US'], 'today', expectedDate, done);
		});

		it('handles tomorrow', function (done) {
			var expectedDate = moment({hour:0}).add(1, 'd').toDate();
			u.parse(test, ['en_US'], 'tomorrow', expectedDate, done);
		});

		it('handles yesterday', function (done) {
			var expectedDate = moment({hour:0}).add(-1, 'd').toDate();
			u.parse(test, ['en_US'], 'yesterday', expectedDate, done);
		});

		it('handles the day before', function (done) {
			var expectedDate = moment({hour:0}).add(-2, 'd').toDate();
			u.parse(test, ['en_US'], 'the day before yesterday', expectedDate, done);
		});

		it('handles the day after', function (done) {
			var expectedDate = moment({hour:0}).add(2, 'd').toDate();
			u.parse(test, ['en_US'], 'the day after tomorrow', expectedDate, done);
		});
	});
});
