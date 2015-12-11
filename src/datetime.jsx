/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { AmbiguousTime, Time } from './time'
import { DateWithTimeOfDay, DatePhrase } from './date'

export class DateTime extends Phrase {
  getValue(result) {
    if (!result) return

    if (_.isDate(result.date)) {
      if (result.time) {
        return new Date(result.date.getFullYear(), result.date.getMonth(), result.date.getDate(), result.time.getHours(), result.time.getMinutes(), result.time.getSeconds(), 0)
      }

      if (result.impliedTime) {
        if (result.ambiguousTime) {
          if (_.inRange(result.ambiguousTime.hour, ...result.impliedTime.range)) {
            return new Date(result.date.getFullYear(), result.date.getMonth(), result.date.getDate(), result.ambiguousTime.hour, result.ambiguousTime.minutes || 0, result.ambiguousTime.seconds || 0, 0)
          } else {
            const newHour = result.ambiguousTime.hour < 12 ? result.ambiguousTime.hour + 12 : result.ambiguousTime.hour - 12
            return new Date(result.date.getFullYear(), result.date.getMonth(), result.date.getDate(), newHour, result.ambiguousTime.minutes || 0, result.ambiguousTime.seconds || 0, 0)
          }
        } else {
          return new Date(result.date.getFullYear(), result.date.getMonth(), result.date.getDate(), result.impliedTime.default, 0, 0, 0)
        }
      }

      return new Date(result.date.getFullYear(), result.date.getMonth(), result.date.getDate(), 8, 0, 0, 0)
    } else if (result.time) {
      const date = new Date()
      date.setHours(result.time.getHours(), result.time.getMinutes(), result.time.getSeconds(), 0)
      return date
    }
  }

  filter(result) {
    if (result && result.time && result.impliedTime) {
      return _.inRange(result.time.getHours(), ...result.impliedTime.range)
    }
    return true
  }

  describe() {
    return (
      <placeholder text='date and time' showForEmpty>
        <choice>
          {this.props.impliedDate ? <Time id='time' prepositions={this.props.prepositions} /> : null}

          {this.props.impliedTime ? [
            <DatePhrase id='date' prepositions={this.props.prepositions} />,
            <DateWithTimeOfDay merge prepositions={this.props.prepositions} />
          ] : null}

          <sequence>
            <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions={this.props.prepositions} />
            <literal text=' ' />
            <DatePhrase id='date' recurse={false} prepositions />
          </sequence>

          <sequence>
            <choice merge>
              <AmbiguousTime id='ambiguousTime' prepositions={this.props.prepositions} />
              <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions={this.props.prepositions} />
            </choice>
            <literal text=' ' />
            <DateWithTimeOfDay merge />
          </sequence>

          <sequence>
            <DatePhrase id='date' recurse={false} prepositions={this.props.prepositions} />
            <literal text=' ' />
            <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions />
          </sequence>

          <sequence>
            <DateWithTimeOfDay merge />
            <literal text=' ' />
            <choice limit={1} merge>
              <AmbiguousTime id='ambiguousTime' seconds={this.props.seconds} prepositions />
              <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions forceAmpm={false} />
            </choice>
          </sequence>
        </choice>
      </placeholder>
    )
  }
}

DateTime.defaultProps = {
  seconds: true,
  prepositions: false,
  impliedTime: true,
  impliedDate: true
}
