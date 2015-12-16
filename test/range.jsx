/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import lolex from 'lolex'
import { text } from './_util'
import { Range } from '..'
import moment from 'moment'
import { Parser } from 'lacona'

chai.use(chaiDateTime)

describe('Range', () => {
  let parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('default', () => {
    var clock

    beforeEach(() => {
      parser.grammar = <Range />
    })

    before(() => {
      clock = lolex.install(global, new Date(1990, 9, 11, 12))
    })

    after(() => {
      clock.uninstall()
    })

    const testCases = [{
      input: 'today from 3pm to 6pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today from 3pm to 7am',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 7}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 3pm for 3 hours',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '3 hours today at 3pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '3pm to 6pm today',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '3pm for 3 hours today',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 3pm to tomorrow at 6pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today to tomorrow at 6pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 6pm to tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 8}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 6pm to tomorrow afternoon',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 12}).toDate(),
        allDay: false
      }
    }, {
      input: 'this afternoon to tomorrow evening',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 12}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 17}).toDate(),
        allDay: false
      }
    }, {
      input: 'today to tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 11}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate(),
        allDay: true
      }
    }, {
      input: 'tomorrow to the day after tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 12}).toDate(),
        end: moment({year: 1990, month: 9, day: 13}).toDate(),
        allDay: true
      }
    }, {
      input: 'the day after tomorrow to tomorrow',
      length: 0
    }, {
      input: 'tomorrow to yesterday',
      length: 0
    }, {
      input: 'tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 12}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate(),
        allDay: true
      }
    }, {
      input: 'tomorrow at 8pm',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: 'all day today to all day tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 11}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate(),
        allDay: true
      }
    }, {
      input: 'today to all day tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 11}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate(),
        allDay: true
      }
    }, {
      input: 'all day today to tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 11}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate(),
        allDay: true
      }
    }]

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
