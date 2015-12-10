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

// const MS_PER_DAY = 1000 * 60 * 60 * 24
//
// function dateDiffInDays (a, b) {
//   // Discard the time and time-zone information.
//   const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
//   const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
//
//   return Math.floor((utc2 - utc1) / MS_PER_DAY)
// }

export class TimeRange extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.duration) {
      const end = moment(result.start).add(moment.duration(result.duration)).toDate()
      return {start: result.start, end: end}
    }

    return result
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
            <TimeDuration id='duration' />
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
        return result
      } else if (result.duration) {
        return {
          start: result.start,
          end: moment(result.start).add(result.duration).toDate()
        }
      } else if (result.timeRange) {
        return {
          start: join(result.start, result.timeRange.start),
          end: join(result.start, result.timeRange.end)
        }
      }
    }
  }

  describe () {
    return (
      <placeholder text='period of time'>
        <choice>
          <sequence>
            {this.props.prepositions ? <literal text='from ' optional={true} limited={true} preferred={false} /> : null}
            <DateTime id='start' impliedDate={false} impliedTime={false} />
            <list items={[' to ', ' - ', '-']} limit={1} />
            <DateTime id='end' impliedDate={false} impliedTime={false} />
          </sequence>

          <sequence>
            <DatePhrase id='start' prepositions={this.props.prepositions} />
            <literal text=' ' />
            <TimeRange id='timeRange' duration={false} prepositions />
          </sequence>

          <sequence>
            <TimeRange id='timeRange' prepositions={this.props.prepositions} />
            <literal text=' ' />
            <DatePhrase id='start' prepositions />
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
