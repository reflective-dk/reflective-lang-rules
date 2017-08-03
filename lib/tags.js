"use strict";

module.exports = {
    patternKey: 'Pattern[ \\t]*:',
    ruleKey: 'Rule[ \\t]*:',
    eol: '(?:\\n|$)',
    eof: '$',
    exists: '(?:Exists|Must\\s+Exist)',
    notExists: '(?:Does\\s+Not\\s+Exist|Must\\s+Not\\s+Exist)',
    eq: '(?:=|Equals|Must\\s+Equal)',
    ne: '(?:!=|Does\\s+Not\\s+Equal|Must\\s+Not\\s+Equal)',
    always: 'Always\\s+',
    given: 'Given\\s+',
    when: 'When\\s+',
    then: 'Then\\s+',
    groupBy: 'Group\\s+by\\s+',
    count: 'Count\\s+',
    size: 'Size',
    plus: '\\+',
    minus: '-',
    lt: '(?:<|Is\\s+Less\\s+Than|Must\\s+Be\\s+Less\\s+Than)',
    lte: '(?:<=|Is\\s+Less\\s+Than\\s+Or\\s+Equal\\s+To|Must\\s+Be\\s+Less\\s+Than\\s+Or\\s+Equal\\s+To)',
    gte: '(?:>=|Is\\s+Greater\\s+Than\\s+Or\\s+Equal\\s+To|Must\\s+Be\\s+Greater\\s+Than\\s+Or\\s+Equal\\s+To)',
    gt: '(?:>|Is\\s+Greater\\s+Than|Must\\s+Be\\s+Greater\\s+Than)',
    times: '\\*',
    div: '\\/',
    and: 'And\\s+',
    or: 'Or\\s+',
    not: 'Not\\s+',
    number: '(?:\\-|\\+)?[0-9]+(?:\\.[0-9]+)?',
    boolean: '(?:true|false)',
    string: '"[^"]*"',
    path: '[\\w~_][\\w~_:-]*(?:\\.[\\w~_][\\w~_:-]*)*',
    reserved: [ 'and', 'or', 'not', 'true', 'false', 'equals', 'size', 'count' ]
};

module.exports.anyRuleDef = '(?:'
    + module.exports.when + '|'
    + module.exports.always + '|'
    + module.exports.groupBy
    + ')';
