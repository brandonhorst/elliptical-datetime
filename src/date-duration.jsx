/** @jsx createElement */

import {createElement, Phrase} from 'lacona-phrase'
import {Integer} from 'lacona-phrase-number'

export default class DateDuration extends Phrase {
  getValue (result) {
    if (!result) return

    if (result.type === 'weeks') {
      return {days: result.num * 7}
    } else {
      return {[result.type]: result.num}
    }
  }

  describe () {
    const singularItems = this.props.includeThe ? ['1', 'the'] : ['1']

    return (
      <choice>
        <sequence>
          <placeholder text='number' showForEmpty={true} id='num'>
            <list items={singularItems} value={1} limit={1} />
          </placeholder>
          <literal text=' ' />
          <placeholder text='time period' id='type'>
            <choice>
              <literal text='day' value='days' />
              <literal text='week' value='weeks'/>
              <literal text='month' value='months'/>
              <literal text='year' value='years'/>
            </choice>
          </placeholder>
        </sequence>
        <sequence>
          <Integer id='num' min={2} />
          <literal text=' ' />
          <placeholder text='time period' id='type'>
            <choice>
              <literal text='days' value='days' />
              <literal text='weeks' value='weeks' />
              <literal text='months' value='months' />
              <literal text='years' value='years' />
            </choice>
          </placeholder>
        </sequence>
      </choice>
    )
  }
}
DateDuration.defaultProps = {includeThe: false}
