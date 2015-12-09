/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import { text } from './_util'
import { Range } from '..'
import moment from 'moment'
import { Parser } from 'lacona'

chai.use(chaiDateTime)

describe('range', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('default', () => {

    beforeEach(() => {
      parser.grammar = <Range />
    })

    const testCases = [
      {output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).toDate()}, input: 'today from 3pm to 6pm'},
    ]

    _.forEach(testCases, ({input, output, length = 1 }) => {
      it(input, () => {
        const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
        expect(data).to.have.length(length)
        if (length > 0) {
          expect(text(data[0])).to.equal(input)
          expect(data[0].result.start).to.equalDate(output.start)
          expect(data[0].result.end).to.equalDate(output.end)
        }
      })
    })
  })
})
