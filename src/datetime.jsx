/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { Time, TimeOfDay } from './time'
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

class TrueDate extends Phrase {
  describe () {
    return (
      <sequence>
        <choice merge>
          <InternalDate {...this.props} id={undefined} />
          <map function={(result) => ({date: result})}>
            <DatePhrase {...this.props} nullify />
          </map>
        </choice>
      </sequence>
    )
  }
}


export class DateTime extends Phrase {
  validate (result) {
    if (!this.props.past && moment().isAfter(result)) {
      return false
    }

    if (!this.props.future && moment().isBefore(result)) {
      return false
    }

    return true
  }

  * getValues (result) {
    let dates
    if (result.date) {
      if (result._ambiguousWeek) {
        dates = _.map([0, 1, -1], (weeks) => moment(result.date).add(weeks, 'weeks').toDate())
      } else if (result._ambiguousCentury) {
        dates = _.map([0, 100, -100], (years) => moment(result.date).add(years, 'years').toDate())
      } else if (result._ambiguousYear) {
        dates = _.map([0, 1, -1], (years) => moment(result.date).add(years, 'years').toDate())
      } else {
        dates = [result.date]
      }
    } else {
      dates = [undefined]
    }

    for (let date of dates) {
      if (date && result.time) {
        yield join(date, result.time)
      } else if (result.time && result.relativeDate) {
        yield join(relativeDate(result.relativeDate), result.time)
      } else if (date) {
        yield join(date, this.props.defaultTime)
      } else if (result.time) {
        for (let i of [0, 1, -1]) {
          yield join(relativeDate({days: i}), result.time)
        }
      }
    }
  }

  describe () {
    return this.props.nullify ? null : (
      <map iteratorFunction={this.getValues.bind(this)} limit={1}>
        <InternalDateTime {...this.props} _allowAmbiguity={false} />
      </map>
    )
  }
}

DateTime.defaultProps = {
  defaultTime: {hour: 8, minute: 0, second: 0},
  past: true,
  future: true,
  prepositions: false
}

export class InternalDateTime extends Phrase {
  /*

  RelativeNamed []

    # DATE ALONE
    date nullify
    relative named (tomorrow)
    relative numbered (in 3 days, 3 days ago)
    absolute named month (january 23rd)
    absolute numbered (1/23)
    relative adjacent (next week)
    relative weekday (next tuesday)

    # TIME ALONE
    time nullify
    absolute named (midnight)
    absolute numeric (3:34pm)
    absolute relative hour (quarter to 3pm)
    absolute time of day with absolute numeric (3:34 in the morning)
    absolute time of day with relative hour (quarter to 3 in the morning)
    relative named (now, right now)
    relative time (in 4 minutes)
    recursive time (3 hours before 4:00pm)

    # DATE AND TIME
    date nullify time nullify
    time nullify date nullify

    # DATE AND TIME OF DAY


    # DATE AND TIME AND TIME OF DAY
  */

  getValue (result) {
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

    return {
      date,
      time,
      _ambiguousYear: result.date && result.date._ambiguousYear,
      _ambiguousCentury: result.date && result.date._ambiguousCentury,
      _ambiguousWeek: result.date && result.date._ambiguousWeek
    }
  }

  filter (result) {
    if (result.time && result.time._ambiguousAMPM && !result.timeOfDay) {
      return false
    } else if (result.time && result.timeOfDay && isNoonOrMidnight(result.time)) {
      return false
    } else if (result.time && result.timeOfDay && !result.time._ambiguousAMPM && !timeIsInAMPM(result.time, result.timeOfDay.impliedAMPM)) {
      return false 
    }

    return true
  }

  describe () {
    return (
      <label argument={false} text='date and time'>
        <map function={this.getValue.bind(this)} limit={1}>
          <filter function={this.filter.bind(this)}>
            <choice>
              <sequence unique>
                <sequence merge>
                  <Time id='time' ellipsis prepositions={this.props.prepositions} seconds={false} />

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
                  <TrueDate id='date' prepositions={this.props.prepositions} />
                  <sequence>
                    <literal id='relativeDate' text='this ' value={{day: 0}} />
                    <TimeOfDay id='timeOfDay' />
                  </sequence>
                  <label text='date'>
                    <literal text='tonight' value={{relativeDate: {day: 0}, time: {hour: 20}}} />
                  </label>
                </choice>

                <sequence id='timeOfDay' optional limited ellipsis>
                  <list items={[' ', ' in the ']} limit={1} />
                  <TimeOfDay merge />
                </sequence>

                <sequence id='time' ellipsis>
                  <literal text=' ' />
                  <Time merge prepositions seconds={false} />
                </sequence>

                <sequence id='timeOfDay'>
                  <literal text=' in the ' />
                  <TimeOfDay merge />
                </sequence>
              </sequence>
            </choice>
          </filter>
        </map>
      </label>
    )
  }
}

/*class DateAndTime extends Phrase {
  getValue (result) {
    return join(result.date, result.time)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <choice>
          <sequence>
            <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions={this.props.prepositions} />
            <literal text=' ' />
            <Date id='date' recurse={false} prepositions />
          </sequence>

          <sequence>
            <Date id='date' recurse={false} prepositions={this.props.prepositions} />
            <literal text=' ' />
            <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions />
          </sequence>
        </choice>
      </map>
    )

  }
}

class DateWithTimeOfDayAndTime extends Phrase {
  getValue (result) {
    if (result.ambiguousTime) {
      const time = coerceAmbiguousTime(result.ambiguousTime, result.impliedTime.range)
      return join(result.date, time)
    } else {
      const time = result.time || {hour: result.impliedTime.default}
      return join(result.date, time)
    }
  }

  filter (result) {
    if (result.time && result.impliedTime) {
      return _.inRange(result.time.hour, ...result.impliedTime.range)
    } else {
      return true
    }
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <filter function={this.filter.bind(this)}>
          <choice>
            <sequence>
              <choice merge>
                <AmbiguousTime id='ambiguousTime' prepositions={this.props.prepositions} seconds={this.props.seconds} />
                <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions={this.props.prepositions} seconds={this.props.seconds} />
              </choice>
              <literal text=' ' />
              <DateWithTimeOfDay merge />
            </sequence>

            <sequence>
              <DateWithTimeOfDay merge />
              <literal text=' ' />
              <choice limit={1} merge>
                <AmbiguousTime id='ambiguousTime' seconds={this.props.seconds} prepositions seconds={this.props.seconds} />
                <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions seconds={this.props.seconds} />
              </choice>
            </sequence>
          </choice>
        </filter>
      </map>
    )
  }
}

class DateAlone extends Phrase {
  getValue (result) {
    if (result.impliedTime) {
      return join(result.date, {hour: result.impliedTime.default, minute: 0, second: 0})
    } else {
      return join(result.date, this.props.time)
    }
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <choice limit={1}>
          {this.props._impliedTime ? <Date id='date' prepositions={this.props.prepositions} /> : null}
          <DateWithTimeOfDay prepositions={this.props.prepositions} />
        </choice>
      </map>
    )
  }
}

class TimeAlone extends Phrase {
  getValue (result) {
    const date = relativeDate(result.relativeDate)
    return join(date, result.time)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <Time id='time' prepositions={this.props.prepositions} seconds={this.props.seconds} />
          <list id='relativeDate' limit={1} items={[
            {text:'', value: {}},
            {text:'', value: {days: 1}},
            {text:'', value: {days: -1}}
          ]} />
        </sequence>
      </map>
    )
  }
}
*/