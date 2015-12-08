/** @jsx createElement */

import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import chai, {expect} from 'chai'
import chaiDateTime from 'chai-datetime'
import {text} from './_util'
import {Date as DatePhrase} from '..'
import moment from 'moment'
import {Parser} from 'lacona'

chai.use(chaiDateTime)
chai.config.includeStack = true

describe('date', () => {
	let parser

	beforeEach(() => {
		parser = new Parser()
	})

	describe('default', () => {

		beforeEach(() => {
			parser.grammar = <DatePhrase />
		})

		const testCases = [
			{output: moment({hour:0}).toDate(), input: 'today', length: 1},
			{output: moment({hour:0}).add(1, 'd').toDate(), input: 'tomorrow', length:1},
			{output: moment({hour:0}).add(-1, 'd').toDate(), input: 'yesterday', length:1},
			{output: moment({hour:0}).add(4, 'd').toDate(), input: '4 days from today', length:1},
			{output: moment({hour:0}).add(-4, 'd').toDate(), input: '4 days ago', length:1},
			{output: moment({hour:0}).add(35, 'd').toDate(), input: '5 weeks from now', length:1},
			{output: moment({hour:0}).add(7, 'd').toDate(), input: 'next week', length:1},
			{output: moment({hour:0}).add(-1, 'y').toDate(), input: 'last year', length:1},
			{output: moment().day(8).toDate(), input: 'next Monday', length:1},
			{output: moment().day(1).toDate(), input: 'this Monday', length:1},
			{output: moment().day(-6).toDate(), input: 'last Monday', length:1},
			{output: moment({hour:0}).add(-2, 'd').toDate(), input: 'the day before yesterday', length:1},
			{output: moment({hour:0}).add(2, 'd').toDate(), input: 'the day after tomorrow', length:1},
			{output: moment({month: 2, day: 14}).subtract(14, 'd').toDate(), input: '2 weeks before 3/14', length:2},
			{output: moment({month: 4, day: 2, hour:0}).toDate(), input: '5/2', length:2},
			{output: moment({year: 1992, month: 4, day: 2, hour:0}).toDate(), input: '5/2/92', length:1},
			{output: moment({year: 2020, month: 4, day: 2, hour:0}).toDate(), input: '5/2/20', length:1},
			{output: moment({year: 1992, month: 4, day: 2, hour:0}).toDate(), input: '5/2/1992', length:1},
			{output: moment({month: 4, day: 2, hour:0}).toDate(), input: 'May 2nd', length:2},
			{output: moment({month: 4, day: 2, hour:0}).toDate(), input: 'May 2', length:2},
			{output: moment({year: 1990, month: 4, day: 2, hour:0}).toDate(), input: 'May 2nd, 1990', length:1}
		]

		_.forEach(testCases, test => {
	    it(test.input, () => {
	      const data = parser.parseArray(test.input)
	      expect(data).to.have.length(test.length)
	      if (test.length > 1) {
	        expect(text(data[0])).to.equal(test.input)
	        expect(data[0].result).to.equalDate(test.output)
	      }
	    })
	  })
	})


	describe('time of day', () => {
		// it('tomorrow morning'

	})
})
