'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/** @jsx createElement */

var _import = require('lodash');

var _import2 = _interopRequireWildcard(_import);

var _createElement$Phrase = require('lacona-phrase');

var _DigitString$Integer = require('lacona-phrase-number');

var Time = (function (_Phrase) {
  function Time() {
    _classCallCheck(this, Time);

    if (_Phrase != null) {
      _Phrase.apply(this, arguments);
    }
  }

  _inherits(Time, _Phrase);

  return Time;
})(_createElement$Phrase.Phrase);

exports['default'] = Time;

Time.translations = [{
  langs: ['en_US', 'default'],
  describe: function describe() {
    return _createElement$Phrase.createElement(
      'choice',
      null,
      _createElement$Phrase.createElement('literal', { text: 'midnight', id: 'hour', value: 0 }),
      _createElement$Phrase.createElement('literal', { text: 'noon', id: 'hour', value: 12 }),
      _createElement$Phrase.createElement(AbsTime, { minutes: true }),
      _createElement$Phrase.createElement(RelativeTime, null)
    );
  }
}];

var RelativeTime = (function (_Phrase2) {
  function RelativeTime() {
    _classCallCheck(this, RelativeTime);

    if (_Phrase2 != null) {
      _Phrase2.apply(this, arguments);
    }
  }

  _inherits(RelativeTime, _Phrase2);

  _createClass(RelativeTime, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(
        'sequence',
        null,
        _createElement$Phrase.createElement(
          'placeholder',
          { descriptor: 'number', showForEmpty: true },
          _createElement$Phrase.createElement(
            'choice',
            { id: 'differential' },
            _createElement$Phrase.createElement('literal', { text: 'quarter', value: 15 }),
            _createElement$Phrase.createElement('literal', { text: 'half', value: 30 }),
            _createElement$Phrase.createElement(
              'sequence',
              null,
              _createElement$Phrase.createElement(_DigitString$Integer.Integer, { min: 1, max: 59 }),
              _createElement$Phrase.createElement('literal', { optional: true, text: ' minutes' })
            )
          )
        ),
        _createElement$Phrase.createElement(
          'choice',
          { id: 'direction' },
          _createElement$Phrase.createElement('literal', { text: ' past ', value: 1 }),
          _createElement$Phrase.createElement(
            'choice',
            { limit: 1, value: -1 },
            _createElement$Phrase.createElement('literal', { text: ' to ' }),
            _createElement$Phrase.createElement('literal', { text: ' of ' }),
            _createElement$Phrase.createElement('literal', { text: ' til ' })
          )
        ),
        _createElement$Phrase.createElement(
          'placeholder',
          { descriptor: 'some hour', id: 'hour' },
          _createElement$Phrase.createElement(
            'choice',
            null,
            _createElement$Phrase.createElement(AbsTime, { minutes: false }),
            _createElement$Phrase.createElement('literal', { text: 'midnight', value: 0 }),
            _createElement$Phrase.createElement('literal', { text: 'noon', value: 12 })
          )
        )
      );
    }
  }]);

  return RelativeTime;
})(_createElement$Phrase.Phrase);

var AbsTime = (function (_Phrase3) {
  function AbsTime() {
    _classCallCheck(this, AbsTime);

    if (_Phrase3 != null) {
      _Phrase3.apply(this, arguments);
    }
  }

  _inherits(AbsTime, _Phrase3);

  _createClass(AbsTime, [{
    key: 'getValue',
    value: function getValue(result) {
      var date = new Date();

      var hour = parseInt(result.hour);
      if (result.ampm) {
        hour = result.ampm === 'am' ? hour === 12 ? 0 : hour : hour + 12;
      }
      var minute = result.minute ? parseInt(result.minute) : 0;
      date.setHours(hour, minute, 0, 0);

      return date;
    }
  }, {
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(
        'sequence',
        null,
        _createElement$Phrase.createElement(_DigitString$Integer.DigitString, { descriptor: 'hour', min: 1, max: 12, allowLeadingZeros: false, id: 'hour' }),
        this.props.minutes ? _createElement$Phrase.createElement(
          'sequence',
          { optional: true, merge: true },
          _createElement$Phrase.createElement('literal', { text: ':' }),
          _createElement$Phrase.createElement(Minutes, null)
        ) : null,
        _createElement$Phrase.createElement(
          'choice',
          { id: 'ampm' },
          _createElement$Phrase.createElement('list', { items: [' am', 'am', ' a', 'a', ' a.m.', 'a.m.', ' a.m', 'a.m'], value: 'am', limit: 1 }),
          _createElement$Phrase.createElement('list', { items: [' pm', 'pm', ' p', 'p', ' p.m.', 'p.m.', ' p.m', 'p.m'], value: 'pm', limit: 1 })
        )
      );
    }
  }]);

  return AbsTime;
})(_createElement$Phrase.Phrase);

AbsTime.defaultProps = { minutes: true };

var Minutes = (function (_Phrase4) {
  function Minutes() {
    _classCallCheck(this, Minutes);

    if (_Phrase4 != null) {
      _Phrase4.apply(this, arguments);
    }
  }

  _inherits(Minutes, _Phrase4);

  _createClass(Minutes, [{
    key: 'describe',
    value: function describe() {
      return _createElement$Phrase.createElement(_DigitString$Integer.DigitString, { descriptor: 'minutes', max: 59, minLength: 2, maxLength: 2, id: 'minute' });
    }
  }]);

  return Minutes;
})(_createElement$Phrase.Phrase);

module.exports = exports['default'];

// getValue (result) {
//   if (_.isDate(result)) {
//     return result
//   } else if (result.hour != null) {
//     const date = new Date()
//     date.setHours(result.hour, 0, 0, 0)
//     return date
//   }
//   else {
//     console.log('SOMETHING WENT WRONG WITH Time')
//     return new Date()
//   }
// }