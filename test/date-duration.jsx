/** @jsx createElement */
/* eslint-env mocha */

import { createElement, Phrase } from 'lacona-phrase'
import { expect } from 'chai'
import { text } from './_util'
import { DateDuration } from '..'
import { Parser } from 'lacona'

describe('date-duration', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
    parser.grammar = <DateDuration />
  })

  it('1 day', () => {
    const data = parser.parseArray('1 day')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('1 day')
    expect(data[0].result).to.eql({days: 1})
  })

  it('x days', () => {
    const data = parser.parseArray('3 days')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('3 days')
    expect(data[0].result).to.eql({days: 3})
  })

  it('1 week', () => {
    const data = parser.parseArray('1 week')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('1 week')
    expect(data[0].result).to.eql({days: 7})
  })

  it('x weeks', () => {
    const data = parser.parseArray('3 weeks')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('3 weeks')
    expect(data[0].result).to.eql({days: 21})
  })

  it('1 year', () => {
    const data = parser.parseArray('1 year')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('1 year')
    expect(data[0].result).to.eql({years: 1})
  })

  it('x days', () => {
    const data = parser.parseArray('3 years')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('3 years')
    expect(data[0].result).to.eql({years: 3})
  })

  it('1 year', () => {
    const data = parser.parseArray('1 month')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('1 month')
    expect(data[0].result).to.eql({months: 1})
  })

  it('x days', () => {
    const data = parser.parseArray('3 months')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('3 months')
    expect(data[0].result).to.eql({months: 3})
  })

  it('x years and 1 month', () => {
    const data = parser.parseArray('2 years and 1 month')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('2 years and 1 month')
    expect(data[0].result).to.eql({years: 2, months: 1})
  })

  it('1 year and x days', () => {
    const data = parser.parseArray('1 year and 11 months')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('1 year and 11 months')
    expect(data[0].result).to.eql({years: 1, months: 11})
  })

  it('x years, x months, and 1 day', () => {
    const data = parser.parseArray('2 years, 6 months, and 1 day')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('2 years, 6 months, and 1 day')
    expect(data[0].result).to.eql({years: 2, months: 6, days: 1})
  })

  it('x years, x months, and x weeks', () => {
    const data = parser.parseArray('2 years, 6 months, and 2 weeks')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('2 years, 6 months, and 2 weeks')
    expect(data[0].result).to.eql({years: 2, months: 6, days: 14})
  })

  it('x weeks and x days', () => {
    const data = parser.parseArray('3 weeks and 4 days')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('3 weeks and 4 days')
    expect(data[0].result).to.eql({days: 25})
  })

  it('x weeks and x years', () => {
    const data = parser.parseArray('2 weeks and 3 years')
    expect(data).to.have.length(2)
    expect(text(data[0])).to.equal('2 weeks and 3 years')
    expect(data[0].result).to.eql({years: 3, days: 14})
  })

  it('x years and x years', () => {
    const data = parser.parseArray('2 years and 3 years')
    expect(data).to.have.length(0)
  })
})
