/** @jsx createElement */

import {text} from './_util'
import {createElement, Phrase} from 'lacona-phrase'
import chai, {expect} from 'chai'
import chaiDateTime from 'chai-datetime'
import {Time} from '..'
import moment from 'moment'
import {Parser} from 'lacona'

chai.use(chaiDateTime)
chai.config.includeStack = true

describe('time', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
    parser.grammar = <Time />
  })

  it('h:mm am', () => {
    const expectedDate = moment({hours: 3, minutes: 31}).toDate()
		const data = parser.parseArray('3:31 am')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('3:31 am')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('h:mm pm', () => {
    const expectedDate = moment({hours: 15, minutes: 31}).toDate()
		const data = parser.parseArray('3:31 pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('3:31 pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('hpm', () => {
    const expectedDate = moment({hours: 15}).toDate()
		const data = parser.parseArray('3pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('3pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('midnight', () => {
    const expectedDate = moment({hours: 0}).toDate()
		const data = parser.parseArray('midnight')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('midnight')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('noon', () => {
    const expectedDate = moment({hours: 12}).toDate()
		const data = parser.parseArray('noon')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('noon')
		expect(data[0].result).to.equalDate(expectedDate)
  })

  it('quarter to hpm', () => {
    const expectedDate = moment({hours: 15, minutes: 45}).toDate()
		const data = parser.parseArray('quarter to 4pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('quarter to 4pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('quarter to midnight', () => {
    const expectedDate = moment({hours: 23, minutes: 45}).toDate()
		const data = parser.parseArray('quarter to midnight')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('quarter to midnight')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('half past hpm', () => {
    const expectedDate = moment({hours: 15, minutes: 30}).toDate()
		const data = parser.parseArray('half past 3pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('half past 3pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('n til hpm', () => {
    const expectedDate = moment({hours: 15, minutes: 50}).toDate()
		const data = parser.parseArray('10 til 4pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('10 til 4pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('n hours before noon', () => {
    const expectedDate = moment({hours: 10}).toDate()
		const data = parser.parseArray('2 hours before noon')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('2 hours before noon')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('in n hours', () => {
    const expectedDate = moment().seconds(0).milliseconds(0).add({hours: 3}).toDate()
		const data = parser.parseArray('in 3 hours')
		expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('in 3 hours')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('n minutes ago', () => {
    const expectedDate = moment().seconds(0).milliseconds(0).subtract({minutes: 3}).toDate()
		const data = parser.parseArray('3 minutes ago')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('3 minutes ago')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('n minutes before n minutes ago', () => {
		const data = parser.parseArray('2 minutes before 3 minutes ago')
		expect(data).to.have.length(0)
  })
})
