/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import DateDuration from './date-duration'
import { DigitString, Integer, Ordinal } from 'lacona-phrase-number'
import { TimeOfDay } from './time'
import moment from 'moment'
import Month from './month'
import Weekday from './weekday'
import { absoluteDate, negateDuration, relativeDate, relativeDay, validateDay } from './helpers'

export class Day extends Phrase {
  describe () {
    if (this.props.nullify) return

    return (
      <choice>
        {this.props.recurse ? (
          <argument text='day' showForEmpty>
            <RecursiveDay />
          </argument>
        ) : null}

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited category='conjunction' /> : null}
          <argument text='day' showForEmpty merge>
            <choice>
              <AmbiguousAbsoluteDay />
              <AmbiguousAbsoluteNamedMonth />
            </choice>
          </argument>
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
    if (!result) return true

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
        <argument text='date' showForEmpty>
          <choice>
            <RelativeNamed />
            <RelativeNumbered prepositions={this.props.prepositions} />
            <DayWithYear prepositions={this.props.prepositions} />
            <RelativeAdjacent />
            {this.props.recurse ? <RecursiveDate /> : null }
          </choice>
        </argument>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited category='conjunction' /> : null}
          <argument text='date' showForEmpty merge>
            <choice>
              <RelativeWeekday />
              <AbsoluteDay />
            </choice>
          </argument>
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
          {this.props.prepositions ? <literal text='on ' optional prefered limited /> : null}
          <placeholder text='date' merge showForEmpty>
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
          </placeholder>
        </sequence>

        <placeholder text='date' showForEmpty>
          <sequence>
            <choice id='date'>
              <Date nullify prepositions={this.props.prepositions} />
              <TimeOfDayModifier />
              <RelativeWeekday prepositions={this.props.prepositions} />
            </choice>
            <literal text=' ' />
            <TimeOfDay id='impliedTime' />
          </sequence>
        </placeholder>

        <placeholder text='date' showForEmpty>
          <DayWithYearAndTimeOfDay />
        </placeholder>

        <placeholder text='date' showForEmpty>
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
        </placeholder>
      </choice>
    )
  }
}

DateWithTimeOfDay.defaultProps = {
  recurse: true,
  prepositions: false
}

class DayWithYear extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.duration) {
      return relativeDate(result.duration, result.day)
    } else {
      return absoluteDate(_.assign({year: result.year}, result.day))
    }
  }

  describe () {
    return (
      <sequence>
        <Day prepositions={this.props.prepositions} id='day' recurse={false} />
        <choice merge>
          <choice id='duration' limit={1}>
            <literal text='' value={{}} />
            <literal text='' value={{years: 1}} />
            <literal text='' value={{years: -1}} />
          </choice>
          <sequence>
            <list items={[', ', ' in ', ' ']} category='conjunction' limit={1} />
            <Year id='year' />
          </sequence>
        </choice>
      </sequence>
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
      <sequence>
        <Day id='day' prepositions={this.props.prepositions} />
        <literal text=' ' />
        <TimeOfDay id='impliedTime' />
        <sequence optional merge>
          <list items={[', ', ' in ', ' ']} category='conjunction' limit={1} />
          <Year id='year' />
        </sequence>
      </sequence>
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
    <sequence>
        <placeholder text='number'>
          <literal text='the ' />
        </placeholder>
        <placeholder text='time period' merge>
          <choice>
            <literal text='day' value={{type: 'days'}}  />,
            <literal text='fortnight' value={{type: 'days', multiplier: 14}} />,
            <literal text='week' value={{type: 'days', multiplier: 7}} />,
            <literal text='month' value={{type: 'months'}} />,
            <literal text='year' value={{type: 'years'}} />
          </choice>
        </placeholder>
      </sequence>
    )
  }
}


class RecursiveDay extends Phrase {
  getValue(result) {
    if (!result || !result.day) return

    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeDay(duration, result.day)
  }

  describe() {
    return (
      <sequence>
        <argument text='offset' showForEmpty merge>
          <sequence>
            <choice id='duration'>
              <ExtraDateDuration />
              <DateDuration />
            </choice>
            <list merge id='direction' items={[
              {text: ' before ', value: -1},
              {text: ' after ', value: 1},
              {text: ' from ', value: 1}
            ]} limit={2} />
          </sequence>
        </argument>
        <placeholder text='day' id='day'>
          <Day recurse={false} prepositions={false} />
        </placeholder>
      </sequence>
    )
  }
}

class RecursiveDate extends Phrase {
  getValue(result) {
    if (!result) return

    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeDate(duration, result.date)
  }

  describe() {
    return (
      <sequence>
        <argument text='offset' showForEmpty merge>
          <sequence>
            <choice id='duration'>
              <ExtraDateDuration />
              <DateDuration />
            </choice>
            <list merge id='direction' items={[
              {text: ' before ', value: -1},
              {text: ' after ', value: 1},
              {text: ' from ', value: 1}
            ]} limit={2} />
          </sequence>
        </argument>
        <Date id='date' recurse={false} prepositions={false} />
      </sequence>
    )
  }
}

class RelativeNamed extends Phrase {
  getValue (result) {
    return relativeDate(result)
  }

  describe () {
    return <list items={[
      {text: 'today', value: {days: 0}},
      {text: 'tomorrow', value: {days: 1}},
      {text: 'yesterday', value: {days: -1}},
      {text: 'now', value: {days: 0}},
      {text: 'right now', value: {days: 0}}
    ]} limit={3} />
  }
}

class TimeOfDayModifier extends Phrase {
  getValue (result) {
    return relativeDate(result)
  }

  describe () {
    return <list items={[
      {text: 'this', value: {days: 0}},
      {text: 'tomorrow', value: {days: 1}},
      {text: 'yesterday', value: {days: -1}}
    ]} />
  }
}

class RelativeNumbered extends Phrase {
  getValue(result) {
    if (!result) return

    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeDate(duration)
  }

  describe() {
    return (
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
    )
  }
}

class RelativeAdjacent extends Phrase {
  getValue(result) {
    if (!result) return

    const duration = {[result.type]: result.num * (result.multiplier || 1)}

    return relativeDate(duration)
  }

  describe() {
    return (
    <sequence>
        <choice id='num'>
          <literal text='next ' value={1} />
          <literal text='last ' value={-1} />
        </choice>
        <placeholder text='week, month, year' merge>
          <choice>
            <literal text='week' value={{type: 'days', multiplier: 7}} />
            <literal text='month' value={{type: 'months'}} />
            <literal text='year' value={{type: 'years'}} />
          </choice>
        </placeholder>
      </sequence>
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
    <choice>
        <sequence>
          <choice id='distance'>
            <choice limit={1}> {/* automatically handle past/present/future */}
              <literal text='' value={0} />
              <literal text='' value={1} />
              <literal text='' value={-1} />
            </choice>
            <literal text='last ' value={-1} />
            <literal text='this ' value={0} />
            <list items={['next ', 'this upcoming ']} limit={1} value={1} />
          </choice>
          <placeholder text='weekday' id='weekday'>
            <Weekday />
          </placeholder>
        </sequence>
        <sequence>
          <literal text='the ' />
          <placeholder text='weekday' id='weekday'>
            <Weekday />
          </placeholder>
          <choice id='distance'>
            <literal text=' after next' value={2} />
            <literal text=' after this' value={1} />
            <literal text=' before this' value={-1} />
            <literal text=' before last' value={-2} />
          </choice>
        </sequence>
      </choice>
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
    return <DigitString maxLength={2} max={12} min={1} descriptor='mm' />
  }
}

class DayNumber extends Phrase {
  getValue (result) {
    return parseInt(result, 10)
  }

  describe () {
    return <DigitString maxLength={2} max={31} min={1} descriptor='dd'/>
  }
}

class AbsoluteDay extends Phrase {
  getValue (result) {
    return absoluteDate(result)
  }

  describe () {
    return (
      <filter function={validateDay}>
        <sequence>
          <AmbiguousAbsoluteDay merge />
          <list items={['/']} limit={1} />
          <Year id='year' />
        </sequence>
      </filter>
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
    if (!result) return

    if (result.year20 != null) {
      return 2000 + parseInt(result.year20, 10)
    } else if (result.year19 != null) {
      return 1900 + parseInt(result.year19, 10)
    } else {
      return parseInt(result.year, 10)
    }
  }

  displayWhen(input) {
    return /^(|\d|\d{3})$/.test(input)
  }

  describe() {
    return (
      <argument displayWhen={this.displayWhen} text='year'>
        <choice limit={1}>
          <sequence>
            <literal text={'\''} />
            <choice merge limit={1}>
              <DigitString minLength={2} maxLength={2} min={0} max={29} id='year20' />
              <DigitString minLength={2} maxLength={2} min={30} max={99} id='year19' />
            </choice>
          </sequence>

          <sequence>
            <decorator text='20' />
            <DigitString minLength={2} maxLength={2} min={0} max={29} id='year20' />
          </sequence>

          <sequence>
            <decorator text='19' />
            <DigitString minLength={2} maxLength={2} min={0} max={99} id='year19' />
          </sequence>

          <sequence>
            <decorator text='20' />
            <DigitString minLength={2} maxLength={2} min={0} max={99} id='year20' />
          </sequence>

          <DigitString minLength={4} maxLength={4} id='year' />
        </choice>
      </argument>
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
              <Integer max={31} min={1} />
              <Ordinal max={31} />
            </choice>
          </sequence>
          <sequence>
            <literal text='the ' />
            <choice id='day' limit={1}>
              <Integer max={31} min={1} />
              <Ordinal max={31} />
            </choice>
            <list items={[' of ', ' ']} limit={1} />
            <Month id='month' />
          </sequence>
        </choice>
      </filter>
    )
  }
}
