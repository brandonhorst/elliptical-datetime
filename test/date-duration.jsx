/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { expect } from 'chai'
import { text } from './_util'
import { DateDuration } from '../src/duration'
import { createElement, compile } from 'elliptical'

describe('DateDuration', () => {
  let parse

  beforeEach(() => {
    parse = compile(<DateDuration />)
  })

  const testCases = [
    {input: '1 day', output: {days: 1}},
    {input: '3 days', output: {days: 3}},
    {input: '1 week', output: {days: 7}},
    {input: '3 weeks', output: {days: 21}},
    {input: '1 year', output: {years: 1}},
    {input: '3 years', output: {years: 3}},
    {input: '1 month', output: {months: 1}},
    {input: '3 months', output: {months: 3}},
    {input: '2 years and 1 month', output: {years: 2, months: 1}},
    {input: '1 year and 11 months', output: {years: 1, months: 11}},
    {input: '2 years, 6 months, and 1 day', output: {years: 2, months: 6, days: 1}},
    {input: '2 years, 6 months, and 2 weeks', output: {years: 2, months: 6, days: 14}},
    {input: '3 weeks and 4 days', output: {days: 25}},
    {input: '2 weeks and 3 years', output: {years: 3, days: 14}},
    {input: '2 years and 3 years', length: 0}
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
