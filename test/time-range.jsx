/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import { text } from './_util'
import { TimeRange } from '..'
import moment from 'moment'
import { Parser } from 'lacona'

chai.use(chaiDateTime)

describe('time-range', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('default', () => {

    beforeEach(() => {
      parser.grammar = <TimeRange />
    })

    const testCases = [
      {input: '3pm to 6pm', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).toDate()}},
      {input: '3pm for 3 hours', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).toDate()}},
      {input: '10pm for 3 hours', output: {start: moment({hour: 22}).toDate(), end: moment({hour: 1}).add(1, 'day').toDate()}},
      {input: '10pm to 1am', output: {start: moment({hour: 22}).toDate(), end: moment({hour: 1}).toDate()}},
      {input: '8:30am for 3 hours and 34 minutes', output: {start: moment({hour: 8, minutes: 30}).toDate(), end: moment({hour: 12, minutes: 4}).toDate()}}
    ]

    _.forEach(testCases, ({input, output, length = 1 }) => {
      it(input, () => {
        const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
        expect(data).to.have.length(length)
        if (length > 0) {
          expect(text(data[0])).to.equal(input)
          expect(data[0].result.start).to.equalTime(output.start)
          expect(data[0].result.end).to.equalTime(output.end)
        }
      })
    })
  })
})
