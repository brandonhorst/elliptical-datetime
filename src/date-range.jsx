/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment-timezone'
import { createElement, Phrase } from 'lacona-phrase'

import { relativeDate } from './helpers'
import { Date } from './date'
import { DateDuration } from './duration'

export class DateRange extends Phrase {
  getValue (result) {
    if (result.duration) {
      return {
        start: result.start,
        end: relativeDate(result.duration, result.start, this.props.timeZone)
      }
    } else {
      return result
    }
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <choice>
          <sequence>
            {this.props.prepositions ? <literal text='from ' optional limited /> : null}
            {this.props._allDay ? <literal text='all day ' optional limited /> : null}
            <Date id='start' timeZone={this.props.timeZone} />
            <list items={[' to ', ' - ', '-']} limit={1} />
            {this.props._allDay ? <literal text='all day ' optional limited /> : null}
            <Date id='end' timeZone={this.props.timeZone} />
          </sequence>
          {this.props._duration ? (
            <sequence>
              {this.props._allDay ? <literal text='all day ' optional limited /> : null}
              <Date id='start' prepositions={this.props.prepositions} timeZone={this.props.timeZone} />
              <literal text=' for ' />
              <DateDuration id='duration' />
            </sequence>
          ) : null}
        </choice>
      </map>
    )
  }
}

DateRange.defaultProps = {
  prepositions: false,
  _duration: true,
  _allDay: false
}
