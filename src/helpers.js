import _ from 'lodash'
import moment from 'moment'

// combine a the date components of a Date object and the time components of {hour, minute, second}
// date: moment, Date, or {year, month, day}
// time: {hour, minute, second}
// timezoneOffset = new Date().getTimezoneOffset() from the user's system
export function join (date, time, timezoneOffset) {
  if (timezoneOffset == null) {
    return moment(date).set(time).toDate()
  } else {
    const mom = moment(date)
    const yearComponents = {year: mom.year(), month: mom.month(), date: mom.date()}
    return moment().utcOffset(-timezoneOffset).set(yearComponents).set(time).toDate()
  }
}

export function negateDuration (duration) {
  return _.mapValues(duration, num => -num)
}

export function relativeTime (duration, now) {
  const newTime = moment(now).add(moment.duration(duration))

  return {hour: newTime.hour(), minute: newTime.minute(), second: newTime.second()}
}

export function absoluteTime (absolute) {
  return {hour: absolute.hour, minute: absolute.minute || 0, second: absolute.second || 0}
}

export function ambiguousTime (ambiguousTime, ampm) {
  // special case for 24:00
  if (ambiguousTime.hour === 24 && (ampm || ambiguousTime.minute || ambiguousTime.second)) {
    return null
  }

  // special case for 0:00
  if (ambiguousTime.hour === 0 && ampm) {
    return null
  }

  let hour = ampmHourToHour(ambiguousTime.hour, ampm)

  if (
    (ampm === 'am' && (hour > 12 || hour < 0)) ||
    (ampm === 'pm' && (hour < 12 || hour > 23))
  ) {
    return null
  }

  return {hour, minute: ambiguousTime.minute || 0, second: ambiguousTime.second || 0}
}

function ampmHourToHour (hour, ampm) {
  if (ampm) {
    if (hour === 12) {
      return ampm === 'am' ? 0 : 12
    } else {
      return ampm === 'am' ? hour : hour + 12
    }
  } else {
    if (hour === 24) {
      return 0
    } else {
      return hour
    }
  }
}

// export function coerceAmbiguousTime (ambiguousTime, range) {
//   if (_.inRange(ambiguousTime.hour, ...range)) {
//     return ambiguousTime
//   } else {
//     return {hour: ambiguousTime.hour < 12 ? ambiguousTime.hour + 12 : ambiguousTime.hour - 12, minute: ambiguousTime.minute, second: ambiguousTime.second}
//   }
// }

export function absoluteDate (absolute) {
  return moment(absolute).toDate()
}

export function absoluteDay (absolute) {
  return {
    month: absolute.month == null ? moment().month() : absolute.month,
    day: absolute.day == null ? moment.day(): absolute.day
  }
}

export function relativeDate (duration, now = {}) {
  return moment(now).add(moment.duration(duration)).toDate()
}

export function relativeDay (duration, now = {}) {
  const newMoment = moment(now).year(2010).add(moment.duration(duration)) // not leap year
  return {month: newMoment.month(), day: newMoment.date()}
}

export function validateDay ({month, day, year = 2012} = {}) { //leap year
  if (_.isUndefined(month) || _.isUndefined(day)) return true

  const dateMoment = moment({year, month, day})
  return dateMoment.month() === month
}

export function * possibleDates(obj, referenceDate) {
  if (obj.date) {
    if (obj._ambiguousWeek) {
      for (let i of [0, 7, -7, 14, -14]) {
        yield moment(obj.date).add(i, 'days').toDate()
      }
    } else if (obj._ambiguousYear) {
      for (let i of [0, 1, -1]) {
        yield moment(obj.date).add(i, 'years').toDate()
      }
    } else if (obj._ambiguousCentury) {
      for (let i of [0, 100, -100]) {
        yield moment(obj.date).add(i, 'years').toDate()
      }
    } else {
      yield obj.date
    }
  } else {
    for (let i of [0, 1, -1]) {
      yield moment(referenceDate).add(i, 'days').toDate()
    }
  }
}

export function timeLessThan(a, b) {
  return (a.hour < b.hour)
    || (a.hour === b.hour && a.minute < b.minute)
    || (a.hour === b.hour && a.minute === b.minute && a.second < b.second)
}