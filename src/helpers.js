import _ from 'lodash'
import moment from 'moment-timezone'

// combine a the date components of a Date object and the time components of {hour, minute, second}
// date: moment, Date, or {year, month, day}
// time: {hour, minute, second}
export function join (date, time, timeZone = false) {
  return getMoment(date, timeZone).set(time).toDate()
}

export function negateDuration (duration) {
  return _.mapValues(duration, num => -num)
}

export function relativeTime (duration, now, timeZone = false) {
  const newTime = getMoment(now, timeZone).utc().add(moment.duration(duration)).local()

  return {hour: newTime.hour(), minute: newTime.minute(), second: newTime.second()}
}

export function absoluteTime (absolute) {
  return {hour: absolute.hour, minute: absolute.minute || 0, second: absolute.second || 0}
}

export function ambiguousTime (ambiguousTime, ampm) {
  const hour = ampmHourToHour(ambiguousTime.hour, ampm)

  return {hour, minute: ambiguousTime.minute || 0, second: ambiguousTime.second || 0}
}

function ampmHourToHour (hour, ampm) {
  if (ampm) {
    return ampm === 'am' ? (hour === 12 ? 0 : hour) : hour + 12
  } else {
    return hour
  }
}

export function getMoment (date, timeZone = false) {
  if (timeZone){
    return moment.tz(date, timeZone)
  } else {
    return moment(date)
  }
}

export function coerceAmbiguousTime (ambiguousTime, range) {
  if (_.inRange(ambiguousTime.hour, ...range)) {
    return ambiguousTime
  } else {
    return {hour: ambiguousTime.hour < 12 ? ambiguousTime.hour + 12 : ambiguousTime.hour - 12, minute: ambiguousTime.minute, second: ambiguousTime.second}
  }
}

export function absoluteDate (absolute, timeZone = false) {
  return getMoment(absolute).toDate()
}

export function relativeDate (duration, now = {}, timeZone = false) {
  return getMoment(now, timeZone).add(moment.duration(duration)).toDate()
}

export function relativeDay (duration, now = {}, timeZone = false) {
  const newMoment = getMoment(now, timeZone).year(2010).add(moment.duration(duration)) // not leap year
  return {month: newMoment.month(), day: newMoment.date()}
}

export function validateDay ({month, day, year = 2012} = {}, timeZone = false) { //leap year
  if (_.isUndefined(month) || _.isUndefined(day)) return true

  const dateMoment = getMoment({year, month, day}, timeZone)
  return dateMoment.month() === month
}
