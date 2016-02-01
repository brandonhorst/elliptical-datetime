/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { expect } from 'chai'
import { text } from './_util'
import { TimeRange } from '..'
import moment from 'moment-timezone'
import { Parser } from 'lacona'

describe('TimeRange', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('default', () => {
    beforeEach(() => {
      parser.grammar = <TimeRange />
    })

    const testCases = [{
      input: '3pm to 6pm',
      output: {
        start: {hour: 15, minute: 0, second: 0},
        end: {hour: 18, minute: 0, second: 0},
        dayOffset: 0
      }
    }, {
      input: '3pm for 3 hours',
      output: {
        start: {hour: 15, minute: 0, second: 0},
        end: {hour: 18, minute: 0, second: 0},
        dayOffset: 0
      }
    }, {
      input: '10pm for 3 hours',
      output: {
        start: {hour: 22, minute: 0, second: 0},
        end: {hour: 1, minute: 0, second: 0},
        dayOffset: 1
      }
    }, {
      input: '10pm to 1am',
      output: {
        start: {hour: 22, minute: 0, second: 0},
        end: {hour: 1, minute: 0, second: 0},
        dayOffset: 1
      }
    }, {
      input: '8:30am for 3 hours and 34 minutes',
      output: {
        start: {hour: 8, minute: 30, second: 0},
        end: {hour: 12, minute: 4, second: 0},
        dayOffset: 0
      }
    }]

    _.forEach(testCases, ({input, output, length = 1 }) => {
      it(input, () => {
        const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
        expect(data).to.have.length(length)
        if (length > 0) {
          expect(text(data[0])).to.equal(input)
          expect(data[0].result).to.eql(output)
        }
      })
    })
  })
})
