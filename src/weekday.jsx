/** @jsx createElement */

import { createElement, Phrase } from 'lacona-phrase'

export default class Weekday extends Phrase {
  describe() {
    return <list items={[
      {text: 'Sunday', value: 0},
      {text: 'Monday', value: 1},
      {text: 'Tuesday', value: 2},
      {text: 'Wednesday', value: 3},
      {text: 'Thursday', value: 4},
      {text: 'Friday', value: 5},
      {text: 'Saturday', value: 6}
    ]} />
  }
}
