var chai = require('chai');
var expect = chai.expect;
var lacona = require('lacona');
var es = require('event-stream');

chai.use(require('chai-datetime'));

function parse(phrase, langs, input, expectedDate, done) {
  function callback(err, data) {
    expect(data).to.have.length(3);
    expect(data[1].data.result.test).to.equalDate(expectedDate);
    expect(data[1].data.result.test).to.equalTime(expectedDate);
    done(null, data[1].data);
  }
  var parser = new lacona.Parser();
  parser.sentences = [phrase()];
  parser.langs = langs;

  es.readArray([input])
    .pipe(parser)
    .pipe(es.writeArray(callback));
}

module.exports.parse = parse;
