/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment-timezone'
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
        {this.props.prepositions ? <literal text='at ' category='conjunction' optional limited preferred /> : null}
        <label text='time' merge>
          <choice>
            <AmbiguousAbsoluteNumeric seconds={this.props.seconds} timeZone={this.props.timeZone} />
            <AmbiguousAbsoluteRelativeHour timeZone={this.props.timeZone} />
          </choice>
        </label>
      </sequence>
    )
  }
}

export class Time extends Phrase {
  static defaultProps = {
    named: true,
    recurse: true,
    relative: true,
    prepositions: false,
    seconds: false,
    argument: 'time'
  }

  describe () {
    return (
      <label text={this.props.argument} suppressEmpty={false}>
        <choice>
          <sequence>
            {this.props.prepositions ? <literal text='at ' category='conjunction' optional preferred limited /> : null}
            <choice merge>
              <AbsoluteNumeric seconds={this.props.seconds} timeZone={this.props.timeZone} />
              <AbsoluteRelativeHour timeZone={this.props.timeZone} />
              <AbsoluteNamed timeZone={this.props.timeZone} />
              <AbsoluteTimeOfDay seconds={this.props.seconds} timeZone={this.props.timeZone} />
            </choice>
          </sequence>
          {this.props.named ? <RelativeNamed timeZone={this.props.timeZone} /> : null}
          {this.props.relative ? <RelativeTime timeZone={this.props.timeZone} /> : null}
          {this.props.recurse ? <RecursiveTime timeZone={this.props.timeZone} /> : null}
        </choice>
      </label>
    )
  }
}

class RelativeTime extends Phrase {
  getValue(result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration, undefined, this.props.timeZone)
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
    return coerceAmbiguousTime(result.ambiguousTime, result.timeOfDay.range)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <choice id='ambiguousTime'>
            <AmbiguousAbsoluteNumeric seconds={this.props.seconds} timeZone={this.props.timeZone} />
            <AmbiguousAbsoluteRelativeHour timeZone={this.props.timeZone} />
          </choice>
          <literal text=' in the ' category='conjunction' />
          <TimeOfDay id='timeOfDay' timeZone={this.props.timeZone} />
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
    return ambiguousTime(result.ambiguousTime, result.ampm)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <AmbiguousAbsoluteNumeric id='ambiguousTime' minutes={this.props.minutes} seconds={this.props.seconds} timeZone={this.props.timeZone} />

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
    return <BaseAbsoluteRelativeHour ambiguous timeZone={this.props.timeZone} />
  }
}

class AbsoluteRelativeHour extends Phrase {
  describe () {
    return <BaseAbsoluteRelativeHour timeZone={this.props.timeZone} />
  }
}

class BaseAbsoluteRelativeHour extends Phrase {
  static defaultProps = {
    ambiguous: false
  }

  getValue (result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration, result.absolute, this.props.timeZone)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <label text='number' id='duration'>
            <choice>
              <list id='minutes' items={[
                {text: 'quarter', value: 15},
                {text: 'half', value: 30}
              ]} />
              <Integer id='minutes' min={1} max={59} merge limit={1} />
            </choice>
          </label>
          <list limit={2} id='direction' items={[
            {text: ' past ', value: 1},
            {text: ' to ', value: -1},
            {text: ' of ', value: -1},
            {text: ' til ', value: -1},
            {text: ' before ', value: -1},
            {text: ' from ', value: -1}
          ]} />
          <label argument={false} text='hour' id='absolute'>
            <choice>
              {this.props.ambiguous ?
                <AmbiguousAbsoluteNumeric minutes={false} seconds={false} timeZone={this.props.timeZone} /> :
                <AbsoluteNumeric minutes={false} seconds={false} timeZone={this.props.timeZone} />
              }
              <AbsoluteNamed />
            </choice>
          </label>
        </sequence>
      </map>
    )
  }
}

class RecursiveTime extends Phrase {
  getValue (result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration, result.time, this.props.timeZone)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <sequence merge>
            <TimeDuration id='duration' />
            <list id='direction' items={[
              {text: ' before ', value: -1},
              {text: ' after ', value: 1},
              {text: ' from ', value: 1},
              {text: ' past ', value: 1},
              {text: ' to ', value: -1},
              {text: ' of ', value: -1},
              {text: ' til ', value: -1}
            ]} limit={2} />
          </sequence>
          <Time recurse={false} relative={false} id='time' timeZone={this.props.timeZone} />
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
        <DigitString argument='minutes' max={59} minLength={2} maxLength={2} />
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
        <DigitString argument='hour' min={1} max={12} allowLeadingZeros={false} />
      </map>
    )
  }
}
