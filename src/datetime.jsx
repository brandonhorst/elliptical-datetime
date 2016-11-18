/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'elliptical'
import { InternalTime, TimeOfDay } from './time'
import moment from 'moment'
import { ambiguousTime, join, relativeDate } from './helpers'
import { InternalDate, Date as DatePhrase } from './date'

function isNoonOrMidnight (time) {
  return (time.hour === 12 || time.hour === 0) && !time.minute && !time.second
}

function timeIsInAMPM(time, ampm) {
  if (ampm === 'am') {
    return time.hour >= 0 && time.hour < 12
  } else if (ampm === 'pm') {
    return time.hour >= 12 && time.hour < 24
  }
}

const TrueDate = {
  describe ({props}) {
    return (
      <sequence>
        <choice merge>
          <InternalDate {...props} id={undefined} />
          <map function={(result) => ({date: result})} skipIncomplete>
            <DatePhrase {...props} nullify />
          </map>
        </choice>
      </sequence>
    )
  }
}

function * getDateTimeResults (result, props) {
  let dates
  if (result.date) {
    if (result._ambiguousWeek) {
      dates = _.map([0, 1, -1], (weeks) => moment(result.date).add(weeks, 'weeks').toDate())
    } else if (result._ambiguousCentury) {
      dates = _.map([0, 100, -100], (years) => moment(result.date).add(years, 'years').toDate())
    } else if (result._ambiguousYear) {
      if (result._ambiguousMonth) {
        dates = _.flatMap([0, 1, -1], (y) => {
          return _.map([0, 1, -1], (m) => {
            return moment(result.date).add(y, 'years').add(m, 'months').toDate()
          })
        })
      } else {
        dates = _.map([0, 1, -1], (years) => moment(result.date).add(years, 'years').toDate())
      }
    } else {
      dates = [result.date]
    }
  } else {
    dates = [undefined]
  }

  for (let date of dates) {
    if (date && result.time) {
      yield join(date, result.time, props.timezoneOffset)
    } else if (result.time && result.relativeDate) {
      yield join(relativeDate(result.relativeDate), result.time, props.timezoneOffset)
    } else if (date) {
      yield join(date, props.defaultTime, props.timezoneOffset)
    } else if (result.time) {
      for (let i of [0, 1, -1]) {
        yield join(relativeDate({days: i}), result.time, props.timezoneOffset)
      }
    }
  }
}

function * getDateTimeOptions (option, props) {
  for (let result of getDateTimeResults(option.result, props)) {
    yield _.assign({}, option, {result})
  }
}

// function filterDateTimeResult (result) {
//   return true
// }

export const DateTime = {
  id: 'elliptical-datetime:DateTime',
  
  defaultProps: {
    defaultTime: {hour: 8, minute: 0, second: 0},
    past: true,
    future: true,
    prepositions: false,
    label: 'date and time'
  },

  filterResult (result, {props}) {
    if (!props.past && moment().isAfter(result)) {
      return false
    }

    if (!props.future && moment().isBefore(result)) {
      return false
    }

    return true
  },

  describe ({props}) {
    return props.nullify ? null : (
      <map outbound={(option) => getDateTimeOptions(option, props)} limit={1} skipIncomplete>
        {/*<filter outbound={option => filterDateTimeResult(option.result, props)} skipIncomplete>*/}
          <InternalDateTime {...props} />
        {/*</filter>*/}
      </map>
    )
  }
}

function filterInternalDateTime (option) {
  const result = option.result
  /*if (option.result.time && option.result.time._ambiguousAMPM &&
      !option.result.timeOfDay) {
    return false
  } else */if (result.time && result.timeOfDay &&
      isNoonOrMidnight(result.time)) {
    return false
  } else if (result.time && result.timeOfDay &&
    !result.time._ambiguousAMPM &&
    !timeIsInAMPM(result.time, result.timeOfDay.impliedAMPM)
  ) {
    return false 
  }

  return true
}

export const InternalDateTime = {
  defaultProps: {
    label: 'date and time'
  },
  
  mapResult (result) {
    let time = result.time
    if (result.timeOfDay && result.time && result.time._ambiguousAMPM) {
      time = ambiguousTime(result.time, result.timeOfDay.impliedAMPM)
    } else if (result.timeOfDay && !result.time) {
      time = {hour: result.timeOfDay.default}
    }

    let date = result.date && result.date.date
    if (result.relativeDate) {
      date = relativeDate(result.relativeDate)
    }

    // console.log(result)
    return {
      date,
      time,
      _ambiguousYear: result.date && result.date._ambiguousYear,
      _ambiguousCentury: result.date && result.date._ambiguousCentury,
      _ambiguousWeek: result.date && result.date._ambiguousWeek,
      _ambiguousMonth: result.date && result.date._ambiguousMonth,
      _ambiguousAMPM: result.time && result.time._ambiguousAMPM,
      _specificAMPM: result.time && result.time._specificAMPM
    }
  },

  describe ({props}) {
    return (
      <placeholder
        label={props.label}
        arguments={props.phraseArguments || (props.phraseArguments ? [props.phraseArgument] : [props.label])}>
        <filter outbound={filterInternalDateTime} skipIncomplete>
          <choice>
            <sequence unique>
              <sequence merge>
                <InternalTime id='time' ellipsis prepositions={props.prepositions} seconds={false} />

                <sequence optional limited ellipsis merge>
                  <sequence id='timeOfDay' optional limited>
                    <literal text=' the ' />
                    <TimeOfDay merge />
                    <literal text=' of' />
                  </sequence>

                  <sequence id='date'>
                    <literal text=' ' />
                    <TrueDate merge prepositions />
                  </sequence>
                </sequence>

                <sequence id='timeOfDay'>
                  <list items={[' ', ' in the ']} limit={1} />
                  <TimeOfDay merge />
                </sequence>
              </sequence>
            </sequence>

            <sequence unique>
              <sequence id='timeOfDay' optional limited>
                <literal text='the ' />
                <TimeOfDay merge />
                <literal text=' of ' />
              </sequence>

              <choice merge ellipsis>
                <TrueDate id='date' prepositions={props.prepositions} />
                <sequence>
                  <literal id='relativeDate' text='this ' value={{day: 0}} />
                  <TimeOfDay id='timeOfDay' />
                </sequence>
                <placeholder label='date'>
                  <literal text='tonight' value={{relativeDate: {day: 0}, time: {hour: 20}}} />
                </placeholder>
              </choice>

              <sequence id='timeOfDay' optional limited ellipsis>
                <list items={[' ', ' in the ']} limit={1} />
                <TimeOfDay merge />
              </sequence>

              <sequence id='time' ellipsis>
                <literal text=' ' />
                <InternalTime merge prepositions seconds={false} />
              </sequence>

              <sequence id='timeOfDay'>
                <literal text=' in the ' />
                <TimeOfDay merge />
              </sequence>
            </sequence>
          </choice>
        </filter>
      </placeholder>
    )
  }
}
