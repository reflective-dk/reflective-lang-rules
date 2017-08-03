"use strict";

var Promise = require('bluebird');
var ast = require('reflective-lang-ast');

module.exports = {
    newState: newState,
    error: error,
    textNodes: textNodes
};

function newState(old, matched) {
    matched = matched || '';
    return {
        pos: old.pos + matched.length,
        lfs: old.lfs + (matched.match(/\n/g) || []).length,
        rest: old.rest.substring(matched.length),
        stack: old.stack.slice(),
        matched: matched
    };
}

function error(reporter, reason, state) {
    var st = newState(state);
    st.error = {
        reporter: reporter,
        reason: reason
    };
    return Promise.reject(st);
}

function textNodes(text) {
    if (!text) {
        return [];
    }
    text = (text || '').trim();
    var parts = text.split(/\n[ \t\r]*\n/);
    return parts.map(function(p) {
        return new ast.StringNode(p.replace(/\s\s+/g, ' ').trim());
    });
}
