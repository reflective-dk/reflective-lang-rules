"use strict";

var util = require('./util');
var text = require('./text-util');
var ast = require('./ast');
var stack = require('./stack');
var cmbs = require('./combinators');
var lift = cmbs.lift, match = cmbs.match, until = cmbs.until, many = cmbs.many;
var tags = require('./tags');
var rule = require('./rule-parsers');

module.exports = {
    parsePattern: parsePattern,
    parsePatternTitle: parsePatternTitle,
    parsePatternDescription: parsePatternDescription
};

function parsePattern(state) {
    return lift(state)
        .then(parsePatternTitle)
        .then(parsePatternDescription)
        .then(many(rule.parseRule))
        .then(function(result) {
            if (result.rest.trim().length) {
                return util.error('parsePattern', 'more input left', result);
            }
            var st = util.newState(result);
            var rules = st.stack.pop();
            var description = st.stack.pop();
            var title = st.stack.pop();
            st.stack.push(new ast.PatternNode(title, description, rules));
            return st;
        });
}

function parsePatternTitle(state) {
    return lift(state)
        .then(match(tags.patternKey))
        .then(until(tags.eol))
        .then(stack.pushNode(ast.StringNode));
}

function parsePatternDescription(state) {
    return lift(state)
        .then(cmbs.alt([ until(tags.ruleKey), until(tags.eof) ]))
        .then(stack.push(text.textNodes));
}
