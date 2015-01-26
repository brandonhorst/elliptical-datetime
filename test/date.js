var chai = require('chai');
var expect = chai.expect;
var lacona = require('lacona');
var moment = require('moment');

var datetime = require('..');
var u = require('./util');

chai.use(require('chai-datetime'));

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
			u.parse(test, ['en_US'], 'today', function (err, data) {
				var expectedDate = moment({hour:0}).toDate();
				expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
				done();
			});
		});

		it('handles tomorrow', function (done) {
			u.parse(test, ['en_US'], 'tomorrow', function (err, data) {
				var expectedDate = moment({hour:0}).add(1, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
				done();
			});
		});

		it('handles yesterday', function (done) {
			u.parse(test, ['en_US'], 'yesterday', function (err, data) {
				var expectedDate = moment({hour:0}).add(-1, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
				done();
			});
		});

		it('handles the day before', function (done) {
			u.parse(test, ['en_US'], 'the day before yesterday', function (err, data) {
				var expectedDate = moment({hour:0}).add(-2, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
				done();
			});
		});

		it('handles the day after', function (done) {
			u.parse(test, ['en_US'], 'the day after tomorrow', function (err, data) {
				var expectedDate = moment({hour:0}).add(2, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
        expect(data.result.test).to.equalTime(expectedDate);
				done();
			});
		});
	});
});
