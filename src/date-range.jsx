// /** @jsx createElement */

// import _ from 'lodash'
// import moment from 'moment'
// import {createElement} from 'elliptical'

// import { relativeDate } from './helpers'
// import { Date as DatePhrase } from './date'
// import { DateDuration } from './duration'

// export const DateRange = {
//   defaultProps: {
//     prepositions: false,
//     _duration: true,
//     _allDay: false
//   },

//   getValue (result) {
//     if (result.duration) {
//       return {
//         start: result.start,
//         end: relativeDate(result.duration, result.start)
//       }
//     } else {
//       return result
//     }
//   },

//   describe () {
//     return (
//       <map function={this.getValue.bind(this)}>
//         <choice>
//           <sequence>
//             {this.props.prepositions ? <literal text='from ' optional limited /> : null}
//             {this.props._allDay ? <literal text='all day ' optional limited /> : null}
//             <DatePhrase id='start' />
//             <list items={[' to ', ' - ', '-']} limit={1} />
//             {this.props._allDay ? <literal text='all day ' optional limited /> : null}
//             <DatePhrase id='end' />
//           </sequence>
//           {this.props._duration ? (
//             <sequence>
//               {this.props._allDay ? <literal text='all day ' optional limited /> : null}
//               <DatePhrase id='start' prepositions={this.props.prepositions} />
//               <literal text=' for ' />
//               <DateDuration id='duration' />
//             </sequence>
//           ) : null}
//         </choice>
//       </map>
//     )
//   }
// }
