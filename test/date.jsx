/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { expect } from 'chai'
import lolex from 'lolex'
import { text } from './_util'
import { Date as DatePhrase } from '..'
import moment from 'moment'
import { Parser } from 'lacona'


describe('Date', () => {
  let parser
  let clock

  function test ({input, output, suggestion, length = 1 }) {
    it(input, () => {
      const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
      expect(data).to.have.length(length)
      if (length > 0) {
        expect(text(data[0])).to.equal(suggestion || input)
        expect(data[0].result).to.equalDate(output)
      }
    })
  }

  beforeEach(() => {
    parser = new Parser()
  })

  before(() => {
    clock = lolex.install(global, moment({year: 1990, month: 9, day: 11}).toDate())
  })

  after(() => {
    clock.uninstall()
  })

  describe('default', () => {

    beforeEach(() => {
      parser.grammar = <DatePhrase />
    })

    const testCases = [{
      output: moment({year: 1990, month: 9, day: 11}).toDate(),
      input: 'today'
    }, {
      output: moment({year: 1990, month: 9, day: 12}).toDate(),
      input: 'tomorrow'
    }, {
      output: moment({year: 1990, month: 9, day: 10}).toDate(),
      input: 'yesterday'
    }, {
      output: moment({year: 1990, month: 9, day: 15}).toDate(),
      input: '4 days from today'
    }, {
      output: moment({year: 1990, month: 9, day: 7}).toDate(),
      input: '4 days ago'
    }, {
      output: moment({year: 1990, month: 10, day: 15}).toDate(),
      input: '5 weeks from now'
    }, {
      output: moment({year: 1990, month: 9, day: 18}).toDate(),
      input: 'next week'
    }, {
      output: moment({year: 1989, month: 9, day: 11}).toDate(),
      input: 'last year'
    }, {
      output: moment({year: 1990, month: 9, day: 15}).toDate(),
      input: 'next Monday'
    }, {
      output: moment({year: 1990, month: 9, day: 8}).toDate(),
      input: 'this Monday'
    }, {
      output: moment({year: 1990, month: 9, day: 8}).toDate(),
      input: 'Monday'
    }, {
      output: moment({year: 1990, month: 9, day: 1}).toDate(),
      input: 'last Monday'
    }, {
      output: moment({year: 1990, month: 9, day: 9}).toDate(),
      input: 'the day before yesterday'
    }, {
      output: moment({year: 1990, month: 9, day: 13}).toDate(),
      input: 'the day after tomorrow'
    }, {
      output: moment({year: 1990, month: 1, day: 28}).toDate(),
      input: '2 weeks before 3/14'
    }, {
      output: moment({year: 2012, month: 1, day: 29}).toDate(), // leap year
      input: '2 weeks before 3/14/2012'
    }, {
      output: moment({year: 1990, month: 4, day: 2}).toDate(),
      input: '5/2'
    }, {
      output: moment({year: 2004, month: 4, day: 2}).toDate(),
      input: '5/2 in 2004'
    }, {
      output: moment({year: 2004, month: 4, day: 2}).toDate(),
      input: '5/2 in 04',
      suggestion: '5/2 in 2004'
    }, {
      output: moment({year: 2004, month: 4, day: 2}).toDate(),
      input: '5/2 in \'04'
    }, {
      output: moment({year: 1992, month: 4, day: 2}).toDate(),
      input: '5/2/92',
      suggestion:'5/2/1992'
    }, {
      output: moment({year: 2020, month: 4, day: 2}).toDate(),
      input: '5/2/20',
      suggestion: '5/2/2020'
    }, {
      output: moment({year: 1992, month: 4, day: 2}).toDate(),
      input: '5/2/1992'
    }, {
      output: moment({year: 1990, month: 4, day: 2}).toDate(),
      input: 'May 2nd'
    }, {
      output: moment({year: 1990, month: 4, day: 2}).toDate(),
      input: 'May 2'
    }, {
      output: moment({year: 1990, month: 4, day: 2}).toDate(),
      input: 'May 2nd, 1990'
    }, {
      output: moment({year: 1990, month: 4, day: 2}).toDate(),
      input: 'May 2, 1990'
    }]

    _.forEach(testCases, test)
  })

  describe('past={false}', () => {
    beforeEach(() => {
      parser.grammar = <DatePhrase past={false} />
    })

    const testCases = [{
      input: 'today',
      output: moment({year: 1990, month: 9, day: 11}).toDate()
    }, {
      input: 'tomorrow',
      output: moment({year: 1990, month: 9, day: 12}).toDate()
    }, {
      input: 'yesterday',
      length: 0
    }, {
      input: '4 days from today',
      output: moment({year: 1990, month: 9, day: 15}).toDate()
    }, {
      input: '4 days ago',
      length: 0
    }, {
      input: '4 days before tomorrow',
      length: 0
    }, {
      input: 'last year',
      length: 0,
    }, {
      input: 'next Monday',
      output: moment({year: 1990, month: 9, day: 15}).toDate()
    }, {
      input: 'this Monday',
      length: 0
    }, {
      input: 'Monday',
      output: moment({year: 1990, month: 9, day: 15}).toDate()
    }, {
      input: 'last Monday',
      length: 0,
    }, {
      input: '2 weeks before 3/14',
      output: moment({year: 1991, month: 1, day: 28}).toDate()
    }, {
      input: '2 weeks before 3/14/2012',
      output: moment({year: 2012, month: 1, day: 29}).toDate() // leap year
    }, {
      input: '5/2',
      output: moment({year: 1991, month: 4, day: 2}).toDate()
    }, {
      input: '5/2 in 2004',
      output: moment({year: 2004, month: 4, day: 2}).toDate()
    }, {
      input: '5/2 in 1989',
      length: 0
    }, {
      input: '5/2/92',
      suggestion:'5/2/1992',
      output: moment({year: 1992, month: 4, day: 2}).toDate()
    }, {
      input: '5/2/84',
      suggestion:'5/2/2084',
      output: moment({year: 2084, month: 4, day: 2}).toDate()
    }, {
      input: '5/2/20',
      suggestion: '5/2/2020',
      output: moment({year: 2020, month: 4, day: 2}).toDate()
    }, {
      input: '5/2/1992',
      output: moment({year: 1992, month: 4, day: 2}).toDate()
    }, {
      input: 'May 2nd',
      output: moment({year: 1991, month: 4, day: 2}).toDate()
    }, {
      input: 'November 2nd',
      output: moment({year: 1990, month: 10, day: 2}).toDate()
    }, {
      input: 'May 2, 1990',
      length: 0,
    }, {
      input: 'May 2, 1991',
      output: moment({year: 1991, month: 4, day: 2}).toDate()
    }]

    _.forEach(testCases, test)
  })
})
