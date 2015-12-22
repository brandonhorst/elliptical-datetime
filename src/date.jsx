/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { DateDuration } from './duration'
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
          <label text='day' showForEmpty>
            <RecursiveDay />
          </label>
        ) : null}

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited category='conjunction' /> : null}
          <label text='day' showForEmpty merge>
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
        <label text='date' showForEmpty>
          <choice>
            <RelativeNamed />
            <RelativeNumbered prepositions={this.props.prepositions} />
            <DayWithYear prepositions={this.props.prepositions} />
            <RelativeAdjacent />
            {this.props.recurse ? <RecursiveDate /> : null }
          </choice>
        </label>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited category='conjunction' /> : null}
          <label text='date' showForEmpty merge>
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
          {this.props.prepositions ? <literal text='on ' optional prefered limited /> : null}
          <label argument={false} text='date' merge showForEmpty>
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

        <label argument={false} text='date' showForEmpty>
          <sequence>
            <choice id='date'>
              <Date nullify prepositions={this.props.prepositions} />
              <TimeOfDayModifier />
              <RelativeWeekday prepositions={this.props.prepositions} />
            </choice>
            <literal text=' ' />
            <TimeOfDay id='impliedTime' />
          </sequence>
        </label>

        <label argument={false} text='date' showForEmpty>
          <DayWithYearAndTimeOfDay />
        </label>

        <label argument={false} text='date' showForEmpty>
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
      <map function={this.getValue.bind(this)}>
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
            <choice>
              <literal text='day' value={{type: 'days'}}  />,
              <literal text='fortnight' value={{type: 'days', multiplier: 14}} />,
              <literal text='week' value={{type: 'days', multiplier: 7}} />,
              <literal text='month' value={{type: 'months'}} />,
              <literal text='year' value={{type: 'years'}} />
            </choice>
          </label>
        </sequence>
      </map>
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
      <map function={this.getValue.bind(this)}>
        <sequence>
          <label text='offset' showForEmpty merge>
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
          </label>
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
    if (!result) return

    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return relativeDate(duration, result.date)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <label text='offset' showForEmpty merge>
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
          </label>
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
    if (!result) return

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
    if (!result) return

    const duration = {[result.type]: result.num * (result.multiplier || 1)}

    return relativeDate(duration)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <sequence>
          <choice id='num'>
            <literal text='next ' value={1} />
            <literal text='last ' value={-1} />
          </choice>
          <label argument={false} text='week, month, year' merge>
            <choice>
              <literal text='week' value={{type: 'days', multiplier: 7}} />
              <literal text='month' value={{type: 'months'}} />
              <literal text='year' value={{type: 'years'}} />
            </choice>
          </label>
        </sequence>
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
              <choice limit={1}> {/* automatically handle past/present/future */}
                <literal text='' value={0} />
                <literal text='' value={1} />
                <literal text='' value={-1} />
              </choice>
              <literal text='last ' value={-1} />
              <literal text='this ' value={0} />
              <list items={['next ', 'this upcoming ']} limit={1} value={1} />
            </choice>
            <label argument={false} text='weekday' id='weekday'>
              <Weekday />
            </label>
          </sequence>
          <sequence>
            <literal text='the ' />
            <label argument={false} text='weekday' id='weekday'>
              <Weekday />
            </label>
            <choice id='distance'>
              <literal text=' after next' value={2} />
              <literal text=' after this' value={1} />
              <literal text=' before this' value={-1} />
              <literal text=' before last' value={-2} />
            </choice>
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
        <DigitString maxLength={2} max={12} min={1} descriptor='mm' />
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
        <DigitString maxLength={2} max={31} min={1} descriptor='dd'/>
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
    if (!result) return

    if (result.year20 != null) {
      return 2000 + parseInt(result.year20, 10)
    } else if (result.year19 != null) {
      return 1900 + parseInt(result.year19, 10)
    } else {
      return parseInt(result.year, 10)
    }
  }

  suppressWhen(input) {
    return /^(|\d|\d{3})$/.test(input)
  }

  describe() {
    return (
      <map function={this.getValue.bind(this)}>
        <label suppressWhen={this.suppressWhen} text='year'>
          <choice limit={1}>
            <sequence>
              <literal text={'\''} />
              <choice merge limit={1}>
                <DigitString minLength={2} maxLength={2} min={0} max={29} id='year20' />
                <DigitString minLength={2} maxLength={2} min={30} max={99} id='year19' />
              </choice>
            </sequence>

            <sequence>
              <literal text='20' decorate />
              <DigitString minLength={2} maxLength={2} min={0} max={29} id='year20' />
            </sequence>

            <sequence>
              <literal text='19' decorate />
              <DigitString minLength={2} maxLength={2} min={0} max={99} id='year19' />
            </sequence>

            <sequence>
              <literal text='20' decorate />
              <DigitString minLength={2} maxLength={2} min={0} max={99} id='year20' />
            </sequence>

            <DigitString minLength={4} maxLength={4} id='year' />
          </choice>
        </label>
      </map>
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
