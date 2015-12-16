/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { text } from './_util'
import { createElement, Phrase } from 'lacona-phrase'
import { expect } from 'chai'
import lolex from 'lolex'
import { Time } from '..'
import moment from 'moment'
import { Parser } from 'lacona'

function momentToTime (mom) {
  return {hour: mom.hour(), minutes: mom.minute()}
}

describe('Time', () => {
  let parser
  let clock

  const testCases = [{
    output: {hour: 12, minute: 0, second: 0},
    input: 'right now'
  }, {
    output: {hour: 12, minute: 0, second: 0},
    input: 'now'
  }, {
    output: {hour: 3, minute: 31, second: 0},
    input: '3:31 am'
  }, {
    output: {hour: 15, minute: 31, second: 0},
    input: '3:31 pm'
  }, {
    output: {hour: 15, minute: 0, second: 0},
    input: '3pm'
  }, {
    output: {hour: 15, minute: 0, second: 0},
    input: '3 in the afternoon'
  }, {
    output: {hour: 15, minute: 0, second: 0},
    input: '3:00 in the afternoon'
  }, {
    output: {hour: 0, minute: 0, second: 0},
    input: 'midnight'
  }, {
    output: {hour: 12, minute: 0, second: 0},
    input: 'noon'
  }, {
    output: {hour: 15, minute: 45, second: 0},
    input: 'quarter to 4pm'
  }, {
    output: {hour: 23, minute: 45, second: 0},
    input: 'quarter to midnight'
  }, {
    output: {hour: 15, minute: 30, second: 0},
    input: 'half past 3pm'
  }, {
    output: {hour: 15, minute: 50, second: 0},
    input: '10 til 4pm'
  }, {
    output: {hour: 15, minute: 50, second: 0},
    input: '10 minutes before 4pm'
  }, {
    output: {hour: 10, minute: 0, second: 0},
    input: '2 hours before noon'
  }, {
    output: {hour: 9, minute: 0, second: 0},
    input: '3 hours before now'
  }, {
    output: {hour: 12, minute: 1, second: 0},
    input: '1 minute after right now'
  }, {
    output: {hour: 15, minute: 0, second: 0},
    input: 'in 3 hours'
  }, {
    output: {hour: 11, minute: 57, second: 0},
    input: '3 minutes ago'
  }, {
    input: '2 minutes before 3 minutes ago',
    length: 0
  }]

  before(() => {
    clock = lolex.install(global, moment({hour: 12}).toDate())
  })

  after(() => {
    clock.uninstall()
  })

  beforeEach(() => {
    parser = new Parser()
    parser.grammar = <Time />
  })

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
