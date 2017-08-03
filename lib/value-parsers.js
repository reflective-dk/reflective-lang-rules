"use strict";

var ast = require('reflective-lang-ast');
var util = require('./util');
var stack = require('./stack');
var cmbs = require('./combinators');
var tags = require('./tags');

module.exports = {
    parsePath: parsePath,
    parseConstant: parseConstant,
    parseSize: parseSize
};

function parsePath(state) {
    return cmbs.lift(state)
        .then(cmbs.match(tags.path))
        .then(function(result) {
            var st = util.newState(result);
            var path = result.matched.trim().split('.');
            st.stack.push(path);
            var invalid = path.some(function(p) {
                return tags.reserved.indexOf(p.toLowerCase()) >= 0;
            });
            return invalid ? util.error('parsePath', 'invalid path', st) : st;
        })
        .then(stack.popPushNode(1, ast.PathNode));
}

function parseSize(state) {
    return cmbs.lift(state)
        .then(cmbs.match(tags.size))
        .then(stack.pushNode(ast.SizeNode));
}

function parseConstant(state) {
    return cmbs.lift(state)
        .then(cmbs.alt([ parseNumber, parseBoolean, parseString ]));
}

function parseNumber(state) {
    return cmbs.lift(state)
        .then(cmbs.match(tags.number))
        .then(stack.pushNode(ast.NumberNode));
}

function parseBoolean(state) {
    return cmbs.lift(state)
        .then(cmbs.match(tags.boolean))
        .then(stack.pushNode(ast.BooleanNode));
}

function parseString(state) {
    return cmbs.lift(state)
        .then(cmbs.match(tags.string))
        .then(stack.push(function(matched) {
            return new ast.StringNode(matched.substring(1, matched.length-1));
        }));
}
