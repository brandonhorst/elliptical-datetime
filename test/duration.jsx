/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import {createElement, compile} from 'elliptical'
import {expect} from 'chai'
import {text} from './_util'
import {Duration} from '../src/duration'

describe('Duration', () => {
  let parse

  describe('defaults', () => {
    beforeEach(() => {
      parse = compile(<Duration />)
    })

    const testCases = [
      {input: '1 year and 1 minute', output: {years: 1, minutes: 1}},
      {input: '3 months, 2 weeks', output: {months: 3, days: 14}},
    ]

    _.forEach(testCases, ({input, output, length = 1 }) => {
      it(input, () => {
        const data = _.filter(parse(input), output => !_.some(output.words, 'placeholder'))
        expect(data).to.have.length(length)
        if (length > 1) {
          expect(text(data[0])).to.equal(input)
          expect(data[0].result).to.equalDate(output)
        }
      })
    })
  })
})
