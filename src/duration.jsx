/** @jsx createElement */
import _ from 'lodash'
import {createElement, Phrase} from 'lacona-phrase'
import {Integer} from 'lacona-phrase-number'

function isUnique (array) {
  return _.uniq(array).length === array.length
}

class BaseDuration extends Phrase {
  getValue (result) {
    const output = {}
    _.forEach(result, ({num, type}) => {
      output[type] = (output[type] || 0) +  num
    })
    return output
  }

  filter (results) {
    return isUnique(_.map(results, 'id'))
  }

  describe () {
    return (
      <repeat separator={<list items={[', and ', ' and ', ', ']} limit={1} category='conjunction' />}>
        {this.childDescribe()}
      </repeat>
    )
  }
}

class InternalDuration extends Phrase {
  getValue ({id, type, num, multiplier = 1}) {
    return {id, type, num: num * multiplier}
  }

  describe () {
    return (
      <choice limit={1}>
        <sequence>
          <Integer max={1} min={1} id='num' />
          <literal text=' ' />
          <placeholder text='time period' merge={true}>
            <choice>
              {this.props.type !== 'time' ? [
                  <literal text='day' value={{id: 'days', type: 'days'}}  />,
                  <literal text='fortnight' value={{id: 'fortnights', type: 'days', multiplier: 14}} />,
                  <literal text='week' value={{id: 'weeks', type: 'days', multiplier: 7}} />,
                  <literal text='month' value={{id: 'months', type: 'months'}} />,
                  <literal text='year' value={{id: 'years', type: 'years'}} />
              ] : null}
              {this.props.type !== 'date' ? [
                <literal text='hour' value={{id: 'hours', type: 'hours'}} />,
                <literal text='minute' value={{id: 'minutes', type: 'minutes'}} />,
                this.props.seconds ? <literal text='second' value={{id: 'seconds', type: 'seconds'}} /> : null
              ] : null}
            </choice>
          </placeholder>
        </sequence>
        <sequence>
          <Integer id='num' min={2} />
          <literal text=' ' />
          <placeholder text='time period' merge={true}>
            <choice>
              {this.props.type !== 'time' ? [
                <literal text='days' value={{id: 'days', type: 'days'}}  />,
                <literal text='fortnights' value={{id: 'fortnights', type: 'days', multiplier: 14}} />,
                <literal text='weeks' value={{id: 'weeks', type: 'days', multiplier: 7}} />,
                <literal text='months' value={{id: 'months', type: 'months'}} />,
                <literal text='years' value={{id: 'years', type: 'years'}} />
              ] : null}
              {this.props.type !== 'date' ? [
                <literal text='hours' value={{id: 'hours', type: 'hours'}} />,
                <literal text='minutes' value={{id: 'minutes', type: 'minutes'}} />,
                this.props.seconds ? <literal text='seconds' value={{id: 'seconds', type: 'seconds'}} /> : null
              ] : null}
            </choice>
          </placeholder>
        </sequence>
      </choice>
    )
  }
}


export class DateDuration extends BaseDuration {
  childDescribe () {
    return <InternalDuration type='date' />
  }
}

export class TimeDuration extends BaseDuration {
  childDescribe () {
    return <InternalDuration type='time' seconds={this.props.seconds} />
  }
}

TimeDuration.defaultProps = {
  seconds: true
}

export class Duration extends BaseDuration {
  childDescribe () {
    return <InternalDuration seconds={this.props.seconds} />
  }
}

Duration.defaultProps = {
  seconds: true
}
