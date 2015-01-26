var lacona = require('lacona');

module.exports = lacona.createPhrase({
  name: 'lacona/datetime',
  getValue: function (result) {
    return new Date(
      result.date.getFullYear(), result.date.getMonth(), result.date.getDate(),
      result.time.getHours(), result.time.getMinutes(), result.time.getSeconds()
    );
  },
  translations: [{
    langs: ['en_US', 'default'],
    describe: require('./en-US')
  }]
});
