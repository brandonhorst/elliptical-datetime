/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import { createElement, Phrase } from 'lacona-phrase'

import { Date } from './date'
import { DateTime } from './datetime'
import { Duration, TimeDuration, DateDuration } from './duration'
import { Time } from './time'
import { join, timeIsBefore } from './helpers'

export class TimeRange extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.start && result.duration) {
      const startDate = moment.utc(result.start)
      const endDate = startDate.add(moment.duration(result.duration))
      const dayOffset = endDate.diff(startDate, 'days')
      const end = {hour: endDate.hour(), minute: endDate.minute(), second: endDate.second()}
      return {start: result.start, end, dayOffset}
    }

    if (result.start && result.end) {
      return result
    }
  }

  // validate (result) {
  //   if (!result || !result.start || !result.end || result.dayOffset == null) return true
  //
  //   if (result.dayOffset > 0) return true
  //
  //   const startMoment = moment.utc(result.start)
  //   return startMoment.isBefore(moment.utc(result.end))
  // }

  describe () {
    return (
      <choice>
        <sequence>
          {this.props.prepositions ? <literal text='from ' /> : null}
          <Time id='start' />
          <list items={[' to ', ' - ', '-']} limit={1} />
          <Time id='end' />
        </sequence>
        {this.props.duration ?
          <sequence>
            <Time id='start' prepositions={this.props.prepositions} />
            <literal text=' for ' />
            <TimeDuration id='duration' max={{hours: 23, minutes: 59, seconds: 59}} />
          </sequence>
        : null}
      </choice>
    )
  }
}

TimeRange.defaultProps = {
  prepositions: false,
  duration: true
}

export class Range extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.start) {
      if (result.end) {
        return {
          start: result.start,
          end: result.end,
          allDay: false
        }
      } else if (result.duration) {
        return {
          start: result.start,
          end: moment(result.start).add(moment.duration(result.duration)).toDate(),
          allDay: false
        }
      } else {
        return {
          start: result.start,
          end: moment(result.start).add(moment.duration(this.props.defaultDuration)).toDate(),
          allDay: false
        }
      }
    } else if (result.date && result.timeRange) {
      if (timeIsBefore(result.timeRange.end, result.timeRange.start)) {
        return {
          start: join(result.date, result.timeRange.start),
          end: join(moment(result.date).add(1, 'day').toDate(), result.timeRange.end),
          allDay: false
        }
      } else {
        return {
          start: join(result.date, result.timeRange.start),
          end: join(result.date, result.timeRange.end),
          allDay: false
        }
      }
    } else if (result.startDate) {
      if (result.endDate) {
        return {
          start: result.startDate,
          end: result.endDate,
          allDay: true
        }
      } else {
        return {
          start: result.startDate,
          end: result.startDate,
          allDay: true
        }
      }
    }
  }

  validate (result) {
    if (!result || !result.start || !result.end) return true

    const startMoment = moment(result.start)
    if (result.allDay) {
      return startMoment.isBefore(result.end) || startMoment.isSame(result.end)
    } else {
      return startMoment.isBefore(result.end)
    }
  }

  describe () {
    return (
      <placeholder text='period of time'>
        <choice>
          <Date id='startDate' />

          <DateTime id='start' _impliedTime={false} defaultTime={this.props.defaultTime} />

          <choice limit={1}>
            <sequence> {/* today to tomorrow */}
              {this.props.prepositions ? <literal text='from ' optional={true} limited={true} preferred={false} /> : null}
              <literal text='all day ' optional={true} limited={true} preferred={false} />
              <Date id='startDate' />
              <list items={[' to ', ' - ', '-']} limit={1} />
              <literal text='all day ' optional={true} limited={true} preferred={false} />
              <Date id='endDate' />
            </sequence>

            <sequence> {/* today at 3pm to tomorrow */}
              {this.props.prepositions ? <literal text='from ' optional={true} limited={true} preferred={false} /> : null}
              <DateTime id='start' _impliedDate={false} defaultTime={this.props.defaultTime} />
              <list items={[' to ', ' - ', '-']} limit={1} />
              <DateTime id='end' _impliedDate={false} defaultTime={this.props.defaultTime} />
            </sequence>
          </choice>

          <sequence>
            <Date id='date' prepositions={this.props.prepositions} />
            <literal text=' ' />
            <TimeRange id='timeRange' duration={false} prepositions />
          </sequence>

          <sequence>
            <TimeRange id='timeRange' prepositions={this.props.prepositions} />
            <literal text=' ' />
            <Date id='date' prepositions />
          </sequence>

          <sequence>
            {this.props.prepositions ? <literal text='for ' optional={true} limited={true} preferred={false} /> : null}
            <Duration id='duration' seconds={this.props.seconds} />
            <literal text=' ' />
            <DateTime id='start' prepositions defaultTime={this.props.defaultTime} />
          </sequence>

          <sequence>
            <DateTime id='start' prepositions={this.props.prepositions} defaultTime={this.props.defaultTime} />
            <literal text=' for ' />
            <Duration id='duration' seconds={this.props.seconds} />
          </sequence>
        </choice>
      </placeholder>
    )
  }
}

Range.defaultProps = {
  prepositions: false,
  seconds: true,
  defaultTime: {hour: 8},
  defaultDuration: {hours: 1},
  future: true,
  past: true
}
