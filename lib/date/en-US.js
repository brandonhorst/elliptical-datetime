var lacona = require('lacona');

module.exports = function describe() {
	return lacona.choice({
		children: [
			lacona.choice({
				id: 'relativeDay',
				children: [
					lacona.literal({text: 'yesterday', value: -1}),
					lacona.literal({text: 'today', value: 0}),
					lacona.literal({text: 'tomorrow', value: 1})
				]
			}),
			lacona.sequence({
				children: [
					lacona.choice({
						id: 'recursiveDay',
						children: [
							lacona.literal({text: 'the day before ', value: -1}),
							lacona.literal({text: 'the day after ', value: 1})
						]
					}),
					this.factory({id: 'relativeDate'})
				]
			})
		]
	});
};
