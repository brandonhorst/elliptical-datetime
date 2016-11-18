/** @jsx createElement */
/* eslint-env mocha */

import _ from 'lodash'
import {createElement, compile} from 'elliptical'
import chai, { expect } from 'chai'
import chaiDateTime from 'chai-datetime'
import lolex from 'lolex'
import { text } from './_util'
import { Range } from '../src/range'
import moment from 'moment'

chai.use(chaiDateTime)

describe('Range', () => {
  let parse, clock

  function test({input, output, decorated, length = 1 }) {
    it(input, () => {
      const data = _.filter(parse(input), output => !_.some(output.words, 'placeholder'))
      // console.log(require('util').inspect(data, {depth: 999}))
      expect(data).to.have.length(length)
      if (length > 0) {
        expect(text(data[0])).to.equal(decorated || input)
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
      parse = compile(<Range />)
    })

    const testCases = [{
      input: 'today from 3pm to 6pm',
      decorated: 'today from 3:00pm to 6:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today from 3pm to 7am',
      decorated: 'today from 3:00pm to 7:00am',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 7}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 3pm for 3 hours',
      decorated: 'today at 3:00pm for 3 hours',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '3 hours today at 3pm',
      decorated: '3 hours today at 3:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '3pm to 6pm today',
      decorated: '3:00pm to 6:00pm today',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 3pm to tomorrow at 6pm',
      decorated: 'today at 3:00pm to tomorrow at 6:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today to tomorrow at 6pm',
      decorated: 'today to tomorrow at 6:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 6pm to tomorrow',
      decorated: 'today at 6:00pm to tomorrow',
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
      decorated: 'today at 6:00pm to tomorrow afternoon',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 12}).toDate(),
        allDay: false
      }
    }, {
      input: '6pm to 9pm',
      decorated: '6:00pm to 9:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '6pm-9pm',
      decorated: '6:00pm-9:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '6pm - 9pm',
      decorated: '6:00pm - 9:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Friday to 6p Saturday',
      decorated: '10:00a on Friday to 6:00p on Saturday',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 13, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Monday to 6p Wednesday',
      decorated: '10:00a on Monday to 6:00p on Wednesday',
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
      input: 'October 18',
      output: {
        start: moment({year: 1990, month: 9, day: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 18}).toDate(),
        allDay: true
      }
    }, {
      input: 'January 18',
      output: {
        start: moment({year: 1990, month: 0, day: 18}).toDate(),
        end: moment({year: 1990, month: 0, day: 18}).toDate(),
        allDay: true
      }
    }, {
      input: 'next Friday to Sunday',
      output: {
        start: moment({year: 1990, month: 9, day: 19}).toDate(),
        end: moment({year: 1990, month: 9, day: 21}).toDate(),
        allDay: true
      }
    }, {
      input: 'tomorrow at 8pm',
      decorated: 'tomorrow at 8:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8pm',
      decorated: '8:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8-9pm',
      decorated: '8:00-9:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8-21',
      decorated: '8:00-21:00',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8am-9pm',
      decorated: '8:00am-9:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: 'November 1-3',
      output: {
        start: moment({year: 1990, month: 10, day: 1, hour: 0}).toDate(),
        end: moment({year: 1990, month: 10, day: 3, hour: 0}).toDate(),
        allDay: true
      }
    }, {
      input: 'November 1st-3rd',
      output: {
        start: moment({year: 1990, month: 10, day: 1, hour: 0}).toDate(),
        end: moment({year: 1990, month: 10, day: 3, hour: 0}).toDate(),
        allDay: true
      }
    }, {
      input: 'January 1-3',
      output: {
        start: moment({year: 1990, month: 0, day: 1, hour: 0}).toDate(),
        end: moment({year: 1990, month: 0, day: 3, hour: 0}).toDate(),
        allDay: true
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
      parse = compile(<Range past={false} />)
    })

    const testCases = [{
      input: 'today from 3pm to 6pm',
      decorated: 'today from 3:00pm to 6:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today from 3pm to 7am',
      decorated: 'today from 3:00pm to 7:00am',
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
      decorated: '3:00am to 6:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 3}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '3pm to 6pm 11/20/2004',
      decorated: '3:00pm to 6:00pm on 11/20/2004',
      output: {
        start: moment({year: 2004, month: 10, day: 20, hour: 15}).toDate(),
        end: moment({year: 2004, month: 10, day: 20, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 6pm to tomorrow afternoon',
      decorated: 'today at 6:00pm to tomorrow afternoon',
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
      input: 'next Friday to Sunday',
      output: {
        start: moment({year: 1990, month: 9, day: 19}).toDate(),
        end: moment({year: 1990, month: 9, day: 21}).toDate(),
        allDay: true
      }
    }, {
      input: 'October 18',
      output: {
        start: moment({year: 1990, month: 9, day: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 18}).toDate(),
        allDay: true
      }
    }, {
      input: 'January 18',
      output: {
        start: moment({year: 1991, month: 0, day: 18}).toDate(),
        end: moment({year: 1991, month: 0, day: 18}).toDate(),
        allDay: true
      }
    }, {
      input: 'November 1-3',
      output: {
        start: moment({year: 1990, month: 10, day: 1, hour: 0}).toDate(),
        end: moment({year: 1990, month: 10, day: 3, hour: 0}).toDate(),
        allDay: true
      }
    }, {
      input: 'January 1-3',
      output: {
        start: moment({year: 1991, month: 0, day: 1, hour: 0}).toDate(),
        end: moment({year: 1991, month: 0, day: 3, hour: 0}).toDate(),
        allDay: true
      }
    }, {
      input: 'tomorrow at 8pm',
      decorated: 'tomorrow at 8:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8pm',
      decorated: '8:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 11, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8am',
      decorated: '8:00am',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 8}).toDate(),
        end: moment({year: 1990, month: 9, day: 12, hour: 9}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Friday to 6p Saturday',
      decorated: '10:00a on Friday to 6:00p on Saturday',
      output: {
        start: moment({year: 1990, month: 9, day: 12, hour: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 13, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Monday to 6p Wednesday',
      decorated: '10:00a on Monday to 6:00p on Wednesday',
      output: {
        start: moment({year: 1990, month: 9, day: 15, hour: 10}).toDate(),
        end: moment({year: 1990, month: 9, day: 17, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Friday to 6p Monday',
      decorated: '10:00a on Friday to 6:00p on Monday',
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
      parse = compile(<Range future={false} />)
    })

    const testCases = [{
      input: 'today from 3pm to 6pm',
      length: 0
    }, {
      input: '3pm to 7am',
      decorated: '3:00pm to 7:00am',
      output: {
        start: moment({year: 1990, month: 9, day: 10, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 11, hour: 7}).toDate(),
        allDay: false
      }
    }, {
      input: '3pm to 6pm',
      decorated: '3:00pm to 6:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 10, hour: 15}).toDate(),
        end: moment({year: 1990, month: 9, day: 10, hour: 18}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 8am for 3 hours',
      decorated: 'today at 8:00am for 3 hours',
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
      input: 'next Friday to Sunday',
      length: 0
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
      decorated: '8:00pm',
      output: {
        start: moment({year: 1990, month: 9, day: 10, hour: 20}).toDate(),
        end: moment({year: 1990, month: 9, day: 10, hour: 21}).toDate(),
        allDay: false
      }
    }, {
      input: '8am',
      decorated: '8:00am',
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

  describe('timezoneOffset', () => {
    beforeEach(() => {
      parse = compile(<Range timezoneOffset={420} />) // pdt
    })

    const testCases = [{
      input: 'today from 3pm to 6pm',
      decorated: 'today from 3:00pm to 6:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 11, hour: 22}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        allDay: false
      }
    }, {
      input: 'today from 3pm to 7am',
      decorated: 'today from 3:00pm to 7:00am',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 11, hour: 22}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 14}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 3pm for 3 hours',
      decorated: 'today at 3:00pm for 3 hours',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 11, hour: 22}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        allDay: false
      }
    }, {
      input: '3 hours today at 3pm',
      decorated: '3 hours today at 3:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 11, hour: 22}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        allDay: false
      }
    }, {
      input: '3pm to 6pm today',
      decorated: '3:00pm to 6:00pm today',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 11, hour: 22}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 3pm to tomorrow at 6pm',
      decorated: 'today at 3:00pm to tomorrow at 6:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 11, hour: 22}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 13, hour: 1}).toDate(),
        allDay: false
      }
    }, {
      input: 'today to tomorrow at 6pm',
      decorated: 'today to tomorrow at 6:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 11, hour: 15}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 13, hour: 1}).toDate(),
        allDay: false
      }
    }, {
      input: 'today at 6pm to tomorrow',
      decorated: 'today at 6:00pm to tomorrow',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 15}).toDate(),
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
      decorated: 'today at 6:00pm to tomorrow afternoon',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 19}).toDate(),
        allDay: false
      }
    }, {
      input: '6pm to 9pm',
      decorated: '6:00pm to 9:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 4}).toDate(),
        allDay: false
      }
    }, {
      input: '6pm-9pm',
      decorated: '6:00pm-9:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 4}).toDate(),
        allDay: false
      }
    }, {
      input: '6pm - 9pm',
      decorated: '6:00pm - 9:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 12, hour: 1}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 4}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Friday to 6p Saturday',
      decorated: '10:00a on Friday to 6:00p on Saturday',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 12, hour: 17}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 14, hour: 1}).toDate(),
        allDay: false
      }
    }, {
      input: '10a Monday to 6p Wednesday',
      decorated: '10:00a on Monday to 6:00p on Wednesday',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 8, hour: 17}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 11, hour: 1}).toDate(),
        allDay: false
      }
    }, {
      input: 'this afternoon to tomorrow evening',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 11, hour: 19}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 13, hour: 0}).toDate(),
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
        start: moment.utc({year: 1990, month: 9, day: 12, hour: 19}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 20}).toDate(),
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
      input: 'October 18',
      output: {
        start: moment({year: 1990, month: 9, day: 18}).toDate(),
        end: moment({year: 1990, month: 9, day: 18}).toDate(),
        allDay: true
      }
    }, {
      input: 'January 18',
      output: {
        start: moment({year: 1990, month: 0, day: 18}).toDate(),
        end: moment({year: 1990, month: 0, day: 18}).toDate(),
        allDay: true
      }
    }, {
      input: 'next Friday to Sunday',
      output: {
        start: moment({year: 1990, month: 9, day: 19}).toDate(),
        end: moment({year: 1990, month: 9, day: 21}).toDate(),
        allDay: true
      }
    }, {
      input: 'tomorrow at 8pm',
      decorated: 'tomorrow at 8:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 13, hour: 3}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 13, hour: 4}).toDate(),
        allDay: false
      }
    }, {
      input: '8pm',
      decorated: '8:00pm',
      output: {
        start: moment.utc({year: 1990, month: 9, day: 12, hour: 3}).toDate(),
        end: moment.utc({year: 1990, month: 9, day: 12, hour: 4}).toDate(),
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
})
