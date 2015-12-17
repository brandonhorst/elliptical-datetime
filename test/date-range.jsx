/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import lolex from 'lolex'
import moment from 'moment'
import { Parser } from 'lacona'

import { text } from './_util'
import { DateRange } from '..'

chai.use(chaiDateTime)

describe('DateRange', () => {
  let parser, clock

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
      parser.grammar = <DateRange />
    })

    const testCases = [{
      input: 'today to tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 11}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate()
      }
    }, {
      input: 'yesterday to tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate()
      }
    }, {
      input: '2 days before yesterday to the day before yesterday',
      output: {
        start: moment({year: 1990, month: 9, day: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 9}).toDate(),
      }
    }, {
      input: 'tomorrow for 3 days',
      output: {
        start: moment({year: 1990, month: 9, day: 12}).toDate(),
        end: moment({year: 1990, month: 9, day: 15}).toDate()
      }
    }]

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
