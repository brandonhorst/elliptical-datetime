/** @jsx createElement */

import { createElement, Phrase } from 'lacona-phrase'

export class Month extends Phrase {
  static defaultProps = {
    argument: 'month'
  }

  describe() {
    return (
      <label text={this.props.argument}>
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
      </label>
    )
  }
}
