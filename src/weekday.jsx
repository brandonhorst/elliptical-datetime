/** @jsx createElement */

import {createElement} from 'elliptical'

export const Weekday = {
  defaultProps: {
    argument: 'day of the week'
  },

  describe ({props}) {
    return (
      <label text={props.argument}>
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
