/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import { createElement, Phrase } from 'lacona-phrase'

import { DatePhrase } from './date'
import { DateTime } from './datetime'
import { Duration, TimeDuration, DateDuration } from './duration'
import { Time } from './time'

function join (date, time) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds(), 0)
}

export class TimeRange extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.start && result.duration) {
      const end = moment(result.start).add(moment.duration(result.duration)).toDate()
      return {start: result.start, end: end}
    }

    if (result.start && result.end) {
      return result
    }
  }

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
          end: moment(result.start).add(result.duration).toDate(),
          allDay: false
        }
      } else {
        return {
          start: result.start,
          end: moment(result.start).add(1, 'hours').toDate(),
          allDay: false
        }
      }
    } else if (result.date && result.timeRange) {
      if (moment(result.timeRange.end).isBefore(result.timeRange.start)) {
        return {
          start: join(result.date, result.timeRange.start),
          end: join(moment(result.date).add(1, 'days').toDate(), result.timeRange.end),
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
    if (!result || !result.start || !result.end) return

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
          <DatePhrase id='startDate' />

          <DateTime id='start' impliedTime={false} />

          <choice limit={1}>
            <sequence> {/* today to tomorrow */}
              {this.props.prepositions ? <literal text='from ' optional={true} limited={true} preferred={false} /> : null}
              <literal text='all day ' optional={true} limited={true} preferred={false} />
              <DatePhrase id='startDate' />
              <list items={[' to ', ' - ', '-']} limit={1} />
              <literal text='all day ' optional={true} limited={true} preferred={false} />
              <DatePhrase id='endDate' />
            </sequence>

            <sequence> {/* today at 3pm to tomorrow */}
              {this.props.prepositions ? <literal text='from ' optional={true} limited={true} preferred={false} /> : null}
              <DateTime id='start' impliedDate={false} />
              <list items={[' to ', ' - ', '-']} limit={1} />
              <DateTime id='end' impliedDate={false} />
            </sequence>
          </choice>

          <sequence>
            <DatePhrase id='date' prepositions={this.props.prepositions} />
            <literal text=' ' />
            <TimeRange id='timeRange' duration={false} prepositions />
          </sequence>

          <sequence>
            <TimeRange id='timeRange' prepositions={this.props.prepositions} />
            <literal text=' ' />
            <DatePhrase id='date' prepositions />
          </sequence>

          <sequence>
            {this.props.prepositions ? <literal text='for ' optional={true} limited={true} preferred={false} /> : null}
            <Duration id='duration' seconds={this.props.seconds} />
            <literal text=' ' />
            <DateTime id='start' prepositions />
          </sequence>

          <sequence>
            <DateTime id='start' prepositions={this.props.prepositions} />
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
  seconds: true
}
