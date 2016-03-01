/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import { createElement, Phrase } from 'lacona-phrase'

import { join, relativeDate, possibleDates } from './helpers'
import { DateTime, InternalDateTime } from './datetime'
import { Duration } from './duration'

class TrueDateTime extends Phrase {
  describe () {
    return (
      <sequence>
        <literal text='all day ' id='allDay' value optional limited />

        <choice merge>
          <InternalDateTime {...this.props} id={undefined} />
          <map function={(result) => ({dateTime: result})}>
            <DateTime {...this.props} nullify />
          </map>
        </choice>
      </sequence>
    )
  }
}

export class Range extends Phrase {
  validate (result) {
    const startMoment = moment(result.start)
    const endMoment = moment(result.end)

    if (endMoment.isBefore(startMoment)) return false

    const currentMoment = result.allDay ? moment({}) : moment()
    if (!this.props.past && currentMoment.isAfter(startMoment)) return false
    if (!this.props.future && currentMoment.isBefore(endMoment)) return false

    return true
  }

  * getValues (result) {
    if (result.start && result.end) {
      if (!result.start.time && !result.end.time) {
        for (let startDate of possibleDates(result.start)) {
          for (let endDate of possibleDates(result.end)) {
            yield {
              start: join(startDate, {hour: 0, minute: 0, second: 0}, this.props.timezoneOffset),
              end: join(endDate, {hour: 0, minute: 0, second: 0}, this.props.timezoneOffset),
              allDay: true
            }
          }
        }
      } else {
        for (let startDate of possibleDates(result.start, result.end.date)) {
          for (let endDate of possibleDates(result.end, startDate)) {
            yield {
              start: join(startDate, result.start.time || this.props.defaultTime, this.props.timezoneOffset),
              end: join(endDate, result.end.time || this.props.defaultTime, this.props.timezoneOffset),
              allDay: false
            }
          }
        }
      }
    } else if (result.start && result.duration) {
      for (let startDate of possibleDates(result.start)) {
        const start = join(startDate, result.start.time || this.props.defaultTime, this.props.timezoneOffset)
        yield {
          start,
          end: moment(start).add(result.duration).toDate(),
          allDay: false
        }
      }
    } else if (result.start) {
      if (!result.start.time) {
        for (let startDate of possibleDates(result.start)) {
          yield {
            start: startDate,
            end: startDate,
            allDay: true
          }
        }
      } else {
        for (let startDate of possibleDates(result.start)) {
          const start = join(startDate, result.start.time, this.props.timezoneOffset)
          yield {
            start: start,
            end: moment(start).add(this.props.defaultDuration).toDate(),
            allDay: false
          }
        }
      }
    }
  }

  filter (result) {
    if (result.allDay && (!result.start._ambiguousTime || (result.end && !result.end._ambiguousTime))) {
      return false
    }

    return true
  }

  /*
    Monday                           D       Monday all day

    Monday at 3pm                    DT      Monday at 3pm to Monday at 4pm
    3pm                              TD      today at 3pm to today at 4pm

    Monday to Tuesday                D  D    Monday to Tuesday all day

    ---
    Monday at 3pm to Tuesday at 4pm  DT DT   3pm Monday to 4pm Tuesday
    3pm Monday to 4pm Tuesday        DT DT   3pm Monday to 4pm Tuesday
    3pm Monday to Tuesday at 4pm     DT DT   3pm Monday to 4pm Tuesday
    Monday at 3pm to 4pm Tuesday     DT DT   3pm Monday to 4pm Tuesday

    Monday to Tuesday at 4pm         DT DT   8am Monday to 4pm Tuesday
    Monday to 4pm Tuesday            DT DT   8am Monday to 4pm Tuesday

    Monday at 3pm to Tuesday         DT DT   3pm Monday to 8am Tuesday
    3pm Monday to Tuesday            DT DT   3pm Monday to 8am Tuesday

    3pm to Tuesday at 4pm            DT DT   3pm today to 4pm Tuesday
    3pm to 4pm Tuesday               T  DT   3pm Tuesday to 4pm Tuesday

    Monday at 3pm to 4pm             DT T    3pm Monday to 4pm Monday
    3pm Monday to 4pm                DT T    3pm Monday to 4pm Monday

    3pm to 4pm                       T  T    3pm today to 4pm today
    ---

    ---
    Monday from 3pm to 4pm           D  TR   3pm Monday to 4pm Monday
    3pm to 4pm Monday                TR D    3pm Monday to 4pm Monday
    ---

    Monday at 3pm for 4 hours        DT Du   3pm Monday to 7pm Monday
    3pm Monday for 4 hours           DT Du   3pm Monday to 7pm Monday
    4 hours Monday at 3pm            Du DT   3pm Monday to 7pm Monday
    4 hours 3pm Monday               Du DT   3pm Monday to 7pm Monday

    3pm for 4 hours                  DT Du   3pm today to 7pm today
    4 hours at 3pm                   Du DT   3pm today to 7pm today
    Monday for 4 hours               DT Du   8am Monday to 12pm today
    4 hours on Monday                DT Du   8am Monday to 12pm today
  */

  describe () {
    return (
      <label argument={false} text={this.props.argument}>
        <map iteratorFunction={this.getValues.bind(this)} limit={1}>
          <filter function={this.filter}>
            <sequence unique>
              <sequence id='duration' optional limited>
                {this.props.prepositions ? <literal text='for ' optional limited preferred /> : null}
                <Duration merge />
                <list items={[' ', ' starting ']} limit={1} />
              </sequence>

              <TrueDateTime ellipsis id='start' />

              <choice merge>
                <sequence id='end'>
                  <list items={[' to ', ' - ', '-']} limit={1} category='conjunction' />

                  <TrueDateTime merge />
                </sequence>

                <sequence id='duration'>
                  <literal text=' for ' />
                  <Duration merge />
                </sequence>
              </choice>
            </sequence>
          </filter>
        </map>
      </label>
    )
  }
}

Range.defaultProps = {
  prepositions: false,
  seconds: true,
  defaultTime: {hour: 8},
  defaultDuration: {hours: 1},
  future: true,
  past: true,
  argument: 'period of time'
}

