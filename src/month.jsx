/** @jsx createElement */

import {createElement, Phrase} from 'lacona-phrase'

export default class Weekday extends Phrase {
  describe () {
    return (
      <placeholder text='month' showForEmpty={true}>
        <list items={[
          {text: 'January', value: 0},
          {text: 'Feburary', value: 1},
          {text: 'March', value: 2},
          {text: 'April', value: 3},
          {text: 'May', value: 4},
          {text: 'June', value: 5},
          {text: 'July', value: 6},
          {text: 'August', value: 7},
          {text: 'September', value: 8},
          {text: 'October', value: 9},
          {text: 'November', value: 10},
          {text: 'December', value: 11}
        ]} />
      </placeholder>
    )
  }
}
