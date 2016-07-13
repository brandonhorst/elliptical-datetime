/** @jsx createElement */

import {createElement} from 'elliptical'

export const Weekday = {
  defaultProps: {
    label: 'day of the week'
  },

  describe ({props}) {
    return (
      <placeholder
        label={props.label}
        arguments={props.phraseArguments || (props.phraseArguments ? [props.phraseArgument] : [props.label])}>
        <list items={[
          {text: 'Sunday', value: 0},
          {text: 'Monday', value: 1},
          {text: 'Tuesday', value: 2},
          {text: 'Wednesday', value: 3},
          {text: 'Thursday', value: 4},
          {text: 'Friday', value: 5},
          {text: 'Saturday', value: 6}
        ]} />
      </placeholder>
    )
  }
}
