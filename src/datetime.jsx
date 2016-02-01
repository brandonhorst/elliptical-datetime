/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { AmbiguousTime, Time } from './time'
import moment from 'moment-timezone'
import { coerceAmbiguousTime, join, relativeDate } from './helpers'
import { DateWithTimeOfDay, Date } from './date'

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


  describe () {
    return (
      <label argument={false} text='date and time' suppressEmpty={false}>
        <choice>
          {this.props._impliedDate ? <TimeAlone prepositions={this.props.prepositions} seconds={this.props.seconds} timeZone={this.props.timeZone} /> : null}

          <DateAlone prepositions={this.props.prepositions} time={this.props.defaultTime} _impliedTime={this.props._impliedTime} timeZone={this.props.timeZone} />

          <DateAndTime prepositions={this.props.prepositions} seconds={this.props.seconds} timeZone={this.props.timeZone} />

          <DateWithTimeOfDayAndTime prepositions={this.props.prepositions} seconds={this.props.seconds} timeZone={this.props.timeZone} />
        </choice>
      </label>
    )
  }
}

DateTime.defaultProps = {
  defaultTime: {hour: 8},
  seconds: true,
  prepositions: false,
  _impliedTime: true,
  _impliedDate: true,
  past: true,
  future: true
}

class DateAndTime extends Phrase {
  getValue (result) {
    return join(result.date, result.time, this.props.timeZone)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <choice>
          <sequence>
            <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions={this.props.prepositions} timeZone={this.props.timeZone} />
            <literal text=' ' />
            <Date id='date' recurse={false} prepositions timeZone={this.props.timeZone} />
          </sequence>

          <sequence>
            <Date id='date' recurse={false} prepositions={this.props.prepositions} timeZone={this.props.timeZone} />
            <literal text=' ' />
            <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions timeZone={this.props.timeZone} />
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
      return join(result.date, time, this.props.timeZone)
    } else {
      const time = result.time || {hour: result.impliedTime.default}
      return join(result.date, time, this.props.timeZone)
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
                <AmbiguousTime id='ambiguousTime' prepositions={this.props.prepositions} seconds={this.props.seconds} timeZone={this.props.timeZone} />
                <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions={this.props.prepositions} seconds={this.props.seconds} timeZone={this.props.timeZone} />
              </choice>
              <literal text=' ' />
              <DateWithTimeOfDay merge timeZone={this.props.timeZone} />
            </sequence>

            <sequence>
              <DateWithTimeOfDay merge timeZone={this.props.timeZone} />
              <literal text=' ' />
              <choice limit={1} merge>
                <AmbiguousTime id='ambiguousTime' seconds={this.props.seconds} prepositions seconds={this.props.seconds} timeZone={this.props.timeZone} />
                <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions seconds={this.props.seconds} timeZone={this.props.timeZone} />
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
      return join(result.date, {hour: result.impliedTime.default}, this.props.timeZone)
    } else {
      return join(result.date, this.props.time, this.props.timeZone)
    }
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <choice limit={1}>
          {this.props._impliedTime ? <Date id='date' prepositions={this.props.prepositions} timeZone={this.props.timeZone} /> : null}
          <DateWithTimeOfDay prepositions={this.props.prepositions} timeZone={this.props.timeZone} />
        </choice>
      </map>
    )
  }
}

class TimeAlone extends Phrase {
  getValue (result) {
    const date = relativeDate(result.relativeDate, {}, this.props.timeZone)
    return join(date, result.time, this.props.timeZone)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <Time id='time' prepositions={this.props.prepositions} seconds={this.props.seconds} timeZone={this.props.timeZone} />
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
