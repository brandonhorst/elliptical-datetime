/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import DateDuration from './date-duration'
import { DigitString, Integer, Ordinal } from 'lacona-phrase-number'
import Month from './month'
import Weekday from './weekday'

export class DatePhrase extends Phrase {
  describe () {
    return <InternalDate {...this.props} />
  }
}

class TimeOfDay extends Phrase {
  describe () {
    return (
    <placeholder text='time of day'>
      <list items={[
        {text: 'morning', value: {default: 8, range: [0, 12]}},
        {text: 'afternoon', value: {default: 12, range: [12, 24]}},
        {text: 'evening', value: {default: 17, range: [12, 24]}},
        {text: 'night', value: {default: 20, range: [12, 24]}}
      ]} />
      </placeholder>
    )
  }
}

export class DateWithTimeOfDay extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.relative) {
      return {date: dateFromRelativeComponents(result.relative), impliedTime: result.impliedTime}
    } else {
      return result
    }
  }

  describe () {
    return (
      <choice>
        <sequence>
          {this.props.prepositions ? <literal text='on ' optional={true} prefered={true} limited={true} /> : null}
          <argument text='date' merge>
            <sequence>
              <literal text='the ' />
              <TimeOfDay id='impliedTime' />
              <literal text=' of ' />
              <DatePhrase id='date' nullify={true} />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              <DatePhrase id='date' nullify={true} prepositions={this.props.prepositions} />
              <literal text=' ' />
              <TimeOfDay id='impliedTime' prepositions />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              <NamedDay useThis id='relative' />
              <literal text=' ' />
              <TimeOfDay id='impliedTime' />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional={true} prefered={true} limited={true} /> : null}
          <argument text='date' showForEmpty merge>
            <sequence>
              <RelativeWeekday id='date' />
              <literal text=' ' />
              <TimeOfDay id='impliedTime' />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional={true} prefered={true} limited={true} /> : null}
          <argument text='date' showForEmpty merge>
            <sequence>
              <literal text='the ' />
              <TimeOfDay id='impliedTime' />
              <literal text=' of ' />
              <RelativeWeekday id='date' />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              <literal text='the ' />
              <TimeOfDay id='impliedTime' />
              <literal text=' of ' />
              <RelativeAdjacent id='relative' />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              <literal text='the ' />
              <TimeOfDay id='impliedTime' />
              <literal text=' of ' />
              <RelativeNumbered id='relative' prepositions={this.props.prepositions} />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              <RelativeNumbered id='relative' prepositions={this.props.prepositions} />
              <literal text=' in the ' />
              <TimeOfDay id='impliedTime' />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional={true} prefered={true} limited={true} /> : null}
          <argument text='date' showForEmpty merge>
            <sequence>
              <literal text='the ' />
              <TimeOfDay id='impliedTime' />
              <literal text=' of ' />
              <choice id='date'>
                <AbsoluteDay />
                <NamedMonthAbsolute />
              </choice>
            </sequence>
          </argument>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              <literal text='the ' />
              <TimeOfDay id='impliedTime' />
              <literal text=' of ' />
              {this.props.recurse ? <RecursiveDay id='date' /> : null }
            </sequence>
          </argument>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              {this.props.recurse ? <RecursiveDay id='date' /> : null }
              <literal text=' in the ' />
              <TimeOfDay id='impliedTime' />
            </sequence>
          </argument>
        </sequence>
      </choice>
    )
  }
}

DateWithTimeOfDay.defaultProps = {
  recurse: true,
  prepositions: false
}

function dateFromRelativeComponents (components) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  if (!_.isUndefined(components.days)) date.setDate(date.getDate() + components.days)
  if (!_.isUndefined(components.months)) date.setMonth(date.getMonth() + components.months)
  if (!_.isUndefined(components.years)) date.setFullYear(date.getFullYear() + components.years)

  return date
}

class InternalDate extends Phrase {
  getValue(result) {
    if (!result) return

    if (_.isDate(result)) {
      return result
    } else if (result.relative) {
      return dateFromRelativeComponents(result.relative)
    }
  }

  describe() {
    if (this.props.nullify) return null
    return (
      <choice>
        <argument text='date' showForEmpty>
          <choice>
            <NamedDay id='relative' />
            <RelativeNumbered id='relative' prepositions={this.props.prepositions} />
            <RelativeAdjacent id='relative' />
            {this.props.recurse ? <RecursiveDay /> : null }
          </choice>
        </argument>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited category='conjunction' /> : null}
          <argument text='date' showForEmpty merge>
            <choice>
              <RelativeWeekday />
              <AbsoluteDay />
              <NamedMonthAbsolute />
            </choice>
          </argument>
        </sequence>
      </choice>
    )
  }
}
InternalDate.defaultProps = {
  recurse: true,
  prepositions: false,
  nullify: false
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
        <placeholder text='time period' merge={true}>
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
    if (!result || !result.date) return

    let inDate = result.date
    if (result.date === 'now') {
      inDate = new Date()
      inDate.setHours(0, 0, 0, 0)
    }

    const outDate = new Date(inDate.getTime())

    if (result.years) {
      outDate.setFullYear((result.years * result.direction) + inDate.getFullYear())
    }

    if (result.months) {
      outDate.setMonth((result.months * result.direction) + inDate.getMonth())
    }

    if (result.days) {
      outDate.setDate((result.days * result.direction) + inDate.getDate())
    }

    return outDate
  }

  describe() {
    return (
    <sequence>
        <argument text='offset' showForEmpty={true} merge={true}>
          <sequence>
            <choice merge={true}>
              <ExtraDateDuration />
              <DateDuration />
            </choice>
            <list merge={true} id='direction' items={[
              {text: ' before ', value: -1},
              {text: ' after ', value: 1},
              {text: ' from ', value: 1}
            ]} limit={2} />
          </sequence>
        </argument>
        <placeholder text='date' id='date'>
          <choice>
            <literal text='now' value='now' />
            <DatePhrase recurse={false} prepositions={false} />
          </choice>
        </placeholder>
      </sequence>
    )
  }
}

class NamedDay extends Phrase {
  describe() {
    return <list items={[
      {text: this.props.useThis ? 'this' : 'today', value: {days: 0}},
      {text: 'tomorrow', value: {days: 1}},
      {text: 'yesterday', value: {days: -1}}
    ]} />
  }
}

NamedDay.defaultProps = {
  useThis: false
}

class RelativeNumbered extends Phrase {
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
        {this.props.prepositions ?
      <sequence>
            <literal text='in ' id='direction' value={1} />
            <DateDuration id='duration' />
          </sequence>
      : null}
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

    return {[result.type]: result.num * (result.multiplier || 1)}
  }

  describe() {
    return (
    <sequence>
        <choice id='num'>
          <literal text='next ' value={1} />
          <literal text='last ' value={-1} />
        </choice>
        <placeholder text='week, month, year' merge={true}>
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
    const returnDate = new Date()
    const currentDay = returnDate.getDay()
    let distance
    if (result.distance != null) {
      distance = result.weekday - currentDay + (7 * result.distance)
    } else {
      distance = (result.weekday + (7 - currentDay)) % 7
    }
    returnDate.setDate(returnDate.getDate() + distance)
    return returnDate
  }

  describe() {
    return (
    <choice>
        <sequence>
          <choice id='distance'>
            <literal text='' value={null} />
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

class AbsoluteDay extends Phrase {
  getValue(result) {
    let year

    if (result.year) {
      if (result.year.length === 2) {
        const partialYear = parseInt(result.year, 10)
        if (partialYear > 29) {
          year = 1900 + partialYear
        } else {
          year = 2000 + partialYear
        }
      } else {
        year = parseInt(result.year, 10)
      }
    } else {
      year = new Date().getFullYear()
    }

    const month = parseInt(result.month, 10) - 1
    const day = parseInt(result.day, 10)
    return new Date(year, month, day, 0, 0, 0, 0)
  }

  // this is interesting, because the user must be able to specify Feburary 29 if they have not specified a year, and then it must be validated by the year. So use a leap year (2012)
  filter(result) {
    if (_.isUndefined(result) || _.isUndefined(result.month) || _.isUndefined(result.day)) return true

    const year = _.isUndefined(result.year) || _.isEqual(result.year, {}) ? 2012 : parseInt(result.year, 10)
    const month = parseInt(result.month, 10) - 1
    const day = parseInt(result.day, 10)
    const date = new Date(year, month, day, 0, 0, 0, 0)
    return date.getMonth() === month
  }

  describe() {
    return (
    <sequence>
        <DigitString maxLength={2} descriptor='mm' id='month' />
        <list items={['/', '-', '.']} limit={1} />
        <DigitString maxLength={2} max={31} descriptor='dd' id='day' />
        <sequence optional={true} merge={true}>
          <list items={['/', '-', '.']} limit={1} />
          <Year id='year' />
        </sequence>
      </sequence>
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
            <decorator text='20' />
            <DigitString minLength={2} maxLength={2} min={0} max={29} id='year20' />
          </sequence>
          <sequence>
            <decorator text='19' />
            <DigitString minLength={2} maxLength={2} min={30} max={99} id='year19' />
          </sequence>
          <DigitString minLength={4} maxLength={4} id='year' />
        </choice>
      </argument>
    )
  }
}

class NamedMonthAbsolute extends Phrase {
  getValue(result) {
    const year = _.isUndefined(result.year) ? new Date().getFullYear() : parseInt(result.year, 10)
    return new Date(year, result.month, result.day, 0, 0, 0, 0)
  }

  // this is interesting, because the user must be able to specify Feburary 29 if they have not specified a year, and then it must be validated by the year. So use a leap year (2012)
  filter(result) {
    if (_.isUndefined(result) || _.isUndefined(result.month) || _.isUndefined(result.day)) return true
    const year = _.isUndefined(result.year) || _.isEqual(result.year, {}) ? 2012 : parseInt(result.year, 10)
    const date = new Date(year, result.month, result.day, 0, 0, 0, 0)
    return date.getMonth() === result.month
  }

  describe() {
    return (
    <choice>
        <sequence>
          <Month id='month' />
          <list items={[' ', ' the ']} limit={1} />
          <choice id='day' limit={1}>
            <Integer max={31} min={1} />
            <Ordinal max={31} />
          </choice>
          <sequence id='year' optional={true} preffered={false}>
            <list items={[', ', ' ']} limit={1} />
            <DigitString descriptor='year' max={9999} allowLeadingZeros={false} merge={true} />
          </sequence>
        </sequence>
        <sequence>
          <literal text='the ' />
          <choice id='day' limit={1}>
            <Integer max={31} min={1} />
            <Ordinal max={31} />
          </choice>
          <list items={[' of ', ' ']} limit={1} />
          <Month id='month' />
          <sequence id='year' optional={true} preffered={false}>
            <list items={[', ', ' ']} limit={1} />
            <DigitString descriptor='year' max={9999} allowLeadingZeros={false} merge={true} />
          </sequence>
        </sequence>
      </choice>
    )
  }
}
