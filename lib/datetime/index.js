'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
/** @jsx createElement */

var _createElement$Phrase = require('lacona-phrase');

var _Time = require('../time');

var _Time2 = _interopRequireWildcard(_Time);

var _DatePhrase = require('../date');

var _DatePhrase2 = _interopRequireWildcard(_DatePhrase);

var DateTime = (function (_Phrase) {
  function DateTime() {
    _classCallCheck(this, DateTime);

    if (_Phrase != null) {
      _Phrase.apply(this, arguments);
    }
  }

  _inherits(DateTime, _Phrase);

  return DateTime;
})(_createElement$Phrase.Phrase);

exports['default'] = DateTime;

DateTime.translations = [{
  langs: ['en_US', 'default'],
  describe: function describe() {
    return _createElement$Phrase.createElement(
      'choice',
      null,
      _createElement$Phrase.createElement(
        'sequence',
        null,
        this.props.includeAt ? _createElement$Phrase.createElement('literal', { text: 'at ' }) : null,
        _createElement$Phrase.createElement(
          'placeholder',
          { descriptor: 'time' },
          _createElement$Phrase.createElement(_Time2['default'], { id: 'time' })
        ),
        _createElement$Phrase.createElement('literal', { text: ' ' }),
        _createElement$Phrase.createElement(
          'placeholder',
          { descriptor: 'date' },
          _createElement$Phrase.createElement(_DatePhrase2['default'], { id: 'date' })
        )
      ),
      _createElement$Phrase.createElement(
        'sequence',
        null,
        _createElement$Phrase.createElement(
          'placeholder',
          { descriptor: 'date' },
          _createElement$Phrase.createElement(_DatePhrase2['default'], { id: 'date' })
        ),
        _createElement$Phrase.createElement('literal', { text: ' at ' }),
        _createElement$Phrase.createElement(
          'placeholder',
          { descriptor: 'time' },
          _createElement$Phrase.createElement(_Time2['default'], { id: 'time' })
        )
      )
    );
  }
}];

DateTime.defaultProps = {
  includeAt: false
};
module.exports = exports['default'];

// getValue (result) {
//
//   return new Date(
//     result.date.getFullYear(), result.date.getMonth(), result.date.getDate(),
//     result.time.getHours(), result.time.getMinutes(), result.time.getSeconds()
//   )
// }