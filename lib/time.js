var lacona = require('lacona');

module.exports = lacona.createPhrase({
  name: 'lacona/date',
	getTime: function (result, done) {
		var date = new Date();
		var hour = parseInt(result.hour);
		var minute = result.minute ? parseInt(result.minute) : 0;
		date.setHours(hour, minute, 0, 0);
		done(null, date);
	},
  translations: require('./time-phrase')
});
