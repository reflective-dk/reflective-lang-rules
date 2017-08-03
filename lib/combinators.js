"use strict";

var Promise = require('bluebird');
var util = require('./util');

module.exports = {
    lift: lift,
    many: many,
    opt: opt,
    alt: alt,
    match: match,
    enclose: enclose,
    look: look,
    until: until,
    oftype: oftype
};

function lift(input) {
    switch (typeof input) {
    case 'string':
        return Promise.resolve({
            pos: 0,
            lfs: 0,
            rest: input,
            stack: []
        });
    case 'object':
        return Promise.resolve(input);
    default:
        return util.error('lift', 'invalid input', input);
    }
}

function many(parser) {
    return function(state) {
        var st = util.newState(state);
        st.stack = [];
        return repeat(st)
            .catch(function(result) {
                var res = util.newState(result);
                res.stack = state.stack.concat([result.stack]);
                return res;
            });
    };

    function repeat(state) { return parser(state).then(repeat); };
}

function opt(parser) {
    return function(state) {
        return lift(state)
            .then(parser)
            .catch(function() {
                return state;
            });
    };
}

function alt(parsers) {
    parsers = parsers || [];
    return function(state) {
        var promise = Promise.reject(lift(state));
        parsers.forEach(function(p) {
            promise = promise.catch(function(rejected) {
                // console.log('alt rejects', rejected);
                return p(state);
            });
        });
        return promise;
    };
}

function enclose(parser, left, right) {
    left = left || '\\(';
    right = right || '\\)';
    return function(state) {
        return lift(state)
            .then(match(left))
            .then(parser)
            .then(match(right));
    };
}

function match(regex) {
    var full = new RegExp('^\\s*' + regex, 'i');
    return function(state) {
        var m = full.exec(state.rest);
        return m ? Promise.resolve(util.newState(state, m[0]))
            : util.error('match', full, state);
    };
}

function look(regex) {
    var full = new RegExp('^\\s*' + regex, 'i');
    return function(state) {
        return full.exec(state.rest) ? Promise.resolve(state)
            : util.error('look', full, state);
    };
}

function until(regex) {
    var full = new RegExp('^([\\s\\S]*?)' + regex, 'i');
    return function(state) {
        var m = full.exec(state.rest);
        // Note: we're only passing the first group, not the whole matched string
        return m ? Promise.resolve(util.newState(state, m[1]))
            : util.error('match', full, state);
    };
}

function oftype(type) {
    return function(state) {
        var top = state.stack[state.stack.length-1] || {};
        return (top instanceof type) ? Promise.resolve(state)
            : util.error('oftype', type, state);
    };
}
