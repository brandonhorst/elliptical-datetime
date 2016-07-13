/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import {createElement} from 'elliptical'

import { join, relativeDate, possibleDates } from './helpers'
import { DateTime, InternalDateTime } from './datetime'
import { Duration } from './duration'

const TrueDateTime = {
  describe ({props}) {
    return (
      <sequence>
        <literal text='all day ' id='allDay' value optional limited />

        <choice merge>
          <InternalDateTime {...props} id={undefined} />
          <map function={(result) => ({dateTime: result})}>
            <DateTime {...props} nullify />
          </map>
        </choice>
      </sequence>
    )
  }
}

function * mapRangeResults (result, props) {
  if (result.start && result.end) {
    if (!result.start.time && !result.end.time) {
      for (let startDate of possibleDates(result.start)) {
        for (let endDate of possibleDates(result.end)) {
          yield {
            start: join(startDate, {hour: 0, minute: 0, second: 0}, props.timezoneOffset),
            end: join(endDate, {hour: 0, minute: 0, second: 0}, props.timezoneOffset),
            allDay: true
          }
        }
      }
    } else {
      for (let startDate of possibleDates(result.start, result.end.date)) {
        for (let endDate of possibleDates(result.end, startDate)) {
          yield {
            start: join(startDate, result.start.time || props.defaultTime, props.timezoneOffset),
            end: join(endDate, result.end.time || props.defaultTime, props.timezoneOffset),
            allDay: false
          }
        }
      }
    }
  } else if (result.start && result.duration) {
    for (let startDate of possibleDates(result.start)) {
      const start = join(startDate, result.start.time || props.defaultTime, props.timezoneOffset)
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
        const start = join(startDate, result.start.time, props.timezoneOffset)
        yield {
          start: start,
          end: moment(start).add(props.defaultDuration).toDate(),
          allDay: false
        }
      }
    }
  }
}

function * mapRangeOptions (option, props) {
  for (let result of mapRangeResults(option.result, props)) {
    yield _.assign({}, option, {result})
  }
}

function filterRangeOption (option) {
  if (option.result.allDay &&
      (!option.result.start._ambiguousTime ||
        (option.result.end && !option.result.end._ambiguousTime))) {
    return false
  }

  return true
}

export const Range = {
  defaultProps: {
    prepositions: false,
    seconds: true,
    defaultTime: {hour: 8},
    defaultDuration: {hours: 1},
    future: true,
    past: true,
    label: 'period of time'
  },
  
  filterResult (result, {props}) {
    const startMoment = moment(result.start)
    const endMoment = moment(result.end)

    if (endMoment.isBefore(startMoment)) return false

    const currentMoment = result.allDay ? moment({}) : moment()
    if (!props.past && currentMoment.isAfter(startMoment)) return false
    if (!props.future && currentMoment.isBefore(endMoment)) return false

    return true
  },


  describe ({props}) {
    return (
      <placeholder
        label={props.label}
        arguments={props.phraseArguments || (props.phraseArguments ? [props.phraseArgument] : [props.label])}>
        <map outbound={(option) => mapRangeOptions(option, props)} limit={1}>
          <filter outbound={filterRangeOption}>
            <sequence unique>
              <sequence id='duration' optional limited>
                {props.prepositions ? <literal text='for ' optional limited preferred /> : null}
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
      </placeholder>
    )
  }
}

