/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { createElement, compile } from 'elliptical'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import lolex from 'lolex'
import moment from 'moment'

import { text } from './_util'
import { DateRange } from '../src/date-range'

chai.use(chaiDateTime)

describe.skip('DateRange', () => {
  let parse, clock

  before(() => {
    clock = lolex.install(global, moment({year: 1990, month: 9, day: 11}).toDate())
  })

  after(() => {
    clock.uninstall()
  })

  describe('default', () => {
    beforeEach(() => {
      parse = compile(<DateRange />)
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
        const data = _.filter(parse(input), output => !_.some(output.words, 'placeholder'))
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
