/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import {createElement, compile} from 'elliptical'
import { expect } from 'chai'
import { text } from './_util'
import { TimeDuration } from '../src/duration'

describe('TimeDuration', () => {
  let parse

  describe('defaults', () => {

    beforeEach(() => {
      parse = compile(<TimeDuration />)
    })

    const testCases = [
      {input: '1 minute', output: {minutes: 1}},
      {input: '3 minutes', output: {minutes: 3}},
      {input: '3 hours and 1 minute', output: {hours: 3, minutes: 1}},
      {input: '1 hour, 2 minutes, and 3 seconds', output: {hours: 1, minutes: 2, seconds: 3}},
      {input: '2 minutes and 3 minutes', length: 0}
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

  describe('seconds={false}', () => {
    beforeEach(() => {
      parse = compile(<TimeDuration seconds={false} />)
    })

    const testCases = [
      {input: '1 minute', output: {minutes: 1}},
      {input: '3 seconds', length: 0},
      {input: '4 minutes at 33 seconds', length: 0}
    ]

    _.forEach(testCases, ({input, output, length = 1 }) => {
      it(input, () => {
        const data = _.filter(parse(input), output => !_.some(output.words, 'placeholder'))
        expect(data).to.have.length(length)
        if (length > 0) {
          expect(text(data[0])).to.equal(input)
          expect(data[0].result).to.eql(output)
        }
      })
    })
  })
})
