/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import { createElement, Phrase } from 'lacona-phrase'

import { DatePhrase } from './date'
import { DateTime } from './datetime'
import { Duration, TimeDuration, DateDuration } from './duration'
import { Time } from './time'

function join (date, time) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds())
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

function dateDiffInDays (a, b) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())

  return Math.floor((utc2 - utc1) / MS_PER_DAY)
}

export class TimeRange extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.duration) {
      const endDate = moment(result.start).add(moment.duration(result.duration)).toDate()
      return {start: result.start, end: endDate}
    }

    return result
  }

  describe () {
    return (
      <choice>
        <sequence>
          <Time id='start' />
          <list items={[' to ', ' - ', '-']} limit={1} />
          <Time id='end' />
        </sequence>
        <sequence>
          <Time id='start' />
          <literal text=' for ' />
          <TimeDuration id='duration' />
        </sequence>
      </choice>
    )
  }
}

export class Range extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.startdatetime) {
      if (result.enddatetime) {
        return {
          start: result.startdatetime,
          end: result.enddatetime
        }
      } else if (result.endtime) {
        return {
          start: result.startdatetime,
          end: join(result.startdatetime, result.endtime)
        }
      } else if (result.duration) {
        return {
          start: result.startdatetime,
          end: moment(result.startdatetime).add(result.duration)
        }
      } else {
        return {
          start: result.startdatetime
        }
      }
    } else if (result.startdate) {
      return {
        start: result.startdate,
        end: result.enddate,
        allday: true
      }
    } else if (result.date) {
      if (result.starttime && result.endtime) {
        return {
          start: join(result.date, result.starttime),
          end: join(result.date, result.endtime)
        }
      }
    }
  }

  describe () {
    return (
      <placeholder text='period of time'>
        <choice>
          <sequence>
            <DateTime id='startdatetime' />
            <list items={[' to ', ' - ', '-']} limit={1} />
            <choice merge={true}>
              <Time id='endtime' />
              <DateTime id='enddatetime' />
            </choice>
          </sequence>
          <sequence>
            <DatePhrase id='date' />
            <literal text=' ' />
            <Time id='starttime' />
            <list items={[' to ', ' - ', '-']} limit={1} />
            <Time id='endtime' />
          </sequence>
          <sequence>
            <Time id='starttime' />
            <list items={[' to ', ' - ', '-']} limit={1} />
            <Time id='endtime' />
            <literal text=' ' />
            <DatePhrase id='date' />
          </sequence>
          <sequence>
            <literal text='from ' optional={true} limited={true} preferred={false} />
            <DatePhrase id='startdate' />
            <list items={[' to ', ' - ', '-']} limit={1} />
            <DatePhrase id='enddate' />
          </sequence>
          <sequence>
            <argument text='duration' id='duration'>
              <choice>
                <TimeDuration />
                <DateDuration />
              </choice>
            </argument>
            <literal text=' at ' />
            <DateTime id='startdatetime' />
          </sequence>
          <sequence>
            <DateTime id='startdatetime' />
            <literal text=' for ' />
            <argument text='duration' id='duration'>
              <choice>
                <TimeDuration />
                <DateDuration />
              </choice>
            </argument>
          </sequence>
        </choice>
      </placeholder>
    )
  }
}

Range.defaultProps = {
  prepositions: false
}
