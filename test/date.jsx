/** @jsx createElement */

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
		parser.grammar = <DatePhrase />
	})

	it('today', () => {
		const expectedDate = moment({hour:0}).toDate()
		const data = parser.parseArray('today')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('today')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('tomorrow', () => {
		const expectedDate = moment({hour:0}).add(1, 'd').toDate()
		const data = parser.parseArray('tomorrow')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('tomorrow')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('yesterday', () => {
		const expectedDate = moment({hour:0}).add(-1, 'd').toDate()
		const data = parser.parseArray('yesterday')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('yesterday')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('in x days', () => {
		const expectedDate = moment({hour:0}).add(4, 'd').toDate()
		const data = parser.parseArray('in 4 days')
		expect(data).to.have.length(2)
		expect(text(data[0])).to.equal('in 4 days')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('x days ago', () => {
		const expectedDate = moment({hour:0}).add(-4, 'd').toDate()
		const data = parser.parseArray('4 days ago')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('4 days ago')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('in x weeks', () => {
		const expectedDate = moment({hour:0}).add(35, 'd').toDate()
		const data = parser.parseArray('in 5 weeks')
		expect(data).to.have.length(2)
		expect(text(data[0])).to.equal('in 5 weeks')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('next week', () => {
		const expectedDate = moment({hour:0}).add(7, 'd').toDate()
		const data = parser.parseArray('next week')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('next week')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('last year', () => {
		const expectedDate = moment({hour:0}).add(-1, 'y').toDate()
		const data = parser.parseArray('last year')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('last year')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('next Monday', () => {
		const expectedDate = moment().day(8).toDate()
		const data = parser.parseArray('next Monday')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('next Monday')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('this Monday', () => {
		const expectedDate = moment().day(1).toDate()
		const data = parser.parseArray('this Monday')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('this Monday')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('last Monday', () => {
		const expectedDate = moment().day(-6).toDate()
		const data = parser.parseArray('last Monday')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('last Monday')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('the day before yesterday', () => {
		const expectedDate = moment({hour:0}).add(-2, 'd').toDate()
		const data = parser.parseArray('the day before yesterday')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('the day before yesterday')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('the day after tomorrow', () => {
		const expectedDate = moment({hour:0}).add(2, 'd').toDate()
		const data = parser.parseArray('the day after tomorrow')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('the day after tomorrow')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('n weeks before MM/dd', () => {
		const expectedDate = moment({month: 2, day: 14}).subtract(14, 'd').toDate()
		const data = parser.parseArray('2 weeks before 3/14')
		expect(data).to.have.length(2)
		expect(text(data[0])).to.equal('2 weeks before 3/14')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('MM/dd', () => {
		const expectedDate = moment({month: 4, day: 2, hour:0}).toDate()
		const data = parser.parseArray('5/2')
		expect(data).to.have.length(2)
		expect(text(data[0])).to.equal('5/2')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('MM/dd/yy (past)', () => {
		const expectedDate = moment({year: 1992, month: 4, day: 2, hour:0}).toDate()
		const data = parser.parseArray('5/2/92')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('5/2/1992')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('MM/dd/yy (future)', () => {
		const expectedDate = moment({year: 2020, month: 4, day: 2, hour:0}).toDate()
		const data = parser.parseArray('5/2/20')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('5/2/2020')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('MM/dd/yyyy', () => {
		const expectedDate = moment({year: 1992, month: 4, day: 2, hour:0}).toDate()
		const data = parser.parseArray('5/2/1992')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('5/2/1992')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('MMM nth', () => {
		const expectedDate = moment({month: 4, day: 2, hour:0}).toDate()
		const data = parser.parseArray('May 2nd')
		expect(data).to.have.length(2)
		expect(text(data[0])).to.equal('May 2nd')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('MMM n', () => {
		const expectedDate = moment({month: 4, day: 2, hour:0}).toDate()
		const data = parser.parseArray('May 2')
		expect(data).to.have.length(2)
		expect(text(data[0])).to.equal('May 2')
		expect(data[0].result).to.equalDate(expectedDate)
	})

	it('MMM nth, yyyy', () => {
		const expectedDate = moment({year: 1990, month: 4, day: 2, hour:0}).toDate()
		const data = parser.parseArray('May 2nd, 1990')
		expect(data).to.have.length(1)
		expect(text(data[0])).to.equal('May 2nd, 1990')
		expect(data[0].result).to.equalDate(expectedDate)
	})
})
