"use strict";

var newState = require('./util').newState;

module.exports = {
    push: push,
    pushNode: pushNode,
    pop: pop,
    popPushNode: popPushNode
};

function push(fn) {
    return function(state) {
        var st = newState(state);
        st.stack.push(fn(state.matched.trim()));
        return st;
    };
}

function pushNode(nodeClass) {
    return function(state) {
        var st = newState(state);
        st.stack.push(new nodeClass(state.matched.trim()));
        return st;
    };
}

function popPushNode(valence, nodeClass) {
    valence = typeof valence != 'number' ? 0
        : valence < 0 ? 0 : valence;
    return function(state) {
        var st = newState(state);
        var args = [];
        if (valence > st.stack.length) {
            throw new Error('invalid valence: ' + valence);
        }
        if (valence == 1) {
            args = st.stack.pop();
        } else {
            while (valence--) {
                args.unshift(st.stack.pop());
            }
        }
        st.stack.push(new nodeClass(args));
        return st;
    };
}

function pop() {
    return function(state) {
        return state.stack[0];
    };
}
