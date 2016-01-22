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
  let parser, clock

  beforeEach(() => {
    parser = new Parser()
  })

  function test({input, output, length = 1, suggestion }) {
    it(input, () => {
      const data = _.filter(parser.parseArray(input), output => !_.some(output.words, 'placeholder'))
      expect(data).to.have.length(length)
      if (length > 0) {
        expect(text(data[0])).to.equal(suggestion || input)
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
  }

  before(() => {
    clock = lolex.install(global, new Date(1990, 9, 11, 12))
  })

  after(() => {
    clock.uninstall()
  })

  describe('default', () => {
    beforeEach(() => {
      parser.grammar = <Range />
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
      input: '2 days before yesterday to the day before yesterday',
      output: {
        start: moment({year: 1990, month: 9, day: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 9}).toDate(),
        allDay: true
      }
    }, {
      input: 'today at 6pm to tomorrow afternoon',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 12}).toDate(),
        allDay: false
      }
    }, {
      input: '6pm to 9pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Friday to 6p Saturday',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 13, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Monday to 6p Wednesday',
      output: {
        start: moment({year: 1990, month: 9, day: 8, hour: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 10, hour: 18}).toDate(),
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
      input: 'tomorrow afternoon',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 12}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 13}).toDate(),
        allDay: false
      }
    }, {
      input: 'all day tomorrow',
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

    _.forEach(testCases, test)
  })

  describe('past={false}', () => {
    beforeEach(() => {
      parser.grammar = <Range past={false} />
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
      input: 'today at 8am for 3 hours',
      length: 0,
    }, {
      input: 'today at 8am for 5 hours',
      length: 0,
    }, {
      input: '3am to 6pm',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 3}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '3pm to 6pm 11/20/2004',
      output: {
        start: moment({year: 2004, month: 10, day: 20, hour: 15}).toDate(),
        end: moment({year: 2004, month: 10, day: 20, hour: 18}).toDate(),
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
      input: 'this morning to tomorrow evening',
      length: 0
    }, {
      input: 'today to tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 11}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate(),
        allDay: true
      }
    }, {
      input: 'yesterday to tomorrow',
      length: 0
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
      input: 'yesterday',
      length: 0
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
      input: '8am',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 9}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Friday to 6p Saturday',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 13, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Monday to 6p Wednesday',
      output: {
        start: moment({year: 1990, month: 9, day: 15, hour: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 17, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Friday to 6p Monday',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 15, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'all day today to all day tomorrow',
      output: {
        start: moment({year: 1990, month: 9, day: 11}).toDate(),
        end: moment({year: 1990, month: 9, day: 12}).toDate(),
        allDay: true
      }
    }]

    _.forEach(testCases, test)
  })

  describe('future={false}', () => {
    var clock

    beforeEach(() => {
      parser.grammar = <Range future={false} />
    })

    const testCases = [{
      input: 'today from 3pm to 6pm',
      length: 0
    }, {
      input: '3pm to 7am',
      output: {
        start: moment({year: 1990, month: 9, day: 10, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 7}).toDate(),
        allDay: false
      }
    }, {
      input: '3pm to 6pm',
      output: {
        start: moment({year: 1990, month: 9, day: 10, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 10, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 8am for 3 hours',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 11}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 8am for 5 hours',
      length: 0,
    }, {
      input: 'today at 6pm to tomorrow afternoon',
      length: 0
    }, {
      input: 'yesterday afternoon to this morning',
      output: {
        start: moment({year: 1990, month: 9, day: 10, hour: 12}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 8}).toDate(),
        allDay: false
      }
    }, {
      input: 'this morning to tomorrow evening',
      length: 0
    }, {
      input: 'today to tomorrow',
      length: 0
    }, {
      input: 'yesterday to tomorrow',
      length: 0
    }, {
      input: 'yesterday to today',
      output: {
        start: moment({year: 1990, month: 9, day: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 11}).toDate(),
        allDay: true
      }
    }, {
      input: '2 days before yesterday to the day before yesterday',
      output: {
        start: moment({year: 1990, month: 9, day: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 9}).toDate(),
        allDay: true
      }
    }, {
      input: 'tomorrow to yesterday',
      length: 0
    }, {
      input: 'today to yesterday',
      length: 0
    }, {
      input: 'tomorrow',
      length: 0
    }, {
      input: 'yesterday',
      output: {
        start: moment({year: 1990, month: 9, day: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 10}).toDate(),
        allDay: true
      }
    }, {
      input: 'tomorrow at 8pm',
      length: 0
    }, {
      input: '8pm',
      output: {
        start: moment({year: 1990, month: 9, day: 10, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 10, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8am',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 9}).toDate(),
        allDay: false
      }
    }, {
      input: 'all day yesterday to all day today',
      output: {
        start: moment({year: 1990, month: 9, day: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 11}).toDate(),
        allDay: true
      }
    }]

    _.forEach(testCases, test)
  })
})
