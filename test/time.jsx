/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { text } from './_util'
import {createElement, compile} from 'elliptical'
import { expect } from 'chai'
import lolex from 'lolex'
import { Time } from '../src'
import moment from 'moment'

function momentToTime (mom) {
  return {hour: mom.hour(), minutes: mom.minute()}
}

describe('Time', () => {
  let parse
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
    output: {hour: 15, minute: 0, second: 0},
    input: '15'
  }, {
    output: {hour: 15, minute: 30, second: 0},
    input: 'half past 15'
  }, {
    output: {hour: 15, minute: 20, second: 0},
    input: '15:20'
  }, {
    output: {hour: 0, minute: 0, second: 0},
    input: '24'
  }, {
    input: '24:01',
    length: 0
  }, {
    input: '15pm',
    length: 0
  }, {
    input: '0:34',
    output: {hour: 0, minute: 34, second: 0}
  }, {
    input: '0:34pm',
    length: 0
  }, {
    output: {hour: 21, minute: 0, second: 0},
    input: '9pm'
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
    parse = compile(<Time />)
  })

  _.forEach(testCases, ({input, output, length = 1 }) => {
    it(input, () => {
      const data = _.filter(parse(input), output => !_.some(output.words, 'placeholder'))
      // console.log(require('util').inspect(data, {depth: 999}))
      expect(data).to.have.length(length)
      if (length > 0) {
        expect(text(data[0])).to.equal(input)
        expect(data[0].result).to.eql(output)
      }
    })
  })
})

