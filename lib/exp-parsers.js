"use strict";

var Promise = require('bluebird');
var ast = require('reflective-lang-ast');
var util = require('./util');
var stack = require('./stack');
var tags = require('./tags');
var value = require('./value-parsers');
var cmbs = require('./combinators');
var lift = cmbs.lift, opt = cmbs.opt, alt = cmbs.alt,
    match = cmbs.match, enclose = cmbs.enclose, oftype = cmbs.oftype;

module.exports = {
    parsePredicate: parsePredicate,
    parseExp: parseExp,
    parseExp1: parseExp1,
    parseExp2: parseExp2,
    parseExp3: parseExp3,
    parseExp4: parseExp4,
    parseExp5: parseExp5,
    parseExp6: parseExp6,
    parseExp7: parseExp7
};

function parsePredicate(state) {
    return lift(state)
        .then(parseExp)
        .then(oftype(ast.PredicateNode));
}

/**
 * Parses these rules of the expression grammar:
 *     exp  ::= exp1 exp$
 *     exp$ ::= 'or' exp | e
 */
function parseExp(state) {
    return lift(state)
        .then(parseExp1)
        .then(opt(parseExp$));
}
function parseExp$(state) {
    return lift(state)
        .then(match(tags.or))
        .then(parseExp)
        .then(stack.popPushNode(2, ast.OrNode));
}

/**
 * Parses these rules of the expression grammar:
 *     exp1  ::= exp2 exp1$
 *     exp1$ ::= 'and' exp1 | e
 */
function parseExp1(state) {
    return lift(state)
        .then(parseExp2)
        .then(opt(parseExp1$));
}
function parseExp1$(state) {
    return lift(state)
        .then(match(tags.and))
        .then(parseExp1)
        .then(stack.popPushNode(2, ast.AndNode));
}

/**
 * Parses these rules of the expression grammar:
 *     exp2  ::= exp3 exp2$
 *     exp2$ ::= '=' exp2 | '!=' exp2 | e
 */
function parseExp2(state) {
    return lift(state)
        .then(parseExp3)
        .then(opt(alt([ parseExp2$eq, parseExp2$ne ])));
}
function parseExp2$eq(state) {
    return lift(state)
        .then(match(tags.eq))
        .then(parseExp2)
        .then(stack.popPushNode(2, ast.EqNode));
}
function parseExp2$ne(state) {
    return lift(state)
        .then(match(tags.ne))
        .then(parseExp2)
        .then(stack.popPushNode(2, ast.EqNode))
        .then(stack.popPushNode(1, ast.NotNode));
}

/**
 * Parses these rules of the expression grammar:
 *     exp3  ::= exp4 exp3$
 *     exp3$ ::= '<' exp3 | '<=' exp3 | '>=' exp3 | '>' exp3 | e
 */
function parseExp3(state) {
    return lift(state)
        .then(parseExp4)
        .then(opt(alt([ parseExp3$lt, parseExp3$lte, parseExp3$gte, parseExp3$gt ])));
}
function parseExp3$lt(state) {
    return lift(state)
        .then(match(tags.lt))
        .then(parseExp3)
        .then(stack.popPushNode(2, ast.LtNode));
}
function parseExp3$lte(state) {
    return lift(state)
        .then(match(tags.lte))
        .then(parseExp3)
        .then(stack.popPushNode(2, ast.LteNode));
}
function parseExp3$gte(state) {
    return lift(state)
        .then(match(tags.gte))
        .then(parseExp3)
        .then(stack.popPushNode(2, ast.GteNode));
}
function parseExp3$gt(state) {
    return lift(state)
        .then(match(tags.gt))
        .then(parseExp3)
        .then(stack.popPushNode(2, ast.GtNode));
}

/**
 * Parses these rules of the expression grammar:
 *     exp4  ::= exp5 exp4$
 *     exp4$ ::= '+' exp4 | '-' exp4 | e
 */
function parseExp4(state) {
    return lift(state)
        .then(parseExp5)
        .then(opt(alt([ parseExp4$plus, parseExp4$minus ])));
}
function parseExp4$plus(state) {
    return lift(state)
        .then(match(tags.plus))
        .then(parseExp4)
        .then(stack.popPushNode(2, ast.AdditionNode));
}
function parseExp4$minus(state) {
    return lift(state)
        .then(match(tags.minus))
        .then(parseExp4)
        .then(stack.popPushNode(2, ast.SubtractionNode));
}

/**
 * Parses these rules of the expression grammar:
 *     exp5  ::= exp6 exp5$
 *     exp5$ ::= '*' exp5 | '/' exp5 | e
 */
function parseExp5(state) {
    return lift(state)
        .then(parseExp6)
        .then(opt(alt([ parseExp5$times, parseExp5$div ])));
}
function parseExp5$times(state) {
    return lift(state)
        .then(match(tags.times))
        .then(parseExp5)
        .then(stack.popPushNode(2, ast.MultiplicationNode));
}
function parseExp5$div(state) {
    return lift(state)
        .then(match(tags.div))
        .then(parseExp5)
        .then(stack.popPushNode(2, ast.DivisionNode));
}

/**
 * Parses these rules of the expression grammar:
 *     exp6  ::= exp6$ | exp7
 *     exp6$ ::= 'not' exp6
 */
function parseExp6(state) {
    return lift(state)
        .then(alt([ parseExp6$, parseExp7 ]));
}
function parseExp6$(state) {
    return lift(state)
        .then(match(tags.not))
        .then(parseExp6)
        .then(stack.popPushNode(1, ast.NotNode));
}

/**
 * Parses these rules of the expression grammar:
       exp7 ::= '(' exp ')' | constant | 'count' path
              | path 'exists' | path 'does not exist' | path
 */
function parseExp7(state) {
    return lift(state)
        .then(alt([
            enclose(parseExp),
            value.parseSize,
            value.parseConstant,
            parseExp7$count,
            parseExp7$path
        ]));
}
function parseExp7$count(state) {
    return lift(state)
        .then(match(tags.count))
        .then(value.parsePath)
        .then(stack.popPushNode(1, ast.CountNode));
}
function parseExp7$path(state) {
    return lift(state)
        .then(value.parsePath)
        .then(opt(alt([ parseExp7$exists, parseExp7$notExists ])));
}
function parseExp7$exists(state) {
    return lift(state)
        .then(match(tags.exists))
        .then(stack.popPushNode(1, ast.PathExistsNode));
}
function parseExp7$notExists(state) {
    return lift(state)
        .then(match(tags.notExists))
        .then(stack.popPushNode(1, ast.PathExistsNode))
        .then(stack.popPushNode(1, ast.NotNode));
}
