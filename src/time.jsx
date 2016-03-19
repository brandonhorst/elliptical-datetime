/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import {createElement} from 'elliptical'
import {DigitString, Integer} from 'elliptical-number'

import {absoluteTime, ambiguousTime, coerceAmbiguousTime, negateDuration, relativeTime} from './helpers'
import {TimeDuration} from './duration'

export const TimeOfDay = {
  describe () {
    return (
      <label text='time of day'>
        <list items={[
          {text: 'early morning', value: {default: 6, impliedAMPM: 'am'}},
          {text: 'morning', value: {default: 8, impliedAMPM: 'am'}},
          {text: 'late morning', value: {default: 10, impliedAMPM: 'am'}},
          {text: 'afternoon', value: {default: 12, impliedAMPM: 'pm'}},
          {text: 'late afternoon', value: {default: 15, impliedAMPM: 'pm'}},
          {text: 'evening', value: {default: 17, impliedAMPM: 'pm'}},
          {text: 'night', value: {default: 20, impliedAMPM: 'pm'}}
        ]} />
      </label>
    )
  }
}

export const Time = {
  defaultProps: {
    named: true,
    recurse: true,
    relative: true,
    prepositions: false,
    seconds: false,
    argument: 'time'
  },

  describe ({props}) {
    return (
      <choice>
        <sequence>
          {props.prepositions ? <list items={['at ', 'from ']} limit={1} category='conjunction' optional preferred limited /> : null}
          <label text={props.argument} merge>
            <choice>
              <AbsoluteNumeric />
              <AbsoluteRelativeHour />
              <AbsoluteNamed />
            </choice>
          </label>
        </sequence>
        <label text={props.argument}>
          <choice>
            {props.named ? <RelativeNamed /> : null}
            {props.relative ? <RelativeTime /> : null}
            {props.recurse ? <RecursiveTime /> : null}
          </choice>
        </label>
      </choice>
    )
  }
}

const RelativeTime  = {
  mapResult (result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration)
  },

  describe ({props}) {
    return (
      <choice>
        <sequence>
          <literal text='in ' id='direction' value={1} />
          <TimeDuration id='duration' seconds={props.seconds} />
        </sequence>
        <sequence>
          <TimeDuration id='duration' seconds={props.seconds} />
          <literal text=' from now' id='direction' value={1} />
        </sequence>
        <sequence>
          <TimeDuration id='duration' seconds={props.seconds} />
          <literal text=' ago' id='direction' value={-1} />
        </sequence>
      </choice>
    )
  }
}

const RelativeNamed = {
  mapResult (result) {
    return relativeTime(result)
  },
  describe () {
    return (
      <list items={[
        {text: 'now', value: {}},
        {text: 'right now', value: {}}
      ]} limit={1} />
    )
  }
}

const AbsoluteTimeOfDay = {
  mapValue (result) {
    return coerceAmbiguousTime(result.ambiguousTime, result.timeOfDay.range)
  },

  describe () {
    return (
      <sequence>
        <choice id='ambiguousTime'>
          <AmbiguousAbsoluteNumeric seconds={props.seconds} />
          <AmbiguousAbsoluteRelativeHour />
        </choice>
        <literal text=' in the ' category='conjunction' />
        <TimeOfDay id='timeOfDay' />
      </sequence>
    )
  }
}

const AbsoluteNamed = {
  mapResult (result) {
    return absoluteTime(result)
  },
  describe () {
    return (
      <list items={[
        {text: 'midnight', value: {hour: 0}},
        {text: 'noon', value: {hour: 12}}
      ]} />
    )
  }
}

const AbsoluteNumeric = {
  mapResult (result) {
    if (result.ampm) {
      return ambiguousTime(result, result.ampm)
    } else {
      return _.assign({}, result, {_ambiguousAMPM: true})
    }
  },

  defaultProps: {
    minutes: true,
    seconds: false
  },

  describe () {
    return (
      <sequence>
        <Hour id='hour' ellipsis />

        <sequence ellipsis optional limited merge>
          <literal text=':' />
          <MinutesOrSeconds id='minute' />
        </sequence>

        <choice id='ampm'>
          <list items={[' am', 'am', ' a', 'a', ' a.m.', 'a.m.', ' a.m', 'a.m']} value='am' limit={1} />
          <list items={[' pm', 'pm', ' p', 'p', ' p.m.', 'p.m.', ' p.m', 'p.m']} value='pm' limit={1} />
        </choice>
      </sequence>
    )
  }
}

const AmbiguousAbsoluteRelativeHour = {
  describe () {
    return <BaseAbsoluteRelativeHour ambiguous />
  }
}

const AbsoluteRelativeHour = {
  describe () {
    return <BaseAbsoluteRelativeHour />
  }
}

const BaseAbsoluteRelativeHour = {
  defaultProps: {
    ambiguous: false
  },

  mapResult (result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration, result.absolute)
  },

  describe () {
    return (
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
            <AbsoluteNumeric minutes={false} />
            <AbsoluteNamed />
          </choice>
        </label>
      </sequence>
    )
  }
}

const RecursiveTime = {
  mapResult (result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeTime(duration, result.time)
  },

  describe () {
    return (
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
        <Time recurse={false} relative={false} id='time' />
      </sequence>
    )
  }
}

const MinutesOrSeconds = {
  mapResult (result) {
    return parseInt(result, 10)
  },

  describe () {
    return <DigitString argument='minutes' max={59} minLength={2} maxLength={2} />
  }
}

const Hour = {
  mapResult (result) {
    return parseInt(result, 10)
  },

  describe () {
    return <DigitString argument='hour' min={1} max={12} allowLeadingZeros={false} />
  }
}
