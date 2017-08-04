"use strict";

var ast = require('reflective-lang-ast');
var util = require('./util');
var stack = require('./stack');
var cmbs = require('./combinators');
var lift = cmbs.lift, opt = cmbs.opt, alt = cmbs.alt,
    match = cmbs.match, until = cmbs.until;
var tags = require('./tags');
var exp = require('./exp-parsers');
var value = require('./value-parsers');

module.exports = {
    parseRule: parseRule,
    parseRuleDescription: parseRuleDescription,
    parsePartitioning: parsePartitioning,
    parseFilter: parseFilter,
    parseWhenThen: parseWhenThen,
    parseAlways: parseAlways
};

function parseRule(state) {
    return lift(state)
        .then(match(tags.ruleKey))
        .then(parseRuleDescription)
        .then(parsePartitioning)
        .then(parseFilter)
        .then(alt([ parseWhenThen, parseAlways ]))
        .then(stack.popPushNode(5, ast.rules.RuleNode));
}

function parseRuleDescription(state) {
    return lift(state)
        .then(until(tags.anyRuleDef))
        .then(stack.push(util.textNodes));
}

function parsePartitioning(state) {
    return lift(state)
        .then(match(tags.groupBy))
        .then(value.parsePath)
        .then(stack.popPushNode(1, ast.rules.GroupByNode))
        .catch(stack.pushNode(ast.rules.FullSetNode));
}

function parseFilter(state) {
    return lift(state)
        .then(match(tags.given))
        .then(exp.parsePredicate)
        .catch(stack.push(function(reason) {
            return new ast.predicate.BooleanNode(true);
        }));
}

function parseWhenThen(state) {
    return lift(state)
        .then(match(tags.when))
        .then(exp.parsePredicate)
        .then(match(tags.then))
        .then(exp.parsePredicate);
}

function parseAlways(state) {
    return lift(state)
        .then(match(tags.always))
        .then(stack.push(function() { return new ast.predicate.BooleanNode(true); }))
        .then(exp.parsePredicate);
}
