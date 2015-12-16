/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { text } from './_util'
import { createElement, Phrase } from 'lacona-phrase'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import lolex from 'lolex'
import { DateTime } from '..'
import moment from 'moment'
import { Parser } from 'lacona'

chai.use(chaiDateTime)

describe('DateTime', () => {
  let parser, clock

  beforeEach(() => {
    parser = new Parser()
    parser.grammar = <DateTime />
  })

  before(() => {
    clock = lolex.install(global, new Date(1990, 9, 11, 12, 0, 0, 0))
  })

  after(() => {
    clock.uninstall()
  })

  const testCases = [{
    input: '2:00pm 2/3/2003',
    output: moment({year: 2003, month: 1, day: 3, hour: 14}).toDate()
  }, {
    input: '2/3/2003 at 2pm',
    output: moment({year: 2003, month: 1, day: 3, hour: 14}).toDate()
  }, {
    input: 'next Tuesday at 8am',
    output: moment({year: 1990, month: 9, day: 16, hour: 8}).toDate()
  }, {
    input: '8am next Tuesday',
    output: moment({year: 1990, month: 9, day: 16, hour: 8}).toDate()
  }, {
    input: '8am on next Tuesday',
    output: moment({year: 1990, month: 9, day: 16, hour: 8}).toDate()
  }, {
    input: 'this morning',
    output: moment({year: 1990, month: 9, day: 11, hour: 8}).toDate()
  }, {
    input: 'this afternoon',
    output: moment({year: 1990, month: 9, day: 11, hour: 12}).toDate()
  }, {
    input: 'tomorrow',
    output: moment({year: 1990, month: 9, day: 12, hour: 8}).toDate()
  }, {
    input: 'tomorrow morning',
    output: moment({year: 1990, month: 9, day: 12, hour: 8}).toDate()
  }, {
    input: 'tomorrow afternoon',
    output: moment({year: 1990, month: 9, day: 12, hour: 12}).toDate()
  }, {
    input: 'tomorrow evening',
    output: moment({year: 1990, month: 9, day: 12, hour: 17}).toDate()
  }, {
    input: 'tomorrow night',
    output: moment({year: 1990, month: 9, day: 12, hour: 20}).toDate()
  }, {
    input: 'tomorrow at 3pm',
    output: moment({year: 1990, month: 9, day: 12, hour: 15}).toDate()
  }, {
    input: 'tomorrow morning at 9',
    output: moment({year: 1990, month: 9, day: 12, hour: 9}).toDate()
  }, {
    input: 'tomorrow afternoon at 9',
    output: moment({year: 1990, month: 9, day: 12, hour: 21}).toDate()
  }, {
    input: 'tomorrow at 9 in the afternoon',
    output: moment({year: 1990, month: 9, day: 12, hour: 21}).toDate()
  }, {
    input: 'tomorrow evening at 9',
    output: moment({year: 1990, month: 9, day: 12, hour: 21}).toDate()
  }, {
    input: 'tomorrow night at 9',
    output: moment({year: 1990, month: 9, day: 12, hour: 21}).toDate()
  }, {
    input: 'tomorrow morning at noon',
    length: 0
  }, {
    input: 'tomorrow afternoon at midnight',
    length: 0
  }, {
    input: 'the day after tomorrow',
    output: moment({year: 1990, month: 9, day: 13, hour: 8}).toDate()
  }, {
    input: 'the afternoon of the day after tomorrow',
    output: moment({year: 1990, month: 9, day: 13, hour: 12}).toDate()
  }, {
    input: 'tomorrow afternoon at 3pm',
    output: moment({year: 1990, month: 9, day: 12, hour: 15}).toDate()
  }, {
    input: 'tomorrow morning at 3pm',
    length: 0
  }, {
    input: 'next Monday morning',
    output: moment({year: 1990, month: 9, day: 15, hour: 8}).toDate()
  }, {
    input: 'the afternoon of 2/3/2003',
    output: moment({year: 2003, month: 1, day: 3, hour: 12}).toDate()
  }]

  _.forEach(testCases, ({input, output, length = 1 }) => {
    it(input, () => {
      const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
      expect(data).to.have.length(length)
      if (length > 0) {
        expect(text(data[0])).to.equal(input)
        expect(data[0].result).to.equalDate(output)
        expect(data[0].result).to.equalTime(output)
      }
    })
  })
})
