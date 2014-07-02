var async = require('async');
var chai = require('chai');
var expect = chai.expect;
var moment = require('moment');
var sinon = require('sinon');
var Parser = require('lacona').Parser;

chai.use(require('sinon-chai'));
chai.use(require('chai-datetime'));

describe('datetime', function () {
	it('handles a named relative date (en_US)', function (done) {
		var schema = {
			root: {
				type: 'date',
				id: 'test'
			},
			run: ''
		};

		var testCases = [
			{
				input: 'today',
				desc: 'today',
				relativeDays: 0
			}, {
				input: 'tomorrow',
				desc: 'tomorrow',
				relativeDays: 1
			}, {
				input: 'the day after tomorrow',
				desc: 'the day after tomorrow',
				relativeDays: 2
			}, {
				input: 'in 5 days',
				desc: 'in n days',
				relativeDays: 5
			}
		]

		async.each(testCases, function (testCase, done) {
			var handleData = sinon.spy(function (data) {
				expect(data.result.test, testCase.desc).to.equalDate(
					moment({hour: 0}).add(testCase.relativeDays, 'd').toDate()
				);
			});

			var handleEnd = function () {
				expect(handleData, testCase.desc).to.have.been.called.once;
				done();
			};

			new Parser()
			.understand(schema)
			.on('data', handleData)
			.on('end', handleEnd)
			.parse(testCase.input);
		} , done);
	});
});
