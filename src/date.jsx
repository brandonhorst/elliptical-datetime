/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import DateDuration from './date-duration'
import { DigitString, Integer, Ordinal } from 'lacona-phrase-number'
import { TimeOfDay } from './time'
import moment from 'moment'
import Month from './month'
import Weekday from './weekday'

export class Day extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.absolute) {
      return result.absolute
    } else if (result.recursive) {
      return dayFromRelative(result.recursive.duration, result.recursive.day)
    }
  }

  describe () {
    if (this.props.nullify) return

    return (
      <choice>
        {this.props.recurse ? (
          <argument text='day' showForEmpty id='recursive'>
            <RecursiveDay />
          </argument>
        ) : null}

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited category='conjunction' /> : null}
          <argument text='day' id='absolute' showForEmpty merge>
            <choice>
              <AbsoluteDay year={false} />
              <NamedMonthAbsolute />
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

export class DateWithTimeOfDay extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.relative) {
      return {date: dateFromRelative(result.relative), impliedTime: result.impliedTime}
    } else if (result.recursive) {
      return {date: dateFromRelative(result.recursive.duration, result.recursive.date), impliedTime: result.impliedTime}
    } else {
      return result
    }
  }

  describe () {
    return (
      <choice>
        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited /> : null}
          <placeholder text='date' merge>
            <sequence>
              <literal text='the ' />
              <TimeOfDay id='impliedTime' />
              <literal text=' of ' />
              <DatePhrase id='date' nullify />
            </sequence>
          </placeholder>
        </sequence>

        <sequence>
          <placeholder text='date' showForEmpty merge>
            <sequence>
              <DatePhrase id='date' nullify prepositions={this.props.prepositions} />
              <literal text=' ' />
              <TimeOfDay id='impliedTime' prepositions />
            </sequence>
          </placeholder>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              <TimeOfDayModifier id='relative' />
              <literal text=' ' />
              <TimeOfDay id='impliedTime' />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited /> : null}
          <argument text='date' showForEmpty merge>
            <sequence>
              <RelativeWeekday id='date' />
              <literal text=' ' />
              <TimeOfDay id='impliedTime' />
            </sequence>
          </argument>
        </sequence>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited /> : null}
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
          {this.props.prepositions ? <literal text='on ' optional prefered limited /> : null}
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
              {this.props.recurse ? <RecursiveDate id='recursive' /> : null }
            </sequence>
          </argument>
        </sequence>

        <sequence>
          <argument text='date' showForEmpty merge>
            <sequence>
              {this.props.recurse ? <RecursiveDate id='date' /> : null }
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

function dateFromRelative (duration, now = {}) {
  return moment(now).add(moment.duration(duration)).toDate()
}

function dayFromRelative(duration, now = {}) {
  const newMoment = moment(now).year(2002).add(moment.duration(duration))
  return {month: newMoment.month(), day: newMoment.date()}
}

export class DatePhrase extends Phrase {
  getValue(result) {
    if (!result || _.isEmpty(result)) return

    if (result.absolute) {
      return moment(result.absolute).toDate()
    } else if (result.relative) {
      return dateFromRelative(result.relative)
    } else if (result.recursive) {
      return dateFromRelative(result.recursive.duration, result.recursive.date)
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
            {this.props.recurse ? <RecursiveDate id='recursive' /> : null }
          </choice>
        </argument>

        <sequence id='absolute'>
          <Day prepositions={this.props.prepositions} merge recurse={false} />
          <sequence optional merge>
            <list items={[', ', ' in ']} category='conjunction' />
            <Year id='year' />
          </sequence>
        </sequence>

        <sequence>
          {this.props.prepositions ? <literal text='on ' optional prefered limited category='conjunction' /> : null}
          <argument text='date' showForEmpty merge>
            <choice>
              <RelativeWeekday id='absolute' />
              <AbsoluteDay id='absolute' />
            </choice>
          </argument>
        </sequence>
      </choice>
    )
  }
}

DatePhrase.defaultProps = {
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

    let duration = result.duration
    if (result.direction === -1) {
      duration = _.mapValues(result.duration, item => -item)
    }

    return {duration, day: result.day}
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

    let duration = result.duration
    if (result.direction === -1) {
      duration = _.mapValues(result.duration, item => -item)
    }

    return {duration, date: result.date}
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
        <placeholder text='date' id='date'>
          {/*<choice>
            <literal text='now' value='now' /> */}
            <DatePhrase recurse={false} prepositions={false} />
          {/*</choice>*/}
        </placeholder>
      </sequence>
    )
  }
}

class NamedDay extends Phrase {
  describe() {
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
  describe() {
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
    // const returnDate = new Date()
    const day = ((result.distance || 0) * 7) + result.weekday
    const returnDate = moment().day(day)
    // const currentDay = returnDate.getDay()
    // let distance
    // if (result.distance != null) {
    //   distance = result.weekday - currentDay + (7 * result.distance)
    // } else {
    //   distance = (result.weekday + (7 - currentDay)) % 7
    // }
    // returnDate.setDate(returnDate.getDate() + distance)
    return {year: returnDate.year(), month: returnDate.month(), day: returnDate.date()}
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
    const month = parseInt(result.month, 10) - 1
    const day = parseInt(result.day, 10)
    const returnVal = {month, day}
    if (result.year) returnVal.year = result.year
    return returnVal
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
      <filter function={this.filter.bind(this)}>
        <sequence>
          <DigitString maxLength={2} descriptor='mm' id='month' />
          <list items={['/']} limit={1} />
          <DigitString maxLength={2} max={31} descriptor='dd' id='day' />
          {this.props.year ? (
            <sequence merge>
              <list items={['/']} limit={1} />
              <Year id='year' />
            </sequence>
          ) : null}
        </sequence>
      </filter>
    )
  }
}

AbsoluteDay.defaultProps = {
  year: true
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
  // this is interesting, because the user must be able to specify Feburary 29 if they have not specified a year, and then it must be validated by the year. So use a leap year (2012)
  filter(result) {
    if (_.isUndefined(result) || _.isUndefined(result.month) || _.isUndefined(result.day)) return true
    const year = _.isUndefined(result.year) || _.isEqual(result.year, {}) ? 2012 : parseInt(result.year, 10)
    const date = new Date(year, result.month, result.day, 0, 0, 0, 0)
    return date.getMonth() === result.month
  }

  describe() {
    return (
      <filter function={this.filter.bind(this)}>
        <choice>
          <sequence>
            <Month id='month' />
            <list items={[' ', ' the ']} limit={1} />
            <choice id='day' limit={1}>
              <Integer max={31} min={1} />
              <Ordinal max={31} />
            </choice>
            {/*this.props.year ? (
              <sequence id='year' optional preffered={false}>
                <list items={[', ', ' ']} limit={1} />
                <DigitString descriptor='year' max={9999} allowLeadingZeros={false} merge />
              </sequence>
            ) : null*/}
          </sequence>
          <sequence>
            <literal text='the ' />
            <choice id='day' limit={1}>
              <Integer max={31} min={1} />
              <Ordinal max={31} />
            </choice>
            <list items={[' of ', ' ']} limit={1} />
            <Month id='month' />
            {/*this.props.year ? (
              <sequence id='year' optional preffered={false}>
                <list items={[', ', ' ']} limit={1} />
                <DigitString descriptor='year' max={9999} allowLeadingZeros={false} merge />
              </sequence>
            ) : null*/}
          </sequence>
        </choice>
      </filter>
    )
  }
}

// NamedMonthAbsolute.defaultProps = {
//   year: true
// }
