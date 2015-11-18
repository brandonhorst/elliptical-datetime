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

  it('handles h:mm am', () => {
    const expectedDate = moment({hours: 3, minutes: 31}).toDate()
		const data = parser.parseArray('3:31 am')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('3:31 am')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles h:mm pm', () => {
    const expectedDate = moment({hours: 15, minutes: 31}).toDate()
		const data = parser.parseArray('3:31 pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('3:31 pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles hpm', () => {
    const expectedDate = moment({hours: 15}).toDate()
		const data = parser.parseArray('3pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('3pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles midnight', () => {
    const expectedDate = moment({hours: 0}).toDate()
		const data = parser.parseArray('midnight')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('midnight')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles noon', () => {
    const expectedDate = moment({hours: 12}).toDate()
		const data = parser.parseArray('noon')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('noon')
		expect(data[0].result).to.equalDate(expectedDate)
  })

  it('handles quarter to', () => {
    const expectedDate = moment({hours: 15, minutes: 45}).toDate()
		const data = parser.parseArray('quarter to 4pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('quarter to 4pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles before midnight', () => {
    const expectedDate = moment({hours: 23, minutes: 45}).toDate()
		const data = parser.parseArray('quarter to midnight')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('quarter to midnight')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles half past', () => {
    const expectedDate = moment({hours: 15, minutes: 30}).toDate()
		const data = parser.parseArray('half past 3pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('half past 3pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles 10 til', () => {
    const expectedDate = moment({hours: 15, minutes: 50}).toDate()
		const data = parser.parseArray('10 til 4pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('10 til 4pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles hpm', () => {
    const expectedDate = moment({hours: 15}).toDate()
		const data = parser.parseArray('3pm')
		expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('3pm')
		expect(data[0].result).to.equalTime(expectedDate)
  })
})
