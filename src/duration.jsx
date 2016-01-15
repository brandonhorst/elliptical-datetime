/** @jsx createElement */
import _ from 'lodash'
import { createElement, Phrase } from 'lacona-phrase'
import { Integer } from 'lacona-phrase-number'

function isUnique (array) {
  return _.uniq(array).length === array.length
}

class BaseDuration extends Phrase {
  getValue (result) {
    const output = {}
    _.forEach(result, ({num, type}) => {
      output[type] = (output[type] || 0) + num
    })
    return output
  }

  filter (results) {
    return isUnique(_.map(results, 'id'))
  }

  describe () {
    return (
      <label text={this.props.argument}>
        <map function={this.getValue}>
          <filter function={this.filter}>
            <repeat separator={<list items={[', and ', ' and ', ', ']} limit={1} category='conjunction' />}>
              {this.childDescribe()}
            </repeat>
          </filter>
        </map>
      </label>
    )
  }
}

class InternalDuration extends Phrase {
  getValue ({id, type, num, multiplier = 1 }) {
    return {id, type, num: num * multiplier}
  }

  describe () {
    const singularDurations = (this.props.type !== 'time'
      ? [
        {text: 'day', value: {id: 'days', type: 'days'}},
        {text: 'fortnight', value: {id: 'fortnights', type: 'days', multiplier: 14}},
        {text: 'week', value: {id: 'weeks', type: 'days', multiplier: 7}},
        {text: 'month', value: {id: 'months', type: 'months'}},
        {text: 'year', value: {id: 'years', type: 'years'}}
      ]
      : []
    ).concat(this.props.type !== 'date'
      ? [
        {text: 'hour', value: {id: 'hours', type: 'hours'}},
        {text: 'minute', value: {id: 'minutes', type: 'minutes'}},
      ]
      : []
    ).concat(this.props.type !== 'date' && this.props.seconds
      ? [{text: 'second', value: {id: 'seconds', type: 'seconds'}}]
      : []
    )

    const pluralDurations = _.map(singularDurations, ({text, value}) => ({
      text: `${text}s`,
      value
    }))

    return (
      <map function={this.getValue}>
        <choice limit={1}>
          <sequence>
            <Integer max={1} min={1} id='num' />
            <literal text=' ' />
            <label text='time period' merge>
              <list items={singularDurations} />
            </label>
          </sequence>
          <sequence>
            <Integer id='num' min={2} />
            <literal text=' ' />
            <label text='time period' merge>
              <list items={pluralDurations} />
            </label>
          </sequence>
        </choice>
      </map>
    )
  }
}

export class DateDuration extends BaseDuration {
  static defaultProps = {
    argument: 'date duration'
  }
  childDescribe() {
    return <InternalDuration argument={this.props.argument} type='date' />
  }
}

export class TimeDuration extends BaseDuration {
  static defaultProps = {
    seconds: true,
    argument: 'time duration'
  }

  childDescribe() {
    return <InternalDuration argument={this.props.argument} type='time' seconds={this.props.seconds} />
  }
}

export class Duration extends BaseDuration {
  static defaultProps = {
    seconds: true,
    argument: 'duration'
  }

  childDescribe() {
    return <InternalDuration argument={this.props.argument} seconds={this.props.seconds} />
  }
}
