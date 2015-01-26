var lacona = require('lacona');

module.exports = lacona.createPhrase({
  name: 'lacona/date',
  getValue: function (result) {
    var date = new Date();

    var hour = result.hour;
    if (result.ampm) {
      hour = result.ampm === 'am' ?
        (result.hour === '12' ? 0 : parseInt(result.hour)) :
        parseInt(result.hour) + 12;
    }
    var minute = result.minute ? parseInt(result.minute) : 0;
    date.setHours(hour, minute, 0, 0);

    return date;
  },
  translations: [{
    langs: ['en_US', 'default'],
    describe: require('./12hour')
  }]
});
