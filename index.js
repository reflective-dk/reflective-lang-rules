"use strict";

var Promise = require('bluebird');
var pattern = require('./lib/pattern-parsers');
var stack = require('./lib/stack');
var cmbs = require('./lib/combinators');

module.exports = RuleParser;

function RuleParser(options) {
    this.options = options || {};
}

RuleParser.prototype.parse = function(input) {
    return cmbs.lift(input)
        .then(pattern.parsePattern)
        .then(stack.pop());
};
