/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { text } from './_util'
import { createElement, Phrase } from 'lacona-phrase'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import { Time } from '..'
import moment from 'moment'
import { Parser } from 'lacona'

chai.use(chaiDateTime)
chai.config.includeStack = true

describe('time', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
    parser.grammar = <Time />
  })

  const testCases = [
    {output: moment({hours: 3, minutes: 31}).toDate(), input: '3:31 am'},
    {output: moment({hours: 15, minutes: 31}).toDate(), input: '3:31 pm'},
    {output: moment({hours: 15}).toDate(), input: '3pm'},
    {output: moment({hours: 0}).toDate(), input: 'midnight'},
    {output: moment({hours: 12}).toDate(), input: 'noon'},
    {output: moment({hours: 15, minutes: 45}).toDate(), input: 'quarter to 4pm'},
    {output: moment({hours: 23, minutes: 45}).toDate(), input: 'quarter to midnight'},
    {output: moment({hours: 15, minutes: 30}).toDate(), input: 'half past 3pm'},
    {output: moment({hours: 15, minutes: 50}).toDate(), input: '10 til 4pm'},
    {output: moment({hours: 10}).toDate(), input: '2 hours before noon'},
    {output: moment().seconds(0).milliseconds(0).add({hours: 3}).toDate(), input: 'in 3 hours'},
    {output: moment().seconds(0).milliseconds(0).subtract({minutes: 3}).toDate(), input: '3 minutes ago'},
    {input: '2 minutes before 3 minutes ago', length: 0}
  ]

  _.forEach(testCases, ({input, output, length = 1 }) => {
    it(input, () => {
      const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
      expect(data).to.have.length(length)
      if (length > 1) {
        expect(text(data[0])).to.equal(input)
        expect(data[0].result).to.equalTime(output)
      }
    })
  })
})
