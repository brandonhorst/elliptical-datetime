module.exports = {
	scope: {
		getDate: function (result, done) {
			if result.relativeDay?
				date = new Date()
				date.setHours(0, 0, 0, 0)
				date.setDate(date.getDate() + result.relativeDay)
				done(null, date)
			} else {
				done(null, new Date())
			}
		}
	},
	schema: [
		{
			name: 'day-of-the-week',
			grammars: require('./day-of-the-week')
		}, {
			name: 'date',
			grammars: require('./date')
		}
	}
};