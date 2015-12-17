/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import { createElement, Phrase } from 'lacona-phrase'

import { TimeDuration } from './duration'
import { Time } from './time'

export class TimeRange extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.start && result.duration) {
      const startDate = moment.utc(result.start)
      const endDate = moment(startDate).add(moment.duration(result.duration))
      const startDay = moment(startDate).startOf('day')
      const endDay = moment(endDate).startOf('day')
      const dayOffset = endDay.diff(startDay, 'days')
      const end = {hour: endDate.hour(), minute: endDate.minute(), second: endDate.second()}
      return {start: result.start, end, dayOffset}
    }

    if (result.start && result.end) {
      const dayOffset = moment(result.end).diff(result.start, 'ms') < 0 ? 1 : 0
      return {start: result.start, end: result.end, dayOffset}
    }
  }

  validate (result) {
    if (!result || !result.start || !result.end || result.dayOffset == null) return true

    if (result.dayOffset > 0) return true

    const startMoment = moment.utc(result.start)
    return startMoment.isBefore(moment.utc(result.end))
  }

  describe () {
    return (
      <choice>
        <sequence>
          {this.props.prepositions ? <literal text='from ' /> : null}
          <Time id='start' />
          <list items={[' to ', ' - ', '-']} limit={1} />
          <Time id='end' />
        </sequence>

        {this.props._duration ? (
          <sequence>
            <Time id='start' prepositions={this.props.prepositions} />
            <literal text=' for ' />
            <TimeDuration id='duration' max={{hours: 23, minutes: 59, seconds: 59}} />
          </sequence>
        ) : null}
      </choice>
    )
  }
}

TimeRange.defaultProps = {
  prepositions: false,
  _duration: true
}
