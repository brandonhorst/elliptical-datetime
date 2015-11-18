/** @jsx createElement */

import {text} from './_util'
import {createElement, Phrase} from 'lacona-phrase'
import chai, {expect} from 'chai'
import chaiDateTime from 'chai-datetime'
import {DateTime} from '..'
import moment from 'moment'
import {Parser} from 'lacona'

chai.use(chaiDateTime)

describe('DateTime', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
    parser.grammar = <DateTime />
  })

  it('handles "time date"', () => {
    const expectedDate = moment({hours: 14}).add({days: 1}).toDate();

    const data = parser.parseArray('2:00 pm tomorrow')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('2:00 pm tomorrow')
    expect(data[0].result).to.equalDate(expectedDate)
    expect(data[0].result).to.equalTime(expectedDate)
  })

  it('handles "date at time"', () => {
    const expectedDate = moment({hours: 14}).add({days: 1}).toDate();

    const data = parser.parseArray('tomorrow at 2:00pm')
    expect(data).to.have.length(1)
    expect(text(data[0])).to.equal('tomorrow at 2:00pm')
    expect(data[0].result).to.equalDate(expectedDate)
    expect(data[0].result).to.equalTime(expectedDate)
  })
})
