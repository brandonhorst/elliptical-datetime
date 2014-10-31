module.exports = {
	scope: {
		getDate: function (result, done) {
			if (typeof result.relativeDay === 'number') {
				var date = new Date();
				date.setHours(0, 0, 0, 0);
				date.setDate(date.getDate() + result.relativeDay);
				done(null, date);
			} else {
				done(null, new Date());
			}
		},
		getTime: function (result, done) {
			var date = new Date();
			var hour = parseInt(result.hour);
			var minute = result.minute ? parseInt(result.minute) : 0;
			date.setHours(hour, minute, 0, 0);
			done(null, date);
		}
	},
	phrases: [
		{
			name: 'day-of-the-week',
			schemas: require('./day-of-the-week')
		}, {
			name: 'date',
			evaluate: 'getDate',
			schemas: require('./date')
		}, {
			name: 'time',
			evaluate: 'getTime',
			schemas: require('./time')
		}
	],
	dependencies: [
		require('lacona-phrase-freetext'),
		require('lacona-phrase-number')
	]
};
