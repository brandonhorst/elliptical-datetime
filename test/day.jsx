/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import {createElement, compile} from 'elliptical'
import { expect } from 'chai'
import lolex from 'lolex'
import { text } from './_util'
import { Day } from '../src/date'
import moment from 'moment'

describe('Day', () => {
  let parse
  let clock

  before(() => {
    clock = lolex.install(global, moment({year: 1990, month: 9, day: 11}).toDate())
  })

  after(() => {
    clock.uninstall()
  })

  describe('default', () => {
    beforeEach(() => {
      parse = compile(<Day />)
    })

    const testCases = [
      {output: {month: 4, day: 2}, input: '5/2'},
      {output: {month: 4, day: 2}, input: 'May 2nd'},
      {output: {month: 4, day: 2}, input: 'May 2'},
      {output: {month: 1, day: 28}, input: '2 weeks before 3/14'}
    ]

    _.forEach(testCases, ({input, output, suggestion, length = 1 }) => {
      it(input, () => {
        const data = _.filter(parse(input), output => !_.some(output.words, 'placeholder'))
        expect(data).to.have.length(length)
        if (length > 0) {
          expect(text(data[0])).to.equal(suggestion || input)
          expect(data[0].result).to.eql(output)
        }
      })
    })
  })

  describe('time of day', () => {
    // it('tomorrow morning'

  })
})
