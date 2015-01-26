var lacona = require('lacona');
var date = require('../date');
var time = require('../time');

module.exports = function describe() {
  return lacona.choice({children: [
    lacona.sequence({children: [
      time({id: 'time'}),
      lacona.literal({text: ' '}),
      date({id: 'date'})
    ]}),
    lacona.sequence({children: [
      date({id: 'date'}),
      lacona.literal({text: ' at '}),
      time({id: 'time'})
    ]})
  ]});
};
