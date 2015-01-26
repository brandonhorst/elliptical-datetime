var lacona = require('lacona');

module.exports = lacona.createPhrase({
	name: 'lacona/date',
	getValue: function (result) {
		var date;

		if (typeof result.relativeDay === 'number') {
			date = new Date();
			date.setHours(0, 0, 0, 0);
			date.setDate(date.getDate() + result.relativeDay);
			return date;

		} else if (typeof result.recursiveDay === 'number') {
			date = result.relativeDate;
			date.setHours(0, 0, 0, 0);
			date.setDate(date.getDate() + result.recursiveDay);
			return date;

		}
		console.log('Something went wrong with Date', result);
		return new Date();
	},
	translations: [{
		langs: ['en_US', 'default'],
		describe: require('./en-US')
	}]
});
