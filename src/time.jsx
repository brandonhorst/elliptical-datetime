/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import { createElement, Phrase } from 'lacona-phrase'
import { DigitString, Integer } from 'lacona-phrase-number'

import { absoluteTime, ambiguousTime, coerceAmbiguousTime, negateDuration, relativeTime } from './helpers'
import { TimeDuration } from './duration'

export class TimeOfDay extends Phrase {
  describe () {
    return (
      <label text='time of day'>
        <list items={[
          {text: 'morning', value: {default: 8, range: [0, 12]}},
          {text: 'afternoon', value: {default: 12, range: [12, 24]}},
          {text: 'evening', value: {default: 17, range: [12, 24]}},
          {text: 'night', value: {default: 20, range: [12, 24]}}
        ]} />
      </label>
    )
  }
}

export class AmbiguousTime extends Phrase {
  describe () {
    return (
      <sequence>
        {this.props.prepositions ? <literal text='at ' category='conjunction' /> : null}
        <label text='time' showForEmpty merge>
          <choice>
            <AmbiguousAbsoluteNumeric seconds={this.props.seconds} />
            <AmbiguousAbsoluteRelativeHour />
          </choice>
        </label>
      </sequence>
    )
  }
}

export class Time extends Phrase {
  describe () {
    return (
      <label text='time' showForEmpty>
        <choice>
          <sequence>
            {this.props.prepositions ? <literal text='at ' category='conjunction' /> : null}
            <choice merge>
              <AbsoluteNumeric seconds={this.props.seconds} />
              <AbsoluteRelativeHour />
              <AbsoluteNamed />
              <AbsoluteTimeOfDay seconds={this.props.seconds} />
            </choice>
          </sequence>
          {this.props.named ? <RelativeNamed /> : null}
          {this.props.relative ? <RelativeTime /> : null}
          {this.props.recurse ? <RecursiveTime /> : null}
        </choice>
      </label>
    )
  }
}

Time.defaultProps = {
  named: true,
  recurse: true,
  relative: true,
  prepositions: false,
  seconds: false
}

class RelativeTime extends Phrase {
  getValue(result) {
    if (!result) return

    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
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
      </map>
    )
  }
}

class RelativeNamed extends Phrase {
  describe () {
    return (
      <map function={relativeTime}>
        <list items={[
          {text: 'now', value: {}},
          {text: 'right now', value: {}}
        ]} limit={1} />
      </map>
    )
  }
}

class AbsoluteTimeOfDay extends Phrase {
  getValue (result) {
    if (!result || !result.timeOfDay || !result.ambiguousTime) return

    return coerceAmbiguousTime(result.ambiguousTime, result.timeOfDay.range)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <choice id='ambiguousTime'>
            <AmbiguousAbsoluteNumeric seconds={this.props.seconds} />
            <AmbiguousAbsoluteRelativeHour />
          </choice>
          <literal text=' in the ' category='conjunction' />
          <TimeOfDay id='timeOfDay' />
        </sequence>
      </map>
    )
  }
}

class AbsoluteNamed extends Phrase {
  describe () {
    return (
      <map function={absoluteTime}>
        <list items={[
          {text: 'midnight', value: {hour: 0}},
          {text: 'noon', value: {hour: 12}}
        ]} />
      </map>
    )
  }
}

class AmbiguousAbsoluteNumeric extends Phrase {
  getValue (result) {
    if (!result) return
    return ambiguousTime(result)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <Hour id='hour' />

          <choice optional limit={1} merge>
            {this.props.minutes ?
              <sequence>
                <literal text=':' />
                <MinutesOrSeconds id='minute' />
              </sequence>
            : null}

            {this.props.minutes && this.props.seconds ?
              <sequence>
                <literal text=':' />
                <MinutesOrSeconds id='minute' />
                <literal text=':' />
                <MinutesOrSeconds id='second' />
              </sequence>
            : null}
          </choice>
        </sequence>
      </map>
    )
  }
}

AmbiguousAbsoluteNumeric.defaultProps = {
  minutes: true,
  seconds: false
}

class AbsoluteNumeric extends Phrase {
  getValue (result) {
    if (!result) return

    return ambiguousTime(result.ambiguousTime, result.ampm)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <AmbiguousAbsoluteNumeric id='ambiguousTime' minutes={this.props.minutes} seconds={this.props.seconds} />

          <choice id='ampm'>
            <list items={[' am', 'am', ' a', 'a', ' a.m.', 'a.m.', ' a.m', 'a.m']} value='am' limit={1} />
            <list items={[' pm', 'pm', ' p', 'p', ' p.m.', 'p.m.', ' p.m', 'p.m']} value='pm' limit={1} />
          </choice>
        </sequence>
      </map>
    )
  }
}

AbsoluteNumeric.defaultProps = {
  minutes: true,
  seconds: false
}

class AmbiguousAbsoluteRelativeHour extends Phrase {
  describe () {
    return <BaseAbsoluteRelativeHour ambiguous />
  }
}

class AbsoluteRelativeHour extends Phrase {
  describe () {
    return <BaseAbsoluteRelativeHour/>
  }
}

class BaseAbsoluteRelativeHour extends Phrase {
  getValue (result) {
    if (!result) return

    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration, result.absolute)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <label argument={false} text='number' showForEmpty={true} id='duration'>
            <choice>
              <literal id='minutes' text='quarter' value={15} />
              <literal id='minutes' text='half' value={30} />
              <Integer id='minutes' min={1} max={59} merge />
            </choice>
          </label>
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
          <label argument={false} text='hour' id='absolute'>
            <choice>
              {this.props.ambiguous ?
                <AmbiguousAbsoluteNumeric minutes={false} seconds={false} /> :
                <AbsoluteNumeric minutes={false} seconds={false} />
              }
              <AbsoluteNamed />
            </choice>
          </label>
        </sequence>
      </map>
    )
  }
}

BaseAbsoluteRelativeHour.defaultProps = {
  ambiguous: false
}

class RecursiveTime extends Phrase {
  getValue (result) {
    if (!result || !result.time || !result.duration || !result.direction) return

    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration, result.time)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <label text='offset' showForEmpty merge>
            <sequence>
              <TimeDuration id='duration' />
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
          </label>
          <Time recurse={false} relative={false} id='time' />
        </sequence>
      </map>
    )
  }
}

class MinutesOrSeconds extends Phrase {
  getValue(result) {
    return parseInt(result, 10)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <DigitString descriptor='minutes' max={59} minLength={2} maxLength={2} />
      </map>
    )
  }
}

class Hour extends Phrase {
  getValue(result) {
    return parseInt(result, 10)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <DigitString descriptor='hour' min={1} max={12} allowLeadingZeros={false} />
      </map>
    )
  }

}
