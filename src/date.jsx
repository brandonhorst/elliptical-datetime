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
  // validate (result) {
  //   console.log('date', result)
  //   return true
  // }
  // validate (result) {
  //   if (!this.props.past && moment({}).isAfter(result)) {
  //     return false
  //   }
  //   if (!this.props.future && moment({}).isBefore(result)) {
  //     return false
  //   }

  //   return true
  // }

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

// export class DateWithTimeOfDay extends Phrase {
//   describe () {
//     return (
//       <choice>
//         <sequence>
//           {this.props.prepositions ? <literal text='on ' optional preferred limited /> : null}
//           <label text='date and time' merge>
//             <sequence>
//               <literal text='the ' />
//               <TimeOfDay id='impliedTime' />
//               <literal text=' of ' />
//               <choice id='date'>
//                 <Date nullify />
//                 <RelativeWeekday />
//                 <RelativeAdjacent />
//                 <RelativeNumbered />
//                 <AbsoluteDay />
//                 <DayWithYear />
//                 {this.props.recurse ? <RecursiveDate /> : null}
//               </choice>
//             </sequence>
//           </label>
//         </sequence>
        
//         <label text='date and time'>
//           <sequence>
//             <choice id='date'>
//               <Date nullify prepositions={this.props.prepositions} />
//               <TimeOfDayModifier />
//               <RelativeWeekday />
//             </choice>
//             <literal text=' ' />
//             <TimeOfDay id='impliedTime' />
//           </sequence>
//         </label>
        
//         <label text='date and time'>
//           <NamedDateWithTimeOfDay />
//         </label>

//         <label text='date and time'>
//           <DayWithYearAndTimeOfDay />
//         </label>

//         <label text='date and time'>
//           <sequence>
//             <choice id='date'>
//               <Date nullify prepositions={this.props.prepositions} />
//               <DayWithYear prepositions={this.props.prepositions} />
//               <RelativeNumbered prepositions={this.props.prepositions} />
//               {this.props.recurse ? <RecursiveDate prepositions={this.props.prepositions} /> : null}
//             </choice>
//             <literal text=' in the ' />
//             <TimeOfDay id='impliedTime' />
//           </sequence>
//         </label>
//       </choice>
//     )
//   }
// }

// DateWithTimeOfDay.defaultProps = {
//   recurse: true,
//   prepositions: false
// }

// class NamedDateWithTimeOfDay extends Phrase {
//   getValue () {
//     return {date: relativeDate({hour: 0}), impliedTime: {default: 20, range: [12, 24]}}
//   }

//   describe () {
//     return (
//       <map function={this.getValue}>
//         <literal text='tonight' />
//       </map>
//     )
//   }
// }

class DayWithYear extends Phrase {
  getValue (result) {
    if (result.year) {
      const date = absoluteDate(_.assign({year: result.year.year}, result.day))
      return {date, _ambiguousCentury: result.year._ambiguousCentury}
    } else {
      return {date: absoluteDate(result.day), _ambiguousYear: true}
    }
  }

  describe () {
    return (
      <map function={this.getValue}>
        <sequence>
          <Day prepositions={this.props.prepositions} id='day' recurse={false} ellipsis />
          <sequence merge>
            <list items={[', ', ' in ', ' ']} category='conjunction' limit={1} />
            <Year id='year' />
          </sequence>
        </sequence>
      </map>
    )
  }
}

// class DayWithYearAndTimeOfDay extends Phrase {
//   getValue (result) {
//     const absolute = _.assign({year: result.year}, result.day)
//     return {date: absoluteDate(absolute), impliedTime: result.impliedTime}
//   }

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <sequence>
//           <Day id='day' prepositions={this.props.prepositions} />
//           <literal text=' ' />
//           <TimeOfDay id='impliedTime' />
//           <sequence optional merge>
//             <list items={[', ', ' in ', ' ']} category='conjunction' limit={1} />
//             <Year id='year' />
//           </sequence>
//         </sequence>
//       </map>
//     )
//   }
// }
// 
// DayWithYearAndTimeOfDay.defaultProps = {
//   prepositions: false
// }

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

    return {date: relativeDate(duration, result.date.date)}
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
    return {date: relativeDate(result)}
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

// class TimeOfDayModifier extends Phrase {
//   getValue (result) {
//     return relativeDate(result)
//   }

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <list items={[
//           {text: 'this', value: {days: 0}},
//           {text: 'tomorrow', value: {days: 1}},
//           {text: 'yesterday', value: {days: -1}}
//         ]} />
//       </map>
//     )
//   }
// }

class RelativeNumbered extends Phrase {
  getValue(result) {
    const duration = result.direction === -1 ? negateDuration(result.duration) : result.duration

    return {date: relativeDate(duration)}
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

    return {date: relativeDate(duration)}
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

function dateFromRelative(distance, weekday) {
  const day = ((distance) * 7) + weekday

  return moment().day(day).toDate()
}

class RelativeWeekday extends Phrase {
  getValue (result) {
    const date = dateFromRelative(result.distance || 0, result.weekday)

    if (result.distance == null) {
      return {date, _ambiguousWeek: true}
    } else {
      return {date}
    }
  }

  describe() {
    return (
      <map function={this.getValue}>
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
  getValue (result) {
    const date = absoluteDate(_.assign({}, result, {year: result.year.year}))
    return {date, _ambiguousCentury: result.year._ambiguousCentury}
  }

  filter (result) {
    let years = result.year._ambiguousCentury ? [0, 100, -100] : [0]
    return _.some(years, year => {
      const date = _.assign({}, result, {year: result.year.year + year})
      return validateDay(date)
    })
  }

  describe () {
    return (
      <map function={this.getValue}>
        <filter function={this.filter}>
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
    if (result.twoDigitYear) {
      const decade = parseInt(result.twoDigitYear, 10)
      const year = decade > 29 ? 2000 + decade : 1900 + decade
      return {year, _ambiguousCentury: true}
    } else if (result.fourDigitYear) {
      return {year: parseInt(result.fourDigitYear, 10)}
    }
  }

  suppressWhen(input) {
    return /^('\d|\d|\d{3})$/.test(input)
  }

  describe() {
    return (
      <label suppressWhen={this.suppressWhen} text='year'>
        <map function={this.getValue}>
          <choice limit={1}>
            <sequence>
              <literal text={'\''} optional limited />
              <DigitString minLength={2} maxLength={2} id='twoDigitYear' />
            </sequence>

            <DigitString minLength={4} maxLength={4} id='fourDigitYear' />
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
