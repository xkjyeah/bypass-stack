"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var sumOf1To = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(n) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(n == 0)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return", 0);

          case 2:
            _context.next = 4;
            return _promise2.default.resolve(0);

          case 4:
            _context.t0 = n;
            _context.next = 7;
            return sumOf1To(n - 1);

          case 7:
            _context.t1 = _context.sent;
            return _context.abrupt("return", _context.t0 + _context.t1);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function sumOf1To(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

sumOf1To(100000).then(function (sum) {
  return console.log(sum);
}).catch(function (err) {
  return console.log(err.stack);
});
