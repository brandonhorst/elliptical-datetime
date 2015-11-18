/** @jsx createElement */

import {createElement, Phrase} from 'lacona-phrase'
import {Integer} from 'lacona-phrase-number'

export default class TimeDuration extends Phrase {
  getValue (result) {
    if (!result) return

    return {[result.type]: result.num}
  }

  describe () {
    return (
      <choice>
        <sequence>
          <placeholder text='number' showForEmpty={true}>
            <literal text='1 ' id='num' value={1} />
          </placeholder>
          <placeholder text='time period' id='type'>
            <choice>
              <literal text='hour' value='hours'/>
              <literal text='minute' value='minutes' />
              <literal text='second' value='seconds'/>
            </choice>
          </placeholder>
        </sequence>
        <sequence>
          <Integer id='num' min={2} />
          <literal text=' ' />
          <placeholder text='time period' id='type'>
            <choice>
              <literal text='hours' value='hours'/>
              <literal text='minutes' value='minutes' />
              <literal text='seconds' value='seconds'/>
            </choice>
          </placeholder>
        </sequence>
      </choice>
    )
  }
}
