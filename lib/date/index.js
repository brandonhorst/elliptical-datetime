'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/** @jsx createElement */

var _createElement$Phrase = require('lacona-phrase');

var _DigitString$Integer = require('lacona-phrase-number');

var DatePhrase = (function (_Phrase) {
  function DatePhrase() {
    _classCallCheck(this, DatePhrase);

    if (_Phrase != null) {
      _Phrase.apply(this, arguments);
    }
  }

  _inherits(DatePhrase, _Phrase);

  return DatePhrase;
})(_createElement$Phrase.Phrase);

exports['default'] = DatePhrase;

DatePhrase.translations = [{
  langs: ['en_US', 'default'],
  describe: function describe() {
    return _createElement$Phrase.createElement(
      'choice',
      null,
      _createElement$Phrase.createElement(NamedDay, { allowPast: this.props.allowPast }),
      this.props.allowRecurse ? _createElement$Phrase.createElement(RecursiveDay, { allowPast: this.props.allowPast }) : null,
      _createElement$Phrase.createElement(RelativeNumbered, { allowPast: this.props.allowPast }),
      _createElement$Phrase.createElement(RelativeAdjacent, { allowPast: this.props.allowPast }),
      _createElement$Phrase.createElement(RelativeWeekday, { allowPast: this.props.allowPast }),
      _createElement$Phrase.createElement(AbsoluteDay, { allowPast: this.props.allowPast })
    );
  }
}];
DatePhrase.defaultProps = {
  allowRecurse: true,
  allowPast: true
};

var RecursiveDay = (function (_Phrase2) {
  function RecursiveDay() {
    _classCallCheck(this, RecursiveDay);

    if (_Phrase2 != null) {
      _Phrase2.apply(this, arguments);
    }
  }

  _inherits(RecursiveDay, _Phrase2);

  _createClass(RecursiveDay, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(
        'sequence',
        null,
        _createElement$Phrase.createElement(TimeDenomination, { includeThe: true }),
        _createElement$Phrase.createElement('list', { items: [' before ', ' after ', ' from '], limit: 2 }),
        _createElement$Phrase.createElement(
          'placeholder',
          { descriptor: 'date' },
          _createElement$Phrase.createElement(DatePhrase, { id: 'recursiveDate', allowRecurse: false })
        )
      );
    }
  }]);

  return RecursiveDay;
})(_createElement$Phrase.Phrase);

var AbsoluteDay = (function (_Phrase3) {
  function AbsoluteDay() {
    _classCallCheck(this, AbsoluteDay);

    if (_Phrase3 != null) {
      _Phrase3.apply(this, arguments);
    }
  }

  _inherits(AbsoluteDay, _Phrase3);

  _createClass(AbsoluteDay, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(
        'sequence',
        null,
        _createElement$Phrase.createElement(_DigitString$Integer.DigitString, { maxLength: 2, descriptor: 'mm' }),
        _createElement$Phrase.createElement('list', { items: ['/', '-'], limit: 1 }),
        _createElement$Phrase.createElement(_DigitString$Integer.DigitString, { maxLength: 2, descriptor: 'dd' }),
        _createElement$Phrase.createElement(
          'sequence',
          { optional: true },
          _createElement$Phrase.createElement('list', { items: ['/', '-'], limit: 1 }),
          _createElement$Phrase.createElement(
            'choice',
            null,
            _createElement$Phrase.createElement(_DigitString$Integer.DigitString, { minLength: 2, maxLength: 2, descriptor: 'yy' }),
            _createElement$Phrase.createElement(_DigitString$Integer.DigitString, { minLength: 4, maxLength: 4, descriptor: 'yyyy' })
          )
        )
      );
    }
  }]);

  return AbsoluteDay;
})(_createElement$Phrase.Phrase);

var NamedDay = (function (_Phrase4) {
  function NamedDay() {
    _classCallCheck(this, NamedDay);

    if (_Phrase4 != null) {
      _Phrase4.apply(this, arguments);
    }
  }

  _inherits(NamedDay, _Phrase4);

  _createClass(NamedDay, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(
        'choice',
        null,
        _createElement$Phrase.createElement('literal', { text: 'today', value: { relative: 'd', num: 0 } }),
        _createElement$Phrase.createElement('literal', { text: 'tomorrow', value: { relative: 'd', num: 1 } }),
        _createElement$Phrase.createElement('literal', { text: 'yesterday', value: { relative: 'd', num: -1 } })
      );
    }
  }]);

  return NamedDay;
})(_createElement$Phrase.Phrase);

var TimeDenomination = (function (_Phrase5) {
  function TimeDenomination() {
    _classCallCheck(this, TimeDenomination);

    if (_Phrase5 != null) {
      _Phrase5.apply(this, arguments);
    }
  }

  _inherits(TimeDenomination, _Phrase5);

  _createClass(TimeDenomination, [{
    key: 'describe',
    value: function describe() {
      var singularItems = this.props.includeThe ? ['1', 'the'] : ['1'];

      return _createElement$Phrase.createElement(
        'choice',
        null,
        _createElement$Phrase.createElement(
          'sequence',
          null,
          _createElement$Phrase.createElement(
            'placeholder',
            { descriptor: 'number', showForEmpty: true },
            _createElement$Phrase.createElement('list', { items: singularItems, id: 'num', value: 1, limit: 1 })
          ),
          _createElement$Phrase.createElement('literal', { text: ' ' }),
          _createElement$Phrase.createElement(
            'placeholder',
            { descriptor: 'time period' },
            _createElement$Phrase.createElement(
              'choice',
              { id: 'relative' },
              _createElement$Phrase.createElement('literal', { text: 'day', value: 'd' }),
              _createElement$Phrase.createElement('literal', { text: 'week', value: 'w' }),
              _createElement$Phrase.createElement('literal', { text: 'month', value: 'M' }),
              _createElement$Phrase.createElement('literal', { text: 'year', value: 'y' })
            )
          )
        ),
        _createElement$Phrase.createElement(
          'sequence',
          null,
          _createElement$Phrase.createElement(_DigitString$Integer.Integer, { id: 'num', min: 2 }),
          _createElement$Phrase.createElement('literal', { text: ' ' }),
          _createElement$Phrase.createElement(
            'placeholder',
            { descriptor: 'time period' },
            _createElement$Phrase.createElement(
              'choice',
              { id: 'relative' },
              _createElement$Phrase.createElement('literal', { text: 'days', value: 'd' }),
              _createElement$Phrase.createElement('literal', { text: 'weeks', value: 'w' }),
              _createElement$Phrase.createElement('literal', { text: 'months', value: 'M' }),
              _createElement$Phrase.createElement('literal', { text: 'years', value: 'y' })
            )
          )
        )
      );
    }
  }]);

  return TimeDenomination;
})(_createElement$Phrase.Phrase);

TimeDenomination.defaultProps = {
  includeThe: false
};

var RelativeNumbered = (function (_Phrase6) {
  function RelativeNumbered() {
    _classCallCheck(this, RelativeNumbered);

    if (_Phrase6 != null) {
      _Phrase6.apply(this, arguments);
    }
  }

  _inherits(RelativeNumbered, _Phrase6);

  _createClass(RelativeNumbered, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(
        'choice',
        null,
        _createElement$Phrase.createElement(
          'sequence',
          null,
          _createElement$Phrase.createElement('literal', { text: 'in ' }),
          _createElement$Phrase.createElement(TimeDenomination, null)
        ),
        this.props.allowPast ? _createElement$Phrase.createElement(
          'sequence',
          null,
          _createElement$Phrase.createElement(TimeDenomination, null),
          _createElement$Phrase.createElement('literal', { text: ' ago' })
        ) : null
      );
    }
  }]);

  return RelativeNumbered;
})(_createElement$Phrase.Phrase);

var RelativeAdjacent = (function (_Phrase7) {
  function RelativeAdjacent() {
    _classCallCheck(this, RelativeAdjacent);

    if (_Phrase7 != null) {
      _Phrase7.apply(this, arguments);
    }
  }

  _inherits(RelativeAdjacent, _Phrase7);

  _createClass(RelativeAdjacent, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(
        'sequence',
        null,
        _createElement$Phrase.createElement(
          'choice',
          null,
          _createElement$Phrase.createElement('literal', { text: 'next ' }),
          _createElement$Phrase.createElement('literal', { text: 'last ' })
        ),
        _createElement$Phrase.createElement(
          'choice',
          null,
          _createElement$Phrase.createElement(
            'placeholder',
            { descriptor: 'week, month, year' },
            _createElement$Phrase.createElement('literal', { text: 'week', value: 'w' }),
            _createElement$Phrase.createElement('literal', { text: 'month', value: 'M' }),
            _createElement$Phrase.createElement('literal', { text: 'year', value: 'y' })
          )
        )
      );
    }
  }]);

  return RelativeAdjacent;
})(_createElement$Phrase.Phrase);

var RelativeWeekday = (function (_Phrase8) {
  function RelativeWeekday() {
    _classCallCheck(this, RelativeWeekday);

    if (_Phrase8 != null) {
      _Phrase8.apply(this, arguments);
    }
  }

  _inherits(RelativeWeekday, _Phrase8);

  _createClass(RelativeWeekday, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(
        'sequence',
        null,
        _createElement$Phrase.createElement(
          'choice',
          { optional: true },
          _createElement$Phrase.createElement('literal', { text: 'last ' }),
          _createElement$Phrase.createElement('literal', { text: 'this ' }),
          _createElement$Phrase.createElement('literal', { text: 'next ' })
        ),
        _createElement$Phrase.createElement(
          'placeholder',
          { descriptor: 'weekday' },
          _createElement$Phrase.createElement(Weekday, null)
        )
      );
    }
  }]);

  return RelativeWeekday;
})(_createElement$Phrase.Phrase);

var Weekday = (function (_Phrase9) {
  function Weekday() {
    _classCallCheck(this, Weekday);

    if (_Phrase9 != null) {
      _Phrase9.apply(this, arguments);
    }
  }

  _inherits(Weekday, _Phrase9);

  _createClass(Weekday, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement('list', { items: [{ text: 'Sunday', value: 0 }, { text: 'Monday', value: 1 }, { text: 'Tuesday', value: 2 }, { text: 'Wednesday', value: 3 }, { text: 'Thursday', value: 4 }, { text: 'Friday', value: 5 }, { text: 'Saturday', value: 6 }] });
    }
  }]);

  return Weekday;
})(_createElement$Phrase.Phrase);

module.exports = exports['default'];

//   getValue (result) {
//     if (typeof result.relativeDay === 'number') {
//       const date = new Date()
//       date.setHours(0, 0, 0, 0)
//       date.setDate(date.getDate() + result.relativeDay)
//       return date
//     } else if (typeof result.recursiveDay === 'number') {
//       const date = result.recursiveDate
//       date.setHours(0, 0, 0, 0)
//       date.setDate(date.getDate() + result.recursiveDay)
//       return date
//     }
//     console.log('Something went wrong with Date', result)
//     return new Date()
//   }