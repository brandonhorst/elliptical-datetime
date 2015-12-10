/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import { createElement, Phrase } from 'lacona-phrase'
import { DigitString, Integer } from 'lacona-phrase-number'
import { TimeDuration } from './duration'

export class AmbiguousTime extends Phrase {
  describe () {
    return (
      <argument text='time' showForEmpty={true} merge={true}>
        <sequence>
          {this.props.prepositions ? <literal text='at ' category='conjunction' /> : null}
          <Absolute merge ampm={false} named={false} />
        </sequence>
      </argument>
    )
  }
}

function timeFromAbsolute (absolute) {
    let hour = absolute.hour

    if (absolute.ampm) {
      hour = absolute.ampm === 'am' ? (hour === 12 ? 0 : hour) : hour + 12
    }

    return moment({hour, minutes: absolute.minutes}).toDate()

}

export class Time extends Phrase {
  getValue (result) {
    if (!result) return

    if (_.isDate(result)) {
      return result
    } else if (result.relative) {
      return moment().millisecond(0).add(moment.duration(result.relative)).toDate()
    } else if (result.absolute) {
      return timeFromAbsolute(result.absolute)
    }
  }

  describe () {
    return (
      <argument text='time' showForEmpty={true} merge={true}>
        <choice>
          <sequence>
            {this.props.prepositions ? <literal text='at ' category='conjunction' /> : null}
            <Absolute id='absolute' />
          </sequence>
          {this.props.relative ? <RelativeTime id='relative' /> : null}
          {this.props.recurse ? <RecursiveTime /> : null}
        </choice>
      </argument>
    )
  }
}

Time.defaultProps = {
  recurse: true,
  relative: true,
  prepositions: false,
  seconds: false
}

class RelativeTime extends Phrase {
  getValue(result) {
    if (!result) return

    if (result.direction < 0) {
      return _.mapValues(result.duration, num => -num)
    } else {
      return result.duration
    }
  }

  describe() {
    return (
    <choice>
        <sequence>
          <literal text='in ' id='direction' value={1} />
          <TimeDuration id='duration' seconds={this.props.seconds} />
        </sequence>
        <sequence>
          <TimeDuration id='duration' seconds={this.props.seconds} />
          <literal text=' from now' id='direction' value={1} />
        </sequence>
        <sequence>
          <TimeDuration id='duration' seconds={this.props.seconds} />
          <literal text=' ago' id='direction' value={-1} />
        </sequence>
      </choice>
    )
  }
}

class AbsoluteRelativeHour extends Phrase {
  getValue(result) {
    if (!result || !result.absolute) return

    if (result.direction > 0) {
      return {hour: result.absolute.hour, minutes: result.minutes, ampm: result.absolute.ampm}
    } else {
      const hour = result.absolute.hour === 0 ? 23 : result.absolute.hour - 1
      const minutes = 60 - result.minutes
      return {hour, minutes, ampm: result.absolute.ampm}
    }
  }

  describe() {
    return (
      <sequence>
        <placeholder text='number' showForEmpty={true} id='minutes'>
          <choice>
            <literal text='quarter' value={15} />
            <literal text='half' value={30}/>
            <sequence>
              <Integer min={1} max={59} merge={true} />
            </sequence>
          </choice>
        </placeholder>
        <choice id='direction'>
          <choice limit={1} value={1}>
            <literal text=' past '/>
          </choice>
          <choice limit={1} value={-1}>
            <literal text=' to ' />
            <literal text=' of ' />
            <literal text=' til ' />
            <literal text=' before ' />
            <literal text=' from '/>
          </choice>
        </choice>
        <placeholder text='hour' id='absolute'>
          <choice>
            <AbsoluteNumeric minutes={false} ampm={this.props.ampm} />
            <AbsoluteNamed />
          </choice>
        </placeholder>
      </sequence>
    )
  }
}

class Absolute extends Phrase {
  describe() {
    return (
      <choice>
        <AbsoluteNumeric ampm={this.props.ampm} />
        <AbsoluteRelativeHour ampm={this.props.ampm} />
        {this.props.named ? <AbsoluteNamed /> : null}
      </choice>
    )
  }
}

Absolute.defaultProps = {
  ampm: true,
  named: true
}

class AbsoluteNamed extends Phrase {
  getValue(result) {
    return {hour: result, minutes: 0}
  }

  describe() {
    return <list items={[
      {text: 'midnight', value: 0},
      {text: 'noon', value: 12}
    ]} />
  }
}

class AbsoluteNumeric extends Phrase {
  getValue(result) {
    return {hour: parseInt(result.hour, 10), minutes: result.minutes, ampm: result.ampm}
  }

  describe() {
    return (
      <sequence>
        <DigitString descriptor='hour' min={1} max={12} allowLeadingZeros={false} id='hour' />

        {this.props.minutes ?
          <sequence id='minutes' optional>
            <literal text=':' />
            <Minutes merge />
          </sequence>
        : null }

        {this.props.ampm ?
          <choice id='ampm'>
            <list items={[' am', 'am', ' a', 'a', ' a.m.', 'a.m.', ' a.m', 'a.m']} value='am' limit={1} />
            <list items={[' pm', 'pm', ' p', 'p', ' p.m.', 'p.m.', ' p.m', 'p.m']} value='pm' limit={1} />
          </choice>
        : null}
      </sequence>
    )
  }
}

AbsoluteNumeric.defaultProps = {minutes: true}

class RecursiveTime extends Phrase {
  getValue(result) {
    if (!result || !result.time) return

    const date = new Date(result.time.getTime()) // clone date

    if (result.hours) {
      date.setHours((result.hours * result.direction) + result.time.getHours())
    }

    if (result.minutes) {
      date.setMinutes((result.minutes * result.direction) + result.time.getMinutes())
    }

    if (result.seconds) {
      date.setSeconds((result.seconds * result.direction) + result.time.getSeconds())
    }

    return date
  }

  describe() {
    return (
    <sequence>
        <argument text='offset' showForEmpty={true} merge={true}>
          <sequence>
            <TimeDuration merge={true} />
            <list merge={true} id='direction' items={[
              {text: ' before ', value: -1},
              {text: ' after ', value: 1},
              {text: ' from ', value: 1},
              {text: ' past ', value: 1},
              {text: ' to ', value: -1},
              {text: ' of ', value: -1},
              {text: ' til ', value: -1},
              {text: ' from ', value: -1}
            ]} limit={2} />
          </sequence>
        </argument>
        <Time recurse={false} relative={false} id='time' />
      </sequence>
    )
  }
}

class Minutes extends Phrase {
  getValue(result) {
    return parseInt(result, 10)
  }

  describe() {
    return <DigitString descriptor='minutes' max={59} minLength={2} maxLength={2} />
  }
}
