var lacona = require('lacona');
var freetext = require('lacona-phrase-freetext');

module.exports = function describe() {
  return lacona.sequence({children: [
    freetext({
      regex: /^(\d|10|11|12)$/,
      default: '1',
      id: 'hour'
    }),
    lacona.literal({text: ':'}),
    freetext({
      regex: /^([0-5]\d)$/,
      default: '00',
      id: 'minute'
    }),
    lacona.literal({optional: true, text: ' '}),
    lacona.choice({id: 'ampm', children: [
      lacona.literal({text: 'am', value: 'am'}),
      lacona.literal({text: 'pm', value: 'pm'})
    ]})
  ]});
};
