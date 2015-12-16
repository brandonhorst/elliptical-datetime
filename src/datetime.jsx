/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { AmbiguousTime, Time } from './time'
import moment from 'moment'
import { join } from './helpers'
import { DateWithTimeOfDay, DatePhrase } from './date'

export class DateTime extends Phrase {
  getValue(result) {
    if (!result) return

    if (result.date) {
      if (result.time) {
        return join(result.date, result.time)
      } else if (result.impliedTime) {
        if (result.ambiguousTime) {
          if (_.inRange(result.ambiguousTime.hour, ...result.impliedTime.range)) {
            return join(result.date, result.ambiguousTime)
          } else {
            const time = {
              hour: result.ambiguousTime.hour < 12 ? result.ambiguousTime.hour + 12 : result.ambiguousTime.hour - 12,
              minute: result.ambiguousTime.minute,
              seconds: result.ambiguousTime.second
            }
            return join(result.date, time)
          }
        } else {
          return join(result.date, {hour: result.impliedTime.default})
        }
      } else {
        return join(result.date, this.props.defaultTime)
      }
    } else if (result.time) {
      return join(new Date(), result.time)
    }
  }

  filter(result) {
    if (result && result.time && result.impliedTime) {
      return _.inRange(result.time.hour, ...result.impliedTime.range)
    }
    return true
  }

  describe() {
    return (
      <filter function={this.filter.bind(this)}>
        <placeholder text='date and time' showForEmpty>
          <choice>
            {this.props.impliedDate ? <Time id='time' prepositions={this.props.prepositions} /> : null}

            {this.props.impliedTime ?
              <choice limit={1}>
                <DatePhrase id='date' prepositions={this.props.prepositions} />
                <DateWithTimeOfDay merge prepositions={this.props.prepositions} />
              </choice>
            : null}

            <sequence>
              <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions={this.props.prepositions} />
              <literal text=' ' />
              <DatePhrase id='date' recurse={false} prepositions />
            </sequence>

            <sequence>
              <DatePhrase id='date' recurse={false} prepositions={this.props.prepositions} />
              <literal text=' ' />
              <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions />
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
              <DateWithTimeOfDay merge />
              <literal text=' ' />
              <choice limit={1} merge>
                <AmbiguousTime id='ambiguousTime' seconds={this.props.seconds} prepositions />
                <Time id='time' seconds={this.props.seconds} relative={false} recurse={false} prepositions />
              </choice>
            </sequence>
          </choice>
        </placeholder>
      </filter>
    )
  }
}

DateTime.defaultProps = {
  defaultTime: {hour: 8},
  seconds: true,
  prepositions: false,
  impliedTime: true,
  impliedDate: true
}
