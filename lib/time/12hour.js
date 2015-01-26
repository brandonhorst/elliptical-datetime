var lacona = require('lacona');
var list = require('lacona-phrase-list');

function getRange(a, b, padToTwo) {
  var list = [];
  for (var i = a; i <= b; i++) {
    list.push({
      text: padToTwo && i < 9 ? '0' + i.toString() : i.toString(),
      value: i
    });
  }
  return list;
}

function getHours(done) {
  done(null, getRange(1, 12, false));
}

function getMinutes(done) {
  done(null, getRange(0, 59, true));
}

module.exports = function describe() {
  return lacona.choice({children: [
    lacona.literal({id: 'hour', text: 'noon', value: 12}),
    lacona.literal({id: 'hour', text: 'midnight', value: 0}),
    lacona.sequence({children: [
      list({collect: getHours, id: 'hour'}),
      lacona.sequence({optional: true, children: [
        lacona.literal({text: ':'}),
        list({collect: getMinutes, id: 'minute'})
      ]}),
      lacona.choice({id: 'ampm', limit: 2, children: [
        lacona.literal({text: 'am', value: 'am'}),
        lacona.literal({text: 'pm', value: 'pm'}),
        lacona.literal({text: ' am', value: 'am'}),
        lacona.literal({text: ' pm', value: 'pm'}),
        lacona.literal({text: 'a', value: 'am'}),
        lacona.literal({text: 'p', value: 'pm'})
      ]})
    ]})
  ]});
};
