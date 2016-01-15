/** @jsx createElement */

import { createElement, Phrase } from 'lacona-phrase'

export class Weekday extends Phrase {
  static defaultProps = {
    argument: 'day of the week'
  }

  describe() {
    return (
      <label text={this.props.argument}>
        <list items={[
          {text: 'Sunday', value: 0},
          {text: 'Monday', value: 1},
          {text: 'Tuesday', value: 2},
          {text: 'Wednesday', value: 3},
          {text: 'Thursday', value: 4},
          {text: 'Friday', value: 5},
          {text: 'Saturday', value: 6}
        ]} />
      </label>
    )
  }
}
