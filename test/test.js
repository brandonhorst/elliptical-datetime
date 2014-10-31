var async = require('async');
var chai = require('chai');
var datetime = require('../lib/datetime')
var expect = chai.expect;
var moment = require('moment');
var sinon = require('sinon');
var Parser = require('lacona').Parser;

chai.use(require('sinon-chai'));
chai.use(require('chai-datetime'));

describe('datetime', function () {
	var parser;

	beforeEach(function () {
		parser = new Parser({sentences: ['test']});
	});

	describe('relative dates (en_US)', function () {

		var grammar = {
			phrases: [{
				name: 'test',
				root: {
					type: 'date',
					id: 'test'
				}
			}],
			dependencies: [datetime]
		};

		it('handles today', function (done) {

			var handleData = sinon.spy(function (data) {
				expect(data.result.test).to.equalDate(new Date());
			});

			var handleEnd = function () {
				expect(handleData).to.have.been.called.once;
				done();
			};

			parser
			.understand(grammar)
			.on('data', handleData)
			.on('end', handleEnd)
			.parse('today');
		});

		it('handles tomorrow', function (done) {

			var handleData = sinon.spy(function (data) {
				var expectedDate = moment({hour: 0}).add(1, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
			});

			var handleEnd = function () {
				expect(handleData).to.have.been.called.once;
				done();
			};

			parser
			.understand(grammar)
			.on('data', handleData)
			.on('end', handleEnd)
			.parse('tomorrow');
		});

		it('handles the day after tomorrow', function (done) {

			var handleData = sinon.spy(function (data) {
				var expectedDate = moment({hour: 0}).add(2, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
			});

			var handleEnd = function () {
				expect(handleData).to.have.been.called.once;
				done();
			};

			parser
			.understand(grammar)
			.on('data', handleData)
			.on('end', handleEnd)
			.parse('the day after tomorrow');
		});

		it('handles in n days', function (done) {

			var handleData = sinon.spy(function (data) {
				var expectedDate = moment({hour: 0}).add(5, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
			});

			var handleEnd = function () {
				expect(handleData).to.have.been.called.once;
				done();
			};

			parser
			.understand(grammar)
			.on('data', handleData)
			.on('end', handleEnd)
			.parse('in 5 days');
		});

	});
});
