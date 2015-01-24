//
// describe('time', function () {
// 	var parser;
//
// 	var grammar = {
// 		phrases: [{
// 			name: 'test',
// 			root: {
// 				type: 'time',
// 				id: 'test'
// 			}
// 		}],
// 		dependencies: [datetime]
// 	};
//
// 	beforeEach(function () {
// 		parser = new Parser({sentences: ['test']});
// 	});
//
// 	it('handles hh:mm', function (done) {
// 		var handleData = sinon.spy(function (data) {
// 			var expectedDate = moment({hour: 11, minute: 3}).toDate();
// 			expect(data.result.test).to.equalDate(expectedDate);
// 		});
//
// 		var handleEnd = function () {
// 			expect(handleData).to.have.been.called.once;
// 			done();
// 		};
//
// 		parser
// 		.understand(grammar)
// 		.on('data', handleData)
// 		.on('end', handleEnd)
// 		.parse('11:03 am');
// 	});
// });
