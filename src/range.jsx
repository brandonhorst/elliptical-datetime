/** @jsx createElement */

import _ from 'lodash'
import moment from 'moment'
import { createElement, Phrase } from 'lacona-phrase'

import { join, relativeDate } from './helpers'
// import { Date } from './date'
// import { DateRange } from './date-range'
import { DateTime, InternalDateTime } from './datetime'
import { Duration } from './duration'
// import { Time } from './time'
// import { TimeRange } from './time-range'

class TrueDateTime extends Phrase {
  describe () {
    return (
      <sequence>
        <literal text='all day ' id='allDay' value optional limited />

        <choice merge>
          <InternalDateTime {...this.props} id={undefined} />
          <map function={(result) => ({dateTime: result})}>
            <DateTime {...this.props} nullify />
          </map>
        </choice>
      </sequence>
    )
  }
}

export class Range extends Phrase {
  validate (result) {
    const startMoment = moment(result.start)
    const endMoment = moment(result.end)

    if (endMoment.isBefore(startMoment)) return false

    const currentMoment = result.allDay ? moment({}) : moment()
    if (!this.props.past && currentMoment.isAfter(startMoment)) return false
    if (!this.props.future && currentMoment.isBefore(endMoment)) return false

    return true
  }

  * getValues (result) {
    if (result.start && result.end) {
      if (!result.start.time && !result.end.time) {
        yield {
          start: join(result.start.date, {hour: 0, minute: 0, second: 0}),
          end: join(result.end.date, {hour: 0, minute: 0, second: 0}),
          allDay: true
        }
      } else if (!result.start.date && !result.end.date) {
        for (let i of [0, 1, -1]) {
          for (let j of [0, 1, -1, 2, -2]) {
            yield {
              start: moment({}).set(result.start.time).add(i, 'days').toDate(),
              end: moment({}).set(result.end.time).add(j, 'days').toDate(),
              allDay: false
            }
          }
        }
      } else if (!result.start.time) {
        yield {
          start: join(result.start.date, this.props.defaultTime),
          end: join(result.end.date, result.end.time),
          allDay: false
        }
      } else if (!result.end.time) {
        yield {
          start: join(result.start.date, result.start.time),
          end: join(result.end.date, this.props.defaultTime),
          allDay: false
        }
      } else if (!result.end.date) {
        for (let i of [0, 1, -1]) {
          yield {
            start: join(result.start.date, result.start.time),
            end: join(moment(result.start.date).add(i, 'days'), result.end.time),
            allDay: false
          }
        }
      } else if (!result.start.date) {
        for (let i of [0, 1, -1]) {
          yield {
            start: join(moment(result.end.date).add(i, 'days'), result.start.time),
            end: join(result.end.date, result.end.time),
            allDay: false
          }
        }
      } else {
        if (result.start._ambiguousWeek && result.end._ambiguousWeek) {
          for (let i of [0, 7, -7]) {
            for (let j of [0, 7, -7, 14, -14]) {
              yield {
                start: moment(result.start.date).set(result.start.time).add(i, 'days').toDate(),
                end: moment(result.end.date).set(result.end.time).add(j, 'days').toDate(),
                allDay: false
              }
            }
          } 
        } else {
          yield {
            start: join(result.start.date, result.start.time),
            end: join(result.end.date, result.end.time),
            allDay: false
          }
        }
      }
    } else if (result.start && result.duration) {
      if (!result.start.date) {
        for (let i of [0, 1, -1]) {
          const start = join(relativeDate({days: i}), result.start.time)
          yield {
            start,
            end: moment(start).add(result.duration).toDate(),
            allDay: false
          }
        }
      } else if (!result.start.time) {
        const start = join(result.start.time, this.props.defaultTime)
        yield {
          start,
          end: moment(start).add(result.duration).toDate(),
          allDay: false
        }

      } else {
        const start = join(result.start.date, result.start.time)
        yield {
          start,
          end: moment(start).add(result.duration).toDate(),
          allDay: false
        }
      }
    } else if (result.start) {
      if (!result.start.time) {
        yield {
          start: result.start.date,
          end: result.start.date,
          allDay: true
        }
      } else if (!result.start.date) {
        for (let i of [0, 1, -1]) {
          const start = join(relativeDate({days: i}), result.start.time)
          yield {
            start: start,
            end: moment(start).add(this.props.defaultDuration).toDate(),
            allDay: false
          }
        }
      } else {
        const start = join(result.start.date, result.start.time)
        yield {
          start,
          end: moment(start).add(this.props.defaultDuration).toDate(),
          allDay: false
        }
      }
    }
  }

  filter (result) {
    if (result.allDay && (!result.start._ambiguousTime || (result.end && !result.end._ambiguousTime))) {
      return false
    }

    return true
  }

  /*
    Monday                           D       Monday all day

    Monday at 3pm                    DT      Monday at 3pm to Monday at 4pm
    3pm                              TD      today at 3pm to today at 4pm

    Monday to Tuesday                D  D    Monday to Tuesday all day

    ---
    Monday at 3pm to Tuesday at 4pm  DT DT   3pm Monday to 4pm Tuesday
    3pm Monday to 4pm Tuesday        DT DT   3pm Monday to 4pm Tuesday
    3pm Monday to Tuesday at 4pm     DT DT   3pm Monday to 4pm Tuesday
    Monday at 3pm to 4pm Tuesday     DT DT   3pm Monday to 4pm Tuesday

    Monday to Tuesday at 4pm         DT DT   8am Monday to 4pm Tuesday
    Monday to 4pm Tuesday            DT DT   8am Monday to 4pm Tuesday

    Monday at 3pm to Tuesday         DT DT   3pm Monday to 8am Tuesday
    3pm Monday to Tuesday            DT DT   3pm Monday to 8am Tuesday

    3pm to Tuesday at 4pm            DT DT   3pm today to 4pm Tuesday
    3pm to 4pm Tuesday               T  DT   3pm Tuesday to 4pm Tuesday

    Monday at 3pm to 4pm             DT T    3pm Monday to 4pm Monday
    3pm Monday to 4pm                DT T    3pm Monday to 4pm Monday

    3pm to 4pm                       T  T    3pm today to 4pm today
    ---

    ---
    Monday from 3pm to 4pm           D  TR   3pm Monday to 4pm Monday
    3pm to 4pm Monday                TR D    3pm Monday to 4pm Monday
    ---

    Monday at 3pm for 4 hours        DT Du   3pm Monday to 7pm Monday
    3pm Monday for 4 hours           DT Du   3pm Monday to 7pm Monday
    4 hours Monday at 3pm            Du DT   3pm Monday to 7pm Monday
    4 hours 3pm Monday               Du DT   3pm Monday to 7pm Monday

    3pm for 4 hours                  DT Du   3pm today to 7pm today
    4 hours at 3pm                   Du DT   3pm today to 7pm today
    Monday for 4 hours               DT Du   8am Monday to 12pm today
    4 hours on Monday                DT Du   8am Monday to 12pm today
  */

  describe () {
    return (
      <label argument={false} text={this.props.argument}>
        <map iteratorFunction={this.getValues.bind(this)} limit={1}>
          <filter function={this.filter}>
            <sequence unique>
              <sequence id='duration' optional limited>
                {this.props.prepositions ? <literal text='for ' /> : null}
                <Duration merge />
                <list items={[' ', ' starting ']} limit={1} />
              </sequence>

              <TrueDateTime ellipsis id='start' />

              <choice merge>
                <sequence id='end'>
                  <literal text=' to ' />

                  <TrueDateTime merge />
                </sequence>

                <sequence id='duration'>
                  <literal text=' for ' />
                  <Duration merge />
                </sequence>
              </choice>
            </sequence>
          </filter>
        </map>
      </label>
    )
  }
}

Range.defaultProps = {
  prepositions: false,
  seconds: true,
  defaultTime: {hour: 8},
  defaultDuration: {hours: 1},
  future: true,
  past: true,
  argument: 'period of time'
}

// class StartDateAlone extends Phrase {
//   getValue (result) {
//     return {
//       start: result,
//       end: result,
//       allDay: true
//     }
//   }

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <sequence>
//           <literal text='all day ' optional limited />
//           <Date merge prepositions={this.props.prepositions} />
//         </sequence>
//       </map>
//     )
//   }
// }

// StartDateAlone.defaultProps = {
//   prepositions: false
// }

// class StartDateTimeAlone extends Phrase {
//   getValue (result) {
//     return {
//       start: result,
//       end: moment(result).add(moment.duration(this.props.duration)).toDate(),
//       allDay: false
//     }
//   }

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <DateTime _impliedTime={false} prepositions={this.props.prepositions} />
//       </map>
//     )
//   }
// }

// StartDateTimeAlone.defaultProps = {
//   prepositions: false,
//   duration: {hours: 1}
// }

// class TimeRangeAlone extends Phrase {
//   getValue (result) {
//     const startDate = relativeDate(result.relative)
//     const endDate = moment(startDate).add(result.timeRange.dayOffset, 'day')
//     return {
//       start: join(startDate, result.timeRange.start),
//       end: join(moment(endDate), result.timeRange.end),
//       allDay: false
//     }
//   }

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <sequence>
//           <list id='relative' limit={1} items={[
//             {text:'', value: {}},
//             {text:'', value: {days: 1}},
//             {text:'', value: {days: -1}}
//           ]} />
//           <TimeRange id='timeRange' _duration={false} prepositions={this.props.prepositions} />
//         </sequence>
//       </map>
//     )
//   }
// }

// TimeRangeAlone.defaultProps = {
//   prepositions: false
// }

// class DateRangeAlone extends Phrase {
//   getValue (result) {
//     return {
//       start: result.start,
//       end: result.end,
//       allDay: true
//     }
//   }

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <DateRange prepositions={this.props.prepositions} _allDay />
//       </map>
//     )
//   }
// }

// class StartDateTimeAndEndDateTime extends Phrase {
//   getValue (result) {
//     return {
//       start: result.start,
//       end: result.end,
//       allDay: false
//     }
//   }

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <sequence>
//           {this.props.prepositions ? <literal text='from ' optional limited /> : null}
//           <DateTime id='start' defaultTime={this.props.defaultTime} />
//           <list items={[' to ', ' - ', '-']} limit={1} />
//           <DateTime id='end' defaultTime={this.props.defaultTime} />
//         </sequence>
//       </map>
//     )
//   }
// }

// StartDateTimeAndEndDateTime.defaultProps = {
//   prepositions: false
// }

// class StartDateTimeAndDuration extends Phrase {
//   getValue (result) {
//     return {
//       start: result.start,
//       end: moment(result.start).add(moment.duration(result.duration)).toDate(),
//       allDay: false
//     }
//   }
//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <choice>
//           <sequence>
//             {this.props.prepositions ? <literal text='for ' optional limited /> : null}
//             <Duration id='duration' seconds={this.props.seconds} />
//             <literal text=' ' />
//             <DateTime id='start' prepositions defaultTime={this.props.defaultTime} />
//           </sequence>

//           <sequence>
//             <DateTime id='start' prepositions={this.props.prepositions} defaultTime={this.props.defaultTime} />
//             <literal text=' for ' />
//             <Duration id='duration' seconds={this.props.seconds} />
//           </sequence>
//         </choice>
//       </map>
//     )
//   }
// }

// StartDateTimeAndDuration.defaultProps = {
//   prepositions: false
// }

// class StartDateAndTimeRange extends Phrase {
//   getValue (result) {
//     return {
//       start: join(result.date, result.timeRange.start),
//       end: join(moment(result.date).add(result.timeRange.dayOffset, 'day'), result.timeRange.end),
//       allDay: false
//     }
//   }

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <choice>
//           <sequence>
//             <Date id='date' prepositions={this.props.prepositions} />
//             <literal text=' ' />
//             <TimeRange id='timeRange' _duration={false} prepositions />
//           </sequence>

//           <sequence>
//             <TimeRange id='timeRange' prepositions={this.props.prepositions} />
//             <literal text=' ' />
//             <Date id='date' prepositions />
//           </sequence>
//         </choice>
//       </map>
//     )
//   }
// }

// StartDateAndTimeRange.defaultProps = {
//   prepositions: false
// }
