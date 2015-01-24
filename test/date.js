var chai = require('chai');
var expect = chai.expect;
var lacona = require('lacona');
var moment = require('moment');
var stream = require('stream');

var datetime = require('..');

chai.use(require('chai-datetime'));

function toArray(done) {
	var newStream = new stream.Writable({objectMode: true});
	var list = [];
	newStream.write = function(obj) {
		list.push(obj);
	};

	newStream.end = function() {
		done(list);
	};

	return newStream;
}

function toStream(strings) {
	var newStream = new stream.Readable({objectMode: true});

	strings.forEach(function (string) {
		newStream.push(string);
	});
	newStream.push(null);

	return newStream;
}

function parse(phrase, langs, input, done) {
	function callback(data) {
		expect(data).to.have.length(3);
		done(null, data[1].data);
	}
	var parser = new lacona.Parser();
	parser.sentences = [phrase()];
	parser.langs = langs;

	toStream([input])
		.pipe(parser)
		.pipe(toArray(callback));
}


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
			parse(test, ['en_US'], 'today', function (err, data) {
				expect(data.result.test).to.equalDate(new Date());
				done();
			});
		});

		it('handles tomorrow', function (done) {
			parse(test, ['en_US'], 'tomorrow', function (err, data) {
				var expectedDate = moment({hour:0}).add(1, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
				done();
			});
		});

		it('handles yesterday', function (done) {
			parse(test, ['en_US'], 'yesterday', function (err, data) {
				var expectedDate = moment({hour:0}).add(-1, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
				done();
			});
		});

		it('handles the day before', function (done) {
			parse(test, ['en_US'], 'the day before yesterday', function (err, data) {
				var expectedDate = moment({hour:0}).add(-2, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
				done();
			});
		});

		it('handles the day after', function (done) {
			parse(test, ['en_US'], 'the day after tomorrow', function (err, data) {
				var expectedDate = moment({hour:0}).add(2, 'd').toDate();
				expect(data.result.test).to.equalDate(expectedDate);
				done();
			});
		});

		// it('handles the day after tomorrow', function (done) {
		// 	function callback(data) {
		// 		var expectedDate = moment({hour:0}).add(2, 'd').toDate()
		// 		expect(data).to.have.length(3);
		// 		expect(data[1].result.test).to.equalDate(expectedDate);
		// 		done();
		// 	}
		//
		// 	toStream(['the day after tomorrow'])
		// 		.pipe(parser)
		// 		.pipe(toArray(callback));
		// });

		// it('handles in n days', function (done) {
		// 	function callback(data) {
		// 		var expectedDate = moment({hour:0}).add(5, 'd').toDate()
		// 		expect(data).to.have.length(3);
		// 		expect(data[1].result.test).to.equalDate(expectedDate);
		// 		done();
		// 	}
		//
		// 	toStream(['in 5 days'])
		// 		.pipe(parser)
		// 		.pipe(toArray(callback));
		// });
	});
});
