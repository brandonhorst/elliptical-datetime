# `lacona-phrase-datetime`

Phrases to allow Lacona to understand natural language dates, times, and more. Maintained as part of the Lacona core. While multiple languages will be supported in the future, only the Gregorian calendar will be supported (no historical or Lunar calendars).

## Usage Notes

Complex phrases themselves allow for implied components. That is to say, "January 3rd" is a valid `DateTime`. The year is implied based upon the current year, and the time of day defaults to 8am. Beacuse of this, custom phrases making use of dates should never have a construct like this:

```xml
<choice>
  <DateTime />
  <Date />
  <Time />
</choice>
```

The `DateTime` itself allows `Date`s and `Time`s to be entered alone, so such a setup just causes problems. Instead, use props like `impliedTime` to modify the default settings.

## Example

```js
import { DateTime } from 'lacona-phrase-datetime'
import { String } from 'lacona-phrase-string'

lacona.grammar = (
  <sequence>
    <literal text='remind me to ' />
    <String id='title' />
    <DateTime id='date' past={false} />
  </sequence>
)

/*
  Lacona will now understand:
    - remind me to wash the car tomorrow [implies 8am]
    - remind me to wash the car this afternoon at 5
    - remind me to wash the car at 6:32pm [implies today, unless it is currently after 6:32pm, in which case it implies tomorrow]
    - remind me to wash the car at 4pm on Saturday
    - remind me to wash the car 3 days before December 25 [implies 8am]
*/

```

## Phrases

### `Time`

A phrase that represents a specific time of day.

#### Result

```js
{
  hour: <Integer>, // the hour in 24-hour time. 0 for midnight, 12 for noon, 20 for 8pm
  minute: <Integer>, // 0 if unspecified. Minimum of 0, maximum of 59
  second: <Integer> // 0 if unspecified. Minimum of 0, maximum of 59
}
```

#### Props

- `prepositions`: `Boolean` - defaults to `false`. Allow the user to input standard prepositions, in applicable languages. In English, this means things like:
    * 'at 3pm' vs '3pm'
- `seconds`: `Boolean` - defaults to `true`. Can the user input times that include seconds? If not, `result.seconds` will always be 0.

### `DayOfTheYear`

A phrase that represents a specific date, with no time or year information. This is useful for representing Birthdays, annual holidays etc.

#### Result

```js
{
  month: <Integer>, // the 0-indexed month of the year. 0 for January, 11 for December
  day: <Integer> // the 1-indexed day of the month.
}
```

#### Props

- `prepositions`: `Boolean` - defaults to `false`. Allow the user to input standard prepositions, in applicable languages. In English, this means things like:
    * 'on January 2nd' vs 'January 2nd'

### `Date`

A phrase that represents a specific date, with no time information.

Note that the user does not necessarily need to specify the full date. If the user enters a date without a specified year:

- `DayOfTheYear` without a specified year: If `future` and `past` are true, this implies `<DayOfTheYear> this year`. If `future` is `false`, it represents the most recent `<DayOfTheYear>` (either this year or last year depending on the current date). If `past` is false, it represents the closest upcoming `<DayOfTheYear>` (either this year or next year depending on the current date).

#### Result

```js
{
  year: <Integer>, // the CE year in the Gregorian calendar. BCE Dates are unsupported
  month: <Integer>, // the 0-indexed month of the year. 0 for January, 11 for December
  day: <Integer>, // the 1-indexed day of the month.
}
```

#### Props

- `prepositions`: `Boolean` - defaults to `false`. Allow the user to input standard prepositions, in applicable languages. In English, this means things like:
    * 'on January 2nd' vs 'January 2nd'
- `future`: `Boolean` - defaults to `true`. Can the user input dates in the future?
- `past`: `Boolean` - defaults to `true`. Can the user input dates in the past?

### `DateTime`

A phrase that represents a specific point in time.

Note that the user does not necessarily need to specify the full date and time. If the user enters a:

- `Time`: If `future` and `past` are true, this implies `<Time> today`. If `future` is `false`, it represents the most recent `<Time>` (either today or yesterday depending on the current time). If `past` is false, it represents the closest upcoming `<Time>` (either today or tomorrow depending on the current time).
- `Date`: The start time is implied as `<impliedTime> <Date>` (`impliedTime` defaults to 8:00).

#### Result

`Javascript Date object`

#### Props

- `impliedTime`: `Date` - defaults to `new Date(8:00)`. The time of day to use for `start` if only the day is specified. The year/month/day components of the `Date` object are ignored.
- `prepositions`: `Boolean` - defaults to `false`. Allow the user to input standard prepositions, in applicable languages. In English, this means things like:
    * 'on January 2nd at 3pm' vs 'January 2nd at 3pm'
    * 'at 3pm tomorrow' vs '3pm tomorrow'
- `seconds`: `Boolean` - defaults to `true`. Can the user input times that include seconds?
- `future`: `Boolean` - defaults to `true`. Can the user input points in the future?
- `past`: `Boolean` - defaults to `true`. Can the user input points in the past?

### `Duration`, `TimeDuration`, and `DateDuration`

A phrase that expresses an amount of time without a specific start or end point. In English, this is usually represented with strings like "2 weeks and a day".

Note that a duration does not imply an amount of absolute time. For example, the duration "1 month" represents a different amount of milliseconds if applied to "1 month from March 1st" (April 1st, 31 days away) than "1 month from April 1st" (May 1st, 30 days away).

`TimeDuration` only allows units of time that are smaller than a single day. Note that the actual time represented could still be larger than a day ("28 hours and 5 minutes"). Use the `max` property to restrict this range (`max={hours: 24}`).

`DateDuration` only allows units of time that are a day or larger.

`Duration` allows a combination of date and time units.

#### Result

An object of the form:

```js
{
  years: <Number>,
  months: <Number>,
  days: <Number,
  hours: <Number>,
  minutes: <Number>,
  seconds: <Number>
}
```

For `TimeDuration`, `years`, `months`, and `days` will always be undefined. For `DateDuration`, `hours`, `minutes`, and `seconds` will always be undefined. At least one property will always be defined.

Note other units of time that are simply multiples of these 6 units (weeks, decades, double hours, etc.) are converted to these 6 units for output. Any units that cannot be reprented absolutely using these 6 units (lunar months, etc.) are unsupported.f

This object is designed to be easily consumed and manipulated by [`moment.duration`](http://momentjs.com/docs/#/durations/).

Fractional seconds are currently unsupported.

#### Props

- `seconds`: `Boolean` - Can the user input durations in seconds? (`TimeDuration` and `Duration` only)

### `Range`

Represents an absolute period of time, with a beginning DateTime and an ending DateTime. This can take many forms linguistically.

Note that the user does not necessarily need to fully specify the start and end. `Range` makes some suggestions for simplicity. For example, if the user enters a:

- `Time`: If `future` and `past` are true, this implies `<Time> today`. If `future` is `false`, it represents the most recent `<Time>` (either today or yesterday depending on the current time). If `past` is false, it represents the closest upcoming `<Time>` (either today or tomorrow depending on the current time). The end time is `impliedDuration` after the start time (`impliedDuration` defaults to 1 hour).
- `Date`: The start time is implied as `<impliedTime> <Date>` (`impliedTime` defaults to 8:00).
- `DateTime`: The end time is `impliedDuration` after `<DateTime>` (`impliedDuration` defaults to 1 hour).

#### Result

An object of the form

```js
{
  start: <Javascript Date object>,
  end: <Javascript Date object>
}
```

`end` will always be after `start`.

#### Props

- `impliedDuration`: `Duration` - defaults to `{hours: 1}`. The amount of time between `start` and `end` if the user does not indicate it directly.
- `impliedTime`: `Date` - defaults to `new Date(8:00)`. The time of day to use for `start` if only the day is specified. The year/month/day components of the `Date` object are ignored.
- `prepositions`: `Boolean` - defaults to `false`. Allow the user to input standard prepositions, in applicable languages. In English, this means things like:
    * 'from 3pm to 4pm' vs '3pm to 4pm'
    * 'on January 2nd for 3 hours' vs 'January 2nd for 3 hours'
- `seconds`: `Boolean` - defaults to `true`. Can the user input ranges that include seconds?
- `future`: `Boolean` - defaults to `true`. Can the user input ranges that end in the future?
- `past`: `Boolean` - defaults to `true`. Can the user input ranges that begin in the past?
