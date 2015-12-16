import moment from 'moment'

export function join (date, time) {
  return moment(date).set(time).toDate()
}

export function timeIsBefore(timeA, timeB) {
  if (timeA.hour < timeB.hour) return true
  if (timeA.hour > timeB.hour) return false

  if (timeA.minute < timeB.minute) return true
  if (timeA.minute > timeB.minute) return false
  
  if (timeA.second < timeB.second) return true
  if (timeA.second > timeB.second) return false
}
