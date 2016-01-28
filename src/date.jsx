/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import moment from 'moment'

import { DateDuration } from './duration'
import { DigitString, Integer, Ordinal } from 'lacona-phrase-number'
import { TimeOfDay } from './time'
import { Month } from './month'
import { Weekday } from './weekday'
import { absoluteDate, join, negateDuration, relativeDate, relativeDay, validateDay } from './helpers'

export class Day extends Phrase {
  describe () {
    if (this.props.nullify) return

    return (
      <choice>
        {this.props.recurse ? (
          <label text='day'>
            <RecursiveDay />
          </label>
        ) : null}

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional preferred limited category='conjunction' /> : null}
          <label text='day' merge>
            <choice>
              <AmbiguousAbsoluteDay />
              <AmbiguousAbsoluteNamedMonth />
            </choice>
          </label>
        </sequence>
      </choice>
    )
  }
}

Day.defaultProps = {
  recurse: true
}

export class Date extends Phrase {
  validate (result) {
    if (!this.props.past && moment({}).isAfter(result)) {
      return false
    }
    if (!this.props.future && moment({}).isBefore(result)) {
      return false
    }

    return true
  }

  describe() {
    if (this.props.nullify) return

    return (
      <choice>
        <label text='date'>
          <choice>
            <RelativeNamed />
            <RelativeNumbered prepositions={this.props.prepositions} />
            <DayWithYear prepositions={this.props.prepositions} />
            <RelativeAdjacent />
            {this.props.recurse ? <RecursiveDate /> : null }
          </choice>
        </label>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional preferred limited category='conjunction' /> : null}
          <label text='date' merge>
            <choice>
              <RelativeWeekday />
              <AbsoluteDay />
            </choice>
          </label>
        </sequence>
      </choice>
    )
  }
}

Date.defaultProps = {
  recurse: true,
  prepositions: false,
  nullify: false,
  past: true,
  future: true
}

export class DateWithTimeOfDay extends Phrase {
  describe () {
    return (
      <choice>
        <sequence>
          {this.props.prepositions ? <literal text='on ' optional preferred limited /> : null}
          <label text='date and time' merge>
            <sequence>
              <literal text='the ' />
              <TimeOfDay id='impliedTime' />
              <literal text=' of ' />
              <choice id='date'>
                <Date nullify />
                <RelativeWeekday />
                <RelativeAdjacent />
                <RelativeNumbered />
                <AbsoluteDay />
                <DayWithYear />
                {this.props.recurse ? <RecursiveDate /> : null}
              </choice>
            </sequence>
          </label>
        </sequence>
        
        <label text='date and time'>
          <sequence>
            <choice id='date'>
              <Date nullify prepositions={this.props.prepositions} />
              <TimeOfDayModifier />
              <RelativeWeekday />
            </choice>
            <literal text=' ' />
            <TimeOfDay id='impliedTime' />
          </sequence>
        </label>
        
        <label text='date and time'>
          <NamedDateWithTimeOfDay />
        </label>

        <label text='date and time'>
          <DayWithYearAndTimeOfDay />
        </label>

        <label text='date and time'>
          <sequence>
            <choice id='date'>
              <Date nullify prepositions={this.props.prepositions} />
              <DayWithYear prepositions={this.props.prepositions} />
              <RelativeNumbered prepositions={this.props.prepositions} />
              {this.props.recurse ? <RecursiveDate prepositions={this.props.prepositions} /> : null}
            </choice>
            <literal text=' in the ' />
            <TimeOfDay id='impliedTime' />
          </sequence>
        </label>
      </choice>
    )
  }
}

DateWithTimeOfDay.defaultProps = {
  recurse: true,
  prepositions: false
}

class NamedDateWithTimeOfDay extends Phrase {
  getValue () {
    return {date: relativeDate({hour: 0}), impliedTime: {default: 20, range: [12, 24]}}
  }

  describe () {
    return (
      <map function={this.getValue}>
        <literal text='tonight' />
      </map>
    )
  }
}

class DayWithYear extends Phrase {
  getValue (result) {
    if (result.duration) {
      return relativeDate(result.duration, result.day)
    } else {
      return absoluteDate(_.assign({year: result.year}, result.day))
    }
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <Day prepositions={this.props.prepositions} id='day' recurse={false} />
          <choice merge>
            <list id='duration' limit={1} items={[
              {text: '', value: {}},
              {text: '', value: {years: 1}},
              {text: '', value: {years: -1}}
            ]} />
            <sequence>
              <list items={[', ', ' in ', ' ']} category='conjunction' limit={1} />
              <Year id='year' />
            </sequence>
          </choice>
        </sequence>
      </map>
    )
  }
}

class DayWithYearAndTimeOfDay extends Phrase {
  getValue (result) {
    const absolute = _.assign({year: result.year}, result.day)
    return {date: absoluteDate(absolute), impliedTime: result.impliedTime}
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <Day id='day' prepositions={this.props.prepositions} />
          <literal text=' ' />
          <TimeOfDay id='impliedTime' />
          <sequence optional merge>
            <list items={[', ', ' in ', ' ']} category='conjunction' limit={1} />
            <Year id='year' />
          </sequence>
        </sequence>
      </map>
    )
  }
}

DayWithYearAndTimeOfDay.defaultProps = {
  prepositions: false
}

class ExtraDateDuration extends Phrase {
  getValue({type, multiplier = 1 }) {
    return {[type]: multiplier}
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <label argument={false} text='number'>
            <literal text='the ' />
          </label>
          <label argument={false} text='time period' merge>
            <list items={[
              {text: 'day', value: {type: 'days'}},
              {text: 'fortnight', value: {type: 'days', multiplier: 14}},
              {text: 'week', value: {type: 'days', multiplier: 7}},
              {text: 'month', value: {type: 'months'}},
              {text: 'year', value: {type: 'years'}}
            ]} />
          </label>
        </sequence>
      </map>
    )
  }
}


class RecursiveDay extends Phrase {
  getValue(result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeDay(duration, result.day)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <label text='offset' merge>
            <sequence>
              <choice id='duration'>
                <ExtraDateDuration />
                <DateDuration />
              </choice>
              <list merge id='direction' items={[
                {text: ' before', value: -1},
                {text: ' after', value: 1},
                {text: ' from', value: 1}
              ]} limit={2} />
            </sequence>
          </label>
          <literal text=' ' />
          <label argument={false} text='day' id='day'>
            <Day recurse={false} prepositions={false} />
          </label>
        </sequence>
      </map>
    )
  }
}

class RecursiveDate extends Phrase {
  getValue(result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeDate(duration, result.date)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <label text='offset' merge>
            <sequence>
              <choice id='duration'>
                <ExtraDateDuration />
                <DateDuration />
              </choice>
              <list merge id='direction' items={[
                {text: ' before', value: -1},
                {text: ' after', value: 1},
                {text: ' from', value: 1}
              ]} limit={2} />
            </sequence>
          </label>
          <literal text=' ' />
          <Date id='date' recurse={false} prepositions={false} />
        </sequence>
      </map>
    )
  }
}

class RelativeNamed extends Phrase {
  getValue (result) {
    return relativeDate(result)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <list items={[
          {text: 'today', value: {days: 0}},
          {text: 'tomorrow', value: {days: 1}},
          {text: 'yesterday', value: {days: -1}},
          {text: 'now', value: {days: 0}},
          {text: 'right now', value: {days: 0}}
        ]} limit={3} />
      </map>
    )
  }
}

class TimeOfDayModifier extends Phrase {
  getValue (result) {
    return relativeDate(result)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <list items={[
          {text: 'this', value: {days: 0}},
          {text: 'tomorrow', value: {days: 1}},
          {text: 'yesterday', value: {days: -1}}
        ]} />
      </map>
    )
  }
}

class RelativeNumbered extends Phrase {
  getValue(result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeDate(duration)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <choice>
          {this.props.prepositions ? (
            <sequence>
              <literal text='in ' id='direction' value={1} />
              <DateDuration id='duration' />
            </sequence>
          ) : null}
          <sequence>
            <DateDuration id='duration' />
            <literal text=' ago' id='direction' value={-1} />
          </sequence>
        </choice>
      </map>
    )
  }
}

class RelativeAdjacent extends Phrase {
  getValue(result) {
    const duration = {[result.type]: result.num * (result.multiplier || 1)}

    return relativeDate(duration)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <label text='time period'>
          <sequence>
            <list id='num' items={[
              {text: 'next ', value: 1},
              {text: 'last ', value: -1}
            ]} />
            <label argument={false} text='time period' merge>
              <list items={[
                {text: 'week', value: {type: 'days', multiplier: 7}},
                {text: 'month', value: {type: 'months'}},
                {text: 'year', value: {type: 'years'}}
              ]} />
            </label>
          </sequence>
        </label>
      </map>
    )
  }
}

class RelativeWeekday extends Phrase {
  getValue(result) {
    const day = ((result.distance) * 7) + result.weekday

    return moment().day(day).toDate()
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <choice>
          <sequence>
            <choice id='distance'>
              <list items={[
                {text: '', value: 0},
                {text: '', value: 1},
                {text: '', value: -1}
              ]} limit={1} /> {/* automatically handle past/present/future */}
              <list items={[
                {text: 'last ', value: -1},
                {text: 'this ', value: 0}
              ]} />
              <list items={['next ', 'this upcoming ']} limit={1} value={1} />
            </choice>
            <Weekday id='weekday' />
          </sequence>
          <sequence>
            <literal text='the ' />
            <label text='relative weekday' merge>
              <sequence>
                <Weekday id='weekday' />
                <list id='distance' items={[
                  {text: ' after next', value: 2},
                  {text: ' after this', value: 1},
                  {text: ' before this', value: -1},
                  {text: ' before last', value: -2}
                ]} />
              </sequence>
            </label>
          </sequence>
        </choice>
      </map>
    )
  }
}

function leapYear (year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)
}

class MonthNumber extends Phrase {
  getValue (result) {
    return parseInt(result, 10) - 1
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <DigitString maxLength={2} max={12} min={1} argument='mm' />
      </map>
    )
  }
}

class DayNumber extends Phrase {
  getValue (result) {
    return parseInt(result, 10)
  }

  describe () {
    return (
      <map function={this.getValue.bind(this)}>
        <DigitString maxLength={2} max={31} min={1} argument='dd'/>
      </map>
    )
  }
}

class AbsoluteDay extends Phrase {
  describe () {
    return (
      <map function={absoluteDate}>
        <filter function={validateDay}>
          <sequence>
            <AmbiguousAbsoluteDay merge />
            <list items={['/']} limit={1} />
            <Year id='year' />
          </sequence>
        </filter>
      </map>
    )
  }
}

class AmbiguousAbsoluteDay extends Phrase {
  describe () {
    return (
      <filter function={validateDay}>
        <sequence>
          <MonthNumber id='month' />
          <list items={['/']} limit={1} />
          <DayNumber id='day' />
        </sequence>
      </filter>
    )
  }
}

class Year extends Phrase {
  getValue(result) {
    if (result.year20 != null) {
      return 2000 + parseInt(result.year20, 10)
    } else if (result.year19 != null) {
      return 1900 + parseInt(result.year19, 10)
    } else {
      return parseInt(result.year, 10)
    }
  }

  suppressWhen(input) {
    return /^('\d|\d|\d{3})$/.test(input)
  }

  describe() {
    return (
      <label suppressWhen={this.suppressWhen} text='year'>
        <map function={this.getValue.bind(this)}>
          <choice limit={1}>
            <sequence>
              <literal text={'\''} />
              <choice merge limit={1}>
                <DigitString minLength={2} maxLength={2} min={0} max={29} id='year20' />
                <DigitString minLength={2} maxLength={2} min={30} max={99} id='year19' />
              </choice>
            </sequence>

            <sequence>
              <literal text='20' decorate allowInput={false} />
              <DigitString minLength={2} maxLength={2} min={0} max={29} id='year20' />
            </sequence>

            <sequence>
              <literal text='19' decorate allowInput={false} />
              <DigitString minLength={2} maxLength={2} min={0} max={99} id='year19' />
            </sequence>

            <sequence>
              <literal text='20' decorate allowInput={false} />
              <DigitString minLength={2} maxLength={2} min={0} max={99} id='year20' />
            </sequence>

            <DigitString minLength={4} maxLength={4} id='year' />
          </choice>
        </map>
      </label>
    )
  }
}

class AmbiguousAbsoluteNamedMonth extends Phrase {
  describe() {
    return (
      <filter function={validateDay}>
        <choice>
          <sequence>
            <Month id='month' />
            <list items={[' ', ' the ']} limit={1} />
            <choice id='day' limit={1}>
              <Integer max={31} min={1} limit={1} />
              <Ordinal max={31} limit={1} />
            </choice>
          </sequence>
          <sequence>
            <literal text='the ' />
            <choice id='day' limit={1}>
              <Integer max={31} min={1} limit={1} />
              <Ordinal max={31} limit={1} />
            </choice>
            <list items={[' of ', ' ']} limit={1} />
            <Month id='month' />
          </sequence>
        </choice>
      </filter>
    )
  }
}
