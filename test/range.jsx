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
      {input: 'today from 3pm to 6pm', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).toDate()}, allDay: false},
      {input: 'today from 3pm to 7am', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 7}).add(1, 'days').toDate()}, allDay: false},
      {input: 'today at 3pm for 3 hours', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).toDate()}, allDay: false},
      {input: '3 hours today at 3pm', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).toDate()}, allDay: false},
      {input: '3pm to 6pm today', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).toDate()}, allDay: false},
      {input: '3pm for 3 hours today', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).toDate()}, allDay: false},
      {input: 'today at 3pm to tomorrow at 6pm', output: {start: moment({hour: 15}).toDate(), end: moment({hour: 18}).add(1, 'days').toDate()}, allDay: false},
      {input: 'today to tomorrow at 6pm', output: {start: moment({hour: 8}).toDate(), end: moment({hour: 18}).add(1, 'days').toDate()}, allDay: false},
      {input: 'today at 6pm to tomorrow', output: {start: moment({hour: 18}).toDate(), end: moment({hour: 8}).add(1, 'days').toDate()}, allDay: false},
      {input: 'today at 6pm to tomorrow afternoon', output: {start: moment({hour: 18}).toDate(), end: moment({hour: 12}).add(1, 'days').toDate()}, allDay: false},
      {input: 'this afternoon to tomorrow evening', output: {start: moment({hour: 12}).toDate(), end: moment({hour: 17}).add(1, 'days').toDate()}, allDay: false},
      {input: 'today to tomorrow', output: {start: moment().toDate(), end: moment().add(1, 'days').toDate(), allDay: true}},
      {input: 'all day today to all day tomorrow', output: {start: moment().toDate(), end: moment().add(1, 'days').toDate(), allDay: true}},
      {input: 'today to all day tomorrow', output: {start: moment().toDate(), end: moment().add(1, 'days').toDate(), allDay: true}},
      {input: 'all day today to tomorrow', output: {start: moment().toDate(), end: moment().add(1, 'days').toDate(), allDay: true}}
    ]

    _.forEach(testCases, ({input, output, length = 1 }) => {
      it(input, () => {
        const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
        // console.log(require('util').inspect(data, {depth: 3}))
        expect(data).to.have.length(length)
        if (length > 0) {
          expect(text(data[0])).to.equal(input)
          if (output.allDay) {
            expect(data[0].result.start).to.equalDate(output.start)
            expect(data[0].result.end).to.equalDate(output.end)
            expect(data[0].result.allDay).to.be.true
          } else {
            expect(data[0].result.start).to.equalTime(output.start)
            expect(data[0].result.end).to.equalTime(output.end)
            expect(data[0].result.allDay).to.be.false
          }
        }
      })
    })
  })
})
