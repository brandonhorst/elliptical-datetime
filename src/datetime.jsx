/** @jsx createElement */
import {createElement, Phrase} from 'lacona-phrase'
import Time from './time'
import DatePhrase from './date'

class ExtendedDate extends Phrase {
  getValue (result) {
    if (!result) return

    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + result.dateComponents.days)
    return date

  }

  describe () {
    return (
      <argument text='date' showForEmpty={true}>
        <choice>
          <literal text='this morning' value={{dateComponents: {days: 0}, impliedTime: {hours: 8}}} />
          <literal text='this afternoon' value={{dateComponents: {days: 0}, impliedTime: {hours: 14}}} />
          <literal text='tonight' value={{dateComponents: {days: 0}, impliedTime: {hours: 18}}} />
          <literal text='this evening' value={{dateComponents: {days: 0}, impliedTime: {hours: 18}}} />
          <literal text='tomorrow morning' value={{dateComponents: {days: 1}, impliedTime: {hours: 8}}} />
          <literal text='tomorrow afternoon' value={{dateComponents: {days: 1}, impliedTime: {hours: 14}}} />
          <literal text='tomorrow evening' value={{dateComponents: {days: 1}, impliedTime: {hours: 18}}} />
          <literal text='tomorrow night' value={{dateComponents: {days: 1}, impliedTime: {hours: 18}}} />
          <literal text='yesterday morning' value={{dateComponents: {days: -1}, impliedTime: {hours: 8}}} />
          <literal text='yesterday afternoon' value={{dateComponents: {days: -1}, impliedTime: {hours: 14}}} />
          <literal text='yesterday night' value={{dateComponents: {days: -1}, impliedTime: {hours: 18}}} />
          <literal text='yesterday evening' value={{dateComponents: {days: -1}, impliedTime: {hours: 18}}} />
        </choice>
      </argument>
    )
  }
}

export default class DateTime extends Phrase {
  getValue (result) {
    if (!result || !result.date || !result.time) return

    return new Date(
      result.date.getFullYear(), result.date.getMonth(), result.date.getDate(),
      result.time.getHours(), result.time.getMinutes(), result.time.getSeconds(), 0
    )
  }
}
DateTime.translations = [{
  langs: ['en_US', 'default'],
  describe () {
    return (
      <placeholder text='date and time'>
        <choice>
          <ExtendedDate id='date' />
          <sequence>
            <Time id='time' includeAt={this.props.includeAt} />
            <literal text=' ' />
            <choice id='date'>
              <DatePhrase allowPast={this.props.allowPast} />
              <ExtendedDate />
            </choice>
          </sequence>
          <sequence>
            <choice id='date'>
              <DatePhrase allowPast={this.props.allowPast} />
              <ExtendedDate />
            </choice>
            <literal text=' ' />
            <Time id='time' includeAt={true} />
          </sequence>
        </choice>
      </placeholder>
    )
  }
}]

DateTime.defaultProps = {
  includeAt: false,
  allowPast: true
}
