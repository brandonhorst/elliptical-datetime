/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import {createElement} from 'elliptical'

import { join, relativeDate, possibleDates, ambiguousTime, timeLessThan } from './helpers'
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

function preprocessRangeAmbiguity (result, props) {
  if (result.start && result.end) {
    if (result.end.date && result.end._ambiguousMonth) {
      const trueEndDate = moment(result.end.date).month(moment(result.start.date).month()).toDate()
      const end = _.assign({}, result.end, {date: trueEndDate})
      return _.assign({}, result, {end})
    }

    if (result.start._ambiguousAMPM && result.end._specificAMPM) {
      const start = _.clone(result.start)
      start.time = ambiguousTime(result.start.time, result.end._specificAMPM)
      return _.assign({}, result, {start})
    }
  }

  return result
}

function * mapRangeOptions (option, props) {
  const processedResult = preprocessRangeAmbiguity(option.result, props)
  for (let result of mapRangeResults(processedResult, props)) {
    yield _.assign({}, option, {result})
  }
}

function filterRangeOption (option) {
  const result = option.result
  // console.log(result)

  // it doesn't make any sense to specify a "date to time" or "time to date"
  if (result.start && result.end && (
      (result.start.date && !result.start.time && !result.end.date && result.end.time) ||
      (!result.start.date && result.start.time && result.end.date && !result.end.time)
    )
  ) {
    return false
  }

  // both start and end cannot have month ambiguity
  if (result.start && result.start._ambiguousMonth && result.end && result.end._ambiguousMonth) {
    return false
  }

  // if we've specified a time, we can't be allday
  if (result.allDay &&
      (!result.start._ambiguousTime ||
        (result.end && !result.end._ambiguousTime))) {
    return false
  }

  return true
}

export const Range = {
  id: 'elliptical-datetime:Range',
  
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

    const currentMoment = result.allDay ? moment().startOf('day') : moment()
    if (!props.past && currentMoment.isAfter(startMoment)) return false
    if (!props.future && currentMoment.isBefore(endMoment)) return false

    return true
  },


  describe ({props}) {
    return (
      <placeholder
        label={props.label}
        arguments={props.phraseArguments || (props.phraseArguments ? [props.phraseArgument] : [props.label])}>
        <map outbound={(option) => mapRangeOptions(option, props)} limit={1} skipIncomplete>
          <filter outbound={filterRangeOption} skipIncomplete>
            <sequence unique>
              <sequence id='duration' optional limited>
                {props.prepositions ? <literal text='for ' optional limited preferred /> : null}
                <Duration merge />
                <list items={[' ', ' starting ']} limit={1} />
              </sequence>

              <TrueDateTime ellipsis id='start' />

              <choice merge>
                <sequence id='end'>
                  <list items={[' to ', ' - ', '-', '- ', ' -']} limit={1} />

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

