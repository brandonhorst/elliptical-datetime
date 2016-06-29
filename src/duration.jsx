/** @jsx createElement */
import _ from 'lodash'
import {createElement} from 'elliptical'
import {Integer} from 'elliptical-number'

function isUnique (array) {
  return _.uniq(array).length === array.length
}

function filterBase (option) {
  return isUnique(_.map(option.result, 'id'))
}

const BaseDuration = {
  mapResult (result) {
    const newResult = {}
    _.forEach(result, ({num, type}) => {
      newResult[type] = (newResult[type] || 0) + num
    })
    return newResult
  },

  describe ({props, children}) {
    return (
      <placeholder text={props.name}>
        <filter outbound={filterBase} skipIncomplete>
          <repeat separator={<list items={[', ', ' and ', ', and ']} limit={1} category='conjunction' />}>
            {children}
          </repeat>
        </filter>
      </placeholder>
    )
  }
}

const InternalDuration = {
  mapResult (result) {
    return {
      id: result.id,
      type: result.type,
      num: result.num * (result.multiplier || 1)
    }
  },

  describe ({props}) {
    const singularDurations = (props.type !== 'time'
      ? [
        {text: 'day', value: {id: 'days', type: 'days'}},
        {text: 'fortnight', value: {id: 'fortnights', type: 'days', multiplier: 14}},
        {text: 'week', value: {id: 'weeks', type: 'days', multiplier: 7}},
        {text: 'month', value: {id: 'months', type: 'months'}},
        {text: 'year', value: {id: 'years', type: 'years'}}
      ]
      : []
    ).concat(props.type !== 'date'
      ? [
        {text: 'hour', value: {id: 'hours', type: 'hours'}},
        {text: 'minute', value: {id: 'minutes', type: 'minutes'}},
      ]
      : []
    ).concat(props.type !== 'date' && props.seconds
      ? [{text: 'second', value: {id: 'seconds', type: 'seconds'}}]
      : []
    )

    const pluralDurations = _.map(singularDurations, ({text, value}) => ({
      text: `${text}s`,
      value
    }))

    return (
      <choice limit={1}>
        <sequence>
          <Integer max={1} min={1} id='num' limit={1} />
          <literal text=' ' />
          <placeholder text='time period' merge>
            <list items={singularDurations} />
          </placeholder>
        </sequence>
        <sequence>
          <Integer id='num' min={2} limit={1} />
          <literal text=' ' />
          <placeholder text='time period' merge>
            <list items={pluralDurations} />
          </placeholder>
        </sequence>
      </choice>
    )
  }
}

export const DateDuration = {
  defaultProps: {
    argument: 'date duration'
  },
  describe ({props}) {
    return (
      <BaseDuration name={props.argument}>
        <InternalDuration type='date' seconds={props.seconds} />
      </BaseDuration>
    )
  }
}

export const TimeDuration = {
  defaultProps: {
    seconds: true,
    argument: 'time duration'
  },

  describe ({props}) {
    return (
      <BaseDuration name={props.argument}>
        <InternalDuration type='time' seconds={props.seconds} />
      </BaseDuration>
    )
  }
}

export const Duration = {
  defaultProps: {
    seconds: false,
    argument: 'duration'
  },
  describe ({props}) {
    return (
      <BaseDuration name={props.argument}>
        <InternalDuration seconds={props.seconds} />
      </BaseDuration>
    )
  }
}
