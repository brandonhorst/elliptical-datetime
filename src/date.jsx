/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'elliptical'
import moment from 'moment'

import { DateDuration } from './duration'
import { DigitString, Integer, Ordinal } from 'elliptical-number'
import { TimeOfDay } from './time'
import { Month } from './month'
import { Year } from './year'
import { Weekday } from './weekday'
import { absoluteDate, join, negateDuration, relativeDate, relativeDay, validateDay, possibleDates } from './helpers'

export const InternalDay = {
  defaultProps: {
    recurse: true,
    label: 'day'
  },

  describe ({props}) {
    if (props.nullify) return

    return (
      <choice>
        {props.recurse ? (
          <placeholder
            label={props.label}
            arguments={props.phraseArguments || (props.phraseArguments ? [props.phraseArgument] : [props.label])}>
            <RecursiveDay label={props.label} />
          </placeholder>
        ) : null}

        <sequence>
          {props.prepositions ? <literal text='on ' decorate /> : null}
          <placeholder
            label={props.label}
            arguments={props.phraseArguments || (props.phraseArguments ? [props.phraseArgument] : [props.label])}
            merge>
            <choice>
              <DayAlone />
              <AmbiguousAbsoluteDay />
              <AmbiguousAbsoluteNamedMonth />
            </choice>
          </placeholder>
        </sequence>
      </choice>
    )
  }
}

export const Day = {
  id: 'elliptical-datetime:Day',

  defaultProps: {
    recurse: true,
    label: 'day'
  },

  describe ({props}) {
    return <InternalDay {...props} />
  }
}

function * mapDate (option) {
  for (let result of possibleDates(option.result)) {
    yield _.assign({}, option, {result})
  }
}

export const Date = {
  id: 'elliptical-datetime:Date',
  
  defaultProps: {
    recurse: true,
    prepositions: false,
    nullify: false,
    past: true,
    future: true,
    label: 'date'
  },

  filterResult (result, {props}) {
    if (!props.past && moment(result).isBefore(moment())) {
      return false
    }
    if (!props.future && moment(result).isAfter(moment())) {
      return false
    }
    // if (result._ambiguousMonth) {
    //   return false
    // }

    return true
  },

  describe ({props}) {
    return (
      <map outbound={mapDate} skipIncomplete limit={1}>
        <InternalDate {...props} />
      </map>
    )
  }
}

export const InternalDate = {
  defaultProps: {
    recurse: true,
    prepositions: false,
    nullify: false,
    past: true,
    future: true,
    label: 'date'
  },

  describe ({props}) {
    if (props.nullify) return

    return (
      <choice>
        <placeholder
          label={props.label}
          arguments={props.phraseArguments || (props.phraseArguments ? [props.phraseArgument] : [props.label])}>
          <choice>
            <RelativeNamed />
            <RelativeNumbered prepositions={props.prepositions} />
            <DayWithYear prepositions={props.prepositions} />
            <RelativeAdjacent />
            {props.recurse ? <RecursiveDate label={props.label} /> : null }
          </choice>
        </placeholder>

        <sequence>
          {props.prepositions ? <literal text='on ' decorate /> : null}
          <placeholder
            label={props.label}
            arguments={props.phraseArguments || (props.phraseArguments ? [props.phraseArgument] : [props.label])}
            merge>
            <choice>
              <RelativeWeekday />
              <AbsoluteDay />
            </choice>
          </placeholder>
        </sequence>
      </choice>
    )
  }
}

const DayWithYear = {
  mapResult (result) {
    const day = result.day
    const year = result.year

    if (year) {
      const date = absoluteDate(_.assign({year: year.year}, day))
      return {date, _ambiguousCentury: year._ambiguousCentury}
    } else {
      return {
        date: absoluteDate(day),
        _ambiguousMonth: day._ambiguousMonth,
        _ambiguousYear: true
      }
    }
  },
  describe ({props}) {
    return (
      <sequence>
        <Day prepositions={props.prepositions} id='day' recurse={false} ellipsis />
        <sequence merge>
          <list items={[', ', ' in ', ' ']} limit={1} />
          <Year id='year' />
        </sequence>
      </sequence>
    )
  }
}


const ExtraDateDuration = {
  mapResult (result) {
    return {[result.type]: result.multiplier || 1}
  },

  describe() {
    return (
      <sequence>
        <placeholder label='number'>
          <literal text='the ' />
        </placeholder>
        <placeholder label='time period' merge>
          <list items={[
            {text: 'day', value: {type: 'days'}},
            {text: 'fortnight', value: {type: 'days', multiplier: 14}},
            {text: 'week', value: {type: 'days', multiplier: 7}},
            {text: 'month', value: {type: 'months'}},
            {text: 'year', value: {type: 'years'}}
          ]} />
        </placeholder>
      </sequence>
    )
  }
}

const RecursiveDay = {
  mapResult (result) {
    const duration = result.direction === -1
      ? negateDuration(result.duration)
      : result.duration

    return relativeDay(duration, result.day)
  },

  describe ({props}) {
    return (
      <sequence>
        <placeholder label='offset' merge>
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
        </placeholder>
        <literal text=' ' />
        <placeholder label='day' id='day'>
          <Day recurse={false} prepositions={false} label={props.label} />
        </placeholder>
      </sequence>
    )
  }
}

const RecursiveDate = {
  mapResult (result) {
    const duration = result.direction === -1
      ? negateDuration(result.duration)
      : result.duration

    return _.assign({}, result.date, {
      date: relativeDate(duration, result.date.date)
    })
  },

  describe ({props}) {
    return (
      <sequence>
        <placeholder label='offset' merge>
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
        </placeholder>
        <literal text=' ' />
        <InternalDate id='date' label={props.label} recurse={false} prepositions={false} />
      </sequence>
    )
  }
}

const RelativeNamed = {
  mapResult (result) {
    return {date: relativeDate(result)}
  },

  describe () {
    return (
      <list items={[
        {text: 'today', value: {days: 0}},
        {text: 'tomorrow', value: {days: 1}},
        {text: 'yesterday', value: {days: -1}},
        {text: 'now', value: {days: 0}},
        {text: 'right now', value: {days: 0}}
      ]} limit={3} />
    )
  }
}

const RelativeNumbered = {
  mapResult (result) {
    const duration = result.direction === -1
      ? negateDuration(result.duration)
      : result.duration

    return {date: relativeDate(duration)}
  },

  describe({props}) {
    return (
      <choice>
        {props.prepositions ? (
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

const RelativeAdjacent = {
  mapResult (result) {
    const duration = {
      [result.type]: result.num * (result.multiplier || 1)
    }

    return {date: relativeDate(duration)}
  },

  describe() {
    return (
      <placeholder label='time period'>
        <sequence>
          <list id='num' items={[
            {text: 'next ', value: 1},
            {text: 'last ', value: -1}
          ]} />
          <placeholder label='time period' merge>
            <list items={[
              {text: 'week', value: {type: 'days', multiplier: 7}},
              {text: 'month', value: {type: 'months'}},
              {text: 'year', value: {type: 'years'}}
            ]} />
          </placeholder>
        </sequence>
      </placeholder>
    )
  }
}

function dateFromRelative(distance, weekday) {
  const day = ((distance) * 7) + weekday

  return moment().day(day).toDate()
}

const RelativeWeekday = {
  mapResult (result) {
    const date = dateFromRelative(
      result.distance || 0,
      result.weekday
    )

    if (result.distance == null) {
      return {date, _ambiguousWeek: true}
    } else {
      return {date}
    }
  },
  describe() {
    return (
      <choice>
        <sequence>
          <list optional id='distance' items={[
            {text: 'last ', value: -1},
            {text: 'this ', value: 0},
            {text: 'next ', value: 1},
            {text: 'this upcoming ', value: 1}
          ]} limit={1} />
          <Weekday id='weekday' />
        </sequence>
        <sequence>
          <literal text='the ' />
          <placeholder label='relative weekday' merge>
            <sequence>
              <Weekday id='weekday' />
              <list id='distance' items={[
                {text: ' after next', value: 2},
                {text: ' after this', value: 1},
                {text: ' before this', value: -1},
                {text: ' before last', value: -2}
              ]} />
            </sequence>
          </placeholder>
        </sequence>
      </choice>
    )
  }
}

function leapYear (year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)
}

const MonthNumber = {
  mapResult: (result) => parseInt(result, 10) - 1,
  describe: () => <DigitString maxLength={2} max={12} min={1} label='mm' />
}

const DayNumber = {
  mapResult: (result) => parseInt(result, 10),
  describe: () => <DigitString maxLength={2} max={31} min={1} label='dd'/>
}

const AbsoluteDay = {
  mapResult (result) {
    const date = absoluteDate(_.assign({}, result, {year: result.year.year}))
    return {date, _ambiguousCentury: result.year._ambiguousCentury}
  },

  filterResult (result) {
    let years = result._ambiguousCentury ? [0, 100, -100] : [0]
    return _.some(years, year => {
      const date = _.assign({}, result, {year: result.date.getFullYear() + year})
      return validateDay(date)
    })
  },

  describe () {
    return (
      <sequence>
        <AmbiguousAbsoluteDay merge />
        <list items={['/']} limit={1} />
        <Year id='year' />
      </sequence>
    )
  }
}

const DayAlone = {
  mapResult (result) {
    return {
      month: moment().month(),
      day: result,
      _ambiguousMonth: true
    }
  },
  describe () {
    return (
      <sequence>
        <literal text='the ' optional preferred limited />
        <choice limit={1} merge>
          <Integer allowWordForm max={31} min={1} limit={1} allowLeadingZero={false} />
          <Ordinal allowWordForm max={31} limit={1} />
        </choice>
      </sequence>
    )
  }
}

const AmbiguousAbsoluteDay = {
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

const AmbiguousAbsoluteNamedMonth = {
  filterResult (result) {
    return validateDay(result)
  },

  describe () {
    return (
      <choice>
        <sequence>
          <Month id='month' />
          <list items={[' ', ' the ']} limit={1} />
          <choice id='day' limit={1}>
            <Integer allowWordForm max={31} min={1} limit={1} />
            <Ordinal allowWordForm max={31} limit={1} />
          </choice>
        </sequence>
        <sequence>
          <literal text='the ' />
          <choice id='day' limit={1}>
            <Integer allowWordForm max={31} min={1} limit={1} />
            <Ordinal allowWordForm max={31} limit={1} />
          </choice>
          <list items={[' of ', ' ']} limit={1} />
          <Month id='month' />
        </sequence>
      </choice>
    )
  }
}
