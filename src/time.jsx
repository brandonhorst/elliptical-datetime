/** @jsx createElement */

import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import {DigitString, Integer} from 'lacona-phrase-number'
import TimeDuration from './time-duration'

export default class Time extends Phrase {
  getValue (result) {
    if (!result) return

    if (_.isDate(result)) {
      return result
    } else if (result.relative) {
      const date = new Date()
      if (!_.isUndefined(result.relative.hours)) date.setHours(date.getHours() + result.relative.hours)
      if (!_.isUndefined(result.relative.minutes)) date.setMinutes(date.getMinutes() + result.relative.minutes)

      return date
    } else if (result.fancy) {
      const date = new Date()
      date.setHours(result.fancy.hour, result.fancy.minute || 0, 0, 0)
      return date
    }
  }
}
Time.translations = [{
  langs: ['en_US', 'default'],
  describe () {
    return (
      <sequence>
        {this.props.includeAt ? <literal text='at ' optional={true} preferred={true} limited={true} /> : null}
        <argument text='time' showForEmpty={true} merge={true}>
          <choice>
            <literal text='midnight' id='hour' value={0} />
            <literal text='noon' id='hour' value={12} />
            <AbsTime minutes={true}  />
            <AbsTimeFancy id='fancy' />
            <RelativeTime id='relative' />
          </choice>
        </argument>
      </sequence>
    )
  }
}]

Time.defaultProps = {
  includeAt: false
}
class RelativeTime extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.direction < 0) {
      return _.mapValues(result.duration, num => -num)
    } else {
      return result.duration
    }
  }

  describe () {
    return (
      <choice>
        <sequence>
          <literal text='in ' id='direction' value={1} />
          <TimeDuration id='duration' />
        </sequence>
        <sequence>
          <TimeDuration id='duration' />
          <literal text=' from now' id='direction' value={1} />
        </sequence>
        {this.props.allowPast ? (
          <sequence>
            <TimeDuration id='duration' />
            <literal text=' ago' id='direction' value={-1} />
          </sequence>
        ) : null}
      </choice>
    )
  }
}

class AbsTimeFancy extends Phrase {
  getValue (result) {
    if (!result) return
    const date = new Date()

    if (result.direction > 0) {
      date.setHours(result.hour, result.minutes, 0, 0)
    } else {
      const hour = result.hour === 0 ? 23 : result.hour - 1
      const minutes = 60 - result.minutes
      date.setHours(hour, minutes, 0, 0)
    }
    return date
  }

  describe () {
    return (
      <sequence>
        <placeholder text='number' showForEmpty={true} id='minutes'>
          <choice>
            <literal text='quarter' value={15} />
            <literal text='half' value={30}/>
            <sequence>
              <Integer min={1} max={59} merge={true} />
              <literal optional={true} text=' minutes'/>
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
            <literal text=' from '/>
          </choice>
        </choice>
        <placeholder text='some hour' merge={true}>
          <choice>
            <AbsTime minutes={false} />
            <literal text='midnight' value={{hour: 0, minute: 0}} />
            <literal text='noon' value={{hour :12, minute: 0}} />
          </choice>
        </placeholder>
      </sequence>
    )
  }
}


class AbsTime extends Phrase {
  getValue (result) {
    let hour = parseInt(result.hour)

    if (result.ampm) {
      hour = result.ampm === 'am' ? (hour === 12 ? 0 : hour) : hour + 12
    }

    const minute = result.minutes ? parseInt(result.minutes, 10) : 0

    return {hour, minute}
  }

  describe () {
    return (
      <sequence>
        <DigitString descriptor='hour' min={1} max={12} allowLeadingZeros={false} id='hour' />
        {this.props.minutes ?
          <sequence id='minutes' optional={true} preffered={false}>
            <literal text=':' />
            <Minutes merge={true} />
          </sequence> :
          null
        }
        <choice id='ampm'>
          <list items={[' am', 'am', ' a', 'a', ' a.m.', 'a.m.', ' a.m', 'a.m']} value='am' limit={1} />
          <list items={[' pm', 'pm', ' p', 'p', ' p.m.', 'p.m.', ' p.m', 'p.m']} value='pm' limit={1} />
        </choice>
      </sequence>
    )
  }
}
AbsTime.defaultProps = {minutes: true}

class Minutes extends Phrase {
  describe () {
    return <DigitString descriptor='minutes' max={59} minLength={2} maxLength={2} />
  }
}
