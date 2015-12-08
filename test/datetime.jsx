/** @jsx createElement */

import _ from 'lodash'
import { text } from './_util'
import { createElement, Phrase } from 'lacona-phrase'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import { DateTime } from '..'
import moment from 'moment'
import { Parser } from 'lacona'

chai.use(chaiDateTime)

describe('datetime', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
    parser.grammar = <DateTime />
  })

  const testCases = [
    {input: '2:00pm 2/3/2003', output: moment({years: 2003, months: 1, days: 3, hours: 14}).toDate()},
    {input: '2/3/2003 at 2pm', output: moment({years: 2003, months: 1, days: 3, hours: 14}).toDate()},
    {input: 'next Tuesday at 8am', output: moment({hours: 8}).day(9).toDate()},
    {input: '8am next Tuesday', output: moment({hours: 8}).day(9).toDate()},
    {input: '8am on next Tuesday', output: moment({hours: 8}).day(9).toDate()},
    {input: 'tomorrow', output: moment({hours: 8}).add({days: 1}).toDate()},
    {input: 'tomorrow morning', output: moment({hours: 8}).add({days: 1}).toDate()},
    {input: 'tomorrow afternoon', output: moment({hours: 12}).add({days: 1}).toDate()},
    {input: 'tomorrow evening', output: moment({hours: 17}).add({days: 1}).toDate()},
    {input: 'tomorrow night', output: moment({hours: 20}).add({days: 1}).toDate()},
    {input: 'tomorrow at 3pm', output: moment({hours: 15}).add({days: 1}).toDate()},
    {input: 'tomorrow afternoon at 3pm', output: moment({hours: 15}).add({days: 1}).toDate()},
    {input: 'tomorrow morning at 3pm', length: 0},
    {input: 'next Monday morning', output: moment({hours: 8}).day(8).toDate()},
    {input: 'the afternoon of 2/3/2003', output: moment({years: 2003, months: 1, days: 3, hours: 12}).toDate()}
  ]

  _.forEach(testCases, ({input, output, length = 1 }) => {
    it(input, () => {
      const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
      // console.log(data)
      expect(data).to.have.length(length)
      if (length > 1) {
        expect(text(data[0])).to.equal(input)
        expect(data[0].result).to.equalDate(output)
        expect(data[0].result).to.equalTime(output)
      }
    })
  })
})
