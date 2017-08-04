"use strict";

var Promise = require('bluebird');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var ast = require('reflective-lang-ast');
var exp = require.main.require('lib/exp-parsers');
var value = require.main.require('lib/value-parsers');

describe('Expression Parsers', function() {
    describe('exp0', function() {
        var parser = exp.parseExp;
        it('should parse level-1 input', function() {
            return Promise.all([
                run(parser, 'a and b').should.become(
                    new ast.predicate.AndNode( [
                        new ast.PathNode('a'),
                        new ast.PathNode('b')
                    ]).serialize())
            ]);
        });
        it('should parse "or" input', function() {
            return Promise.all([
                run(parser, 'a or b').should.become(
                    new ast.predicate.OrNode( [
                        new ast.PathNode('a'),
                        new ast.PathNode('b')
                    ]).serialize()),
                run(parser, 'false or true').should.become(
                    new ast.predicate.OrNode( [
                        new ast.predicate.BooleanNode(false),
                        new ast.predicate.BooleanNode(true)
                    ]).serialize())
            ]);
        });
        it('should parse "a and b or c and d"', function() {
            return Promise.all([
                run(parser, 'a and b or c and d').should.become(
                    new ast.predicate.OrNode( [
                        new ast.predicate.AndNode([
                            new ast.PathNode('a'),
                            new ast.PathNode('b')
                        ]),
                        new ast.predicate.AndNode([
                            new ast.PathNode('c'),
                            new ast.PathNode('d')
                        ])
                    ]).serialize()),
                run(parser, 'false or true').should.become(
                    new ast.predicate.OrNode( [
                        new ast.predicate.BooleanNode(false),
                        new ast.predicate.BooleanNode(true)
                    ]).serialize())
            ]);
        });
        it('should reject invalid input', function() {
            return Promise.all([
                run(parser, 'or').should.be.rejected,
                run(parser, '12 or 42').should.be.rejected,
                run(parser, 'or true').should.be.rejected,
                run(parser, 'true or').should.be.rejected,
                run(parser, 'or or or').should.be.rejected
            ]);
        });
    });

    describe('exp1', function() {
        var parser = exp.parseExp1;
        it('should parse level-2 input', function() {
            return Promise.all([
                run(parser, 'a equals 2').should.become(
                    new ast.predicate.EqNode( [
                        new ast.PathNode('a'),
                        new ast.numeric.NumberNode(2)
                    ]).serialize())
            ]);
        });
        it('should parse "and" input', function() {
            return Promise.all([
                run(parser, 'a and b').should.become(
                    new ast.predicate.AndNode( [
                        new ast.PathNode('a'),
                        new ast.PathNode('b')
                    ]).serialize()),
                run(parser, 'false and true').should.become(
                    new ast.predicate.AndNode( [
                        new ast.predicate.BooleanNode(false),
                        new ast.predicate.BooleanNode(true)
                    ]).serialize())
            ]);
        });
        it('should parse "a equals b and c equals d"', function() {
            return Promise.all([
                run(parser, 'a equals b and c equals d').should.become(
                    new ast.predicate.AndNode( [
                        new ast.predicate.EqNode([
                            new ast.PathNode('a'),
                            new ast.PathNode('b')
                        ]),
                        new ast.predicate.EqNode([
                            new ast.PathNode('c'),
                            new ast.PathNode('d')
                        ])
                    ]).serialize()),
                run(parser, 'false and true').should.become(
                    new ast.predicate.AndNode( [
                        new ast.predicate.BooleanNode(false),
                        new ast.predicate.BooleanNode(true)
                    ]).serialize())
            ]);
        });
        it('should reject invalid input', function() {
            return Promise.all([
                run(parser, 'and').should.be.rejected,
                run(parser, '12 and 42').should.be.rejected,
                run(parser, 'and true').should.be.rejected,
                run(parser, 'true and').should.be.rejected,
                run(parser, 'and and and').should.be.rejected
            ]);
        });
        it('should reject level-0 expressions', function() {
            return Promise.all([
                run(parser, 'true or true').should.be.rejected,
            ]);
        });
    });

    describe('exp2', function() {
        var parser = exp.parseExp2;
        it('should parse level-3 input', function() {
            return Promise.all([
                run(parser, '2 < 4').should
                    .become(new ast.predicate.LtNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.numeric.NumberNode(4)
                    ]).serialize())
            ]);
        });
        it('should parse equals input', function() {
            return Promise.all([
                run(parser, 'a equals 2').should.become(
                    new ast.predicate.EqNode( [
                        new ast.PathNode('a'),
                        new ast.numeric.NumberNode(2)
                    ]).serialize()),
                run(parser, 'a must equal "asd"').should.become(
                    new ast.predicate.EqNode( [
                        new ast.PathNode('a'),
                        new ast.StringNode('asd')
                    ]).serialize())
            ]);
        });
        it('should parse not equals input', function() {
            return Promise.all([
                run(parser, 'a does not equal 2').should.become(
                    new ast.predicate.NotNode(new ast.predicate.EqNode([
                        new ast.PathNode('a'),
                        new ast.numeric.NumberNode(2)
                    ])).serialize()),
                run(parser, 'a must not equal "asd"').should.become(
                    new ast.predicate.NotNode(new ast.predicate.EqNode([
                        new ast.PathNode('a'),
                        new ast.StringNode('asd')
                    ])).serialize())
            ]);
        });
        it('should parse "a < b equals b > a"', function() {
            var expected = 
                new ast.predicate.EqNode([
                    new ast.predicate.LtNode([
                        new ast.PathNode('a'),
                        new ast.PathNode('b')
                    ]),
                    new ast.predicate.GtNode([
                        new ast.PathNode('b'),
                        new ast.PathNode('a')
                    ])
                ]).serialize();
            return Promise.all([
                run(parser, 'a < b equals b > a').should.become(expected)
            ]);
        });
        it('should reject invalid input', function() {
            return Promise.all([
                run(parser, 'equals').should.be.rejected,
                run(parser, 'must not equal').should.be.rejected,
                run(parser, 'equals 12').should.be.rejected,
                run(parser, 'a equals').should.be.rejected,
                run(parser, '2 equals equals').should.be.rejected
            ]);
        });
        it('should reject level-1 expressions', function() {
            return Promise.all([
                run(parser, 'true and true').should.be.rejected,
            ]);
        });
    });

    describe('exp3', function() {
        var parser = exp.parseExp3;
        it('should parse level-4 input', function() {
            return Promise.all([
                run(parser, 'not false').should
                    .become(new ast.predicate.NotNode(new ast.predicate.BooleanNode(false))
                            .serialize())
            ]);
        });
        it('should parse 2 < 4', function() {
            return Promise.all([
                run(parser, '2 < 4').should
                    .become(new ast.predicate.LtNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.numeric.NumberNode(4)
                    ]).serialize()),
                run(parser, 'a < b').should
                    .become(new ast.predicate.LtNode( [
                        new ast.PathNode('a'),
                        new ast.PathNode('b')
                    ]).serialize())
            ]);
        });
        it('should parse 2 <= 4', function() {
            return Promise.all([
                run(parser, '2 <= 4').should
                    .become(new ast.predicate.LteNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.numeric.NumberNode(4)
                    ]).serialize()),
                run(parser, 'a <= b').should
                    .become(new ast.predicate.LteNode( [
                        new ast.PathNode('a'),
                        new ast.PathNode('b')
                    ]).serialize())
            ]);
        });
        it('should parse 2 >= 4', function() {
            return Promise.all([
                run(parser, '2 >= 4').should
                    .become(new ast.predicate.GteNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.numeric.NumberNode(4)
                    ]).serialize()),
                run(parser, 'a >= b').should
                    .become(new ast.predicate.GteNode( [
                        new ast.PathNode('a'),
                        new ast.PathNode('b')
                    ]).serialize())
            ]);
        });
        it('should parse 2 > 4', function() {
            return Promise.all([
                run(parser, '2 > 4').should
                    .become(new ast.predicate.GtNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.numeric.NumberNode(4)
                    ]).serialize()),
                run(parser, 'a > b').should
                    .become(new ast.predicate.GtNode( [
                        new ast.PathNode('a'),
                        new ast.PathNode('b')
                    ]).serialize())
            ]);
        });
        it('should parse 1 * 2 + 3 / 4 < 5 * 6', function() {
            return Promise.all([
                run(parser, '1 * 2 + 3 / 4 < 5 * 6').should
                    .become(
                        new ast.predicate.LtNode([
                            new ast.numeric.AdditionNode( [
                                new ast.numeric.MultiplicationNode( [
                                    new ast.numeric.NumberNode(1),
                                    new ast.numeric.NumberNode(2)
                                ]),
                                new ast.numeric.DivisionNode( [
                                    new ast.numeric.NumberNode(3),
                                    new ast.numeric.NumberNode(4)
                                ])
                            ]),
                            new ast.numeric.MultiplicationNode( [
                                new ast.numeric.NumberNode(5),
                                new ast.numeric.NumberNode(6)
                            ])
                        ]).serialize())
            ]);
        });
        it('should reject invalid input', function() {
            return Promise.all([
                run(parser, '<').should.be.rejected,
                run(parser, '< 12').should.be.rejected,
                run(parser, 'false < true').should.be.rejected,
                run(parser, 'false < 12').should.be.rejected,
                run(parser, '"foobar" < 12').should.be.rejected,
                run(parser, '"foo" < "bar"').should.be.rejected,
                run(parser, '1 < 2 < 3').should.be.rejected,
                run(parser, '<=').should.be.rejected,
                run(parser, '<= 12').should.be.rejected,
                run(parser, 'false <= true').should.be.rejected,
                run(parser, 'false <= 12').should.be.rejected,
                run(parser, '"foobar" <= 12').should.be.rejected,
                run(parser, '"foo" <= "bar"').should.be.rejected,
                run(parser, '1 <= 2 <= 3').should.be.rejected,
                run(parser, '>=').should.be.rejected,
                run(parser, '>= 12').should.be.rejected,
                run(parser, 'false >= true').should.be.rejected,
                run(parser, 'false >= 12').should.be.rejected,
                run(parser, '"foobar" >= 12').should.be.rejected,
                run(parser, '"foo" >= "bar"').should.be.rejected,
                run(parser, '1 >= 2 >= 3').should.be.rejected,
                run(parser, '>').should.be.rejected,
                run(parser, '> 12').should.be.rejected,
                run(parser, 'false > true').should.be.rejected,
                run(parser, 'false > 12').should.be.rejected,
                run(parser, '"foobar" > 12').should.be.rejected,
                run(parser, '"foo" > "bar"').should.be.rejected,
                run(parser, '1 > 2 > 3').should.be.rejected
            ]);
        });
        it('should reject level-2 expressions', function() {
            return Promise.all([
                run(parser, '2 = 2').should.be.rejected,
            ]);
        });
    });

    describe('exp4', function() {
        var parser = exp.parseExp4;
        it('should parse level-5 input', function() {
            return Promise.all([
                run(parser, 'not false').should
                    .become(new ast.predicate.NotNode(new ast.predicate.BooleanNode(false))
                           .serialize())
            ]);
        });
        it('should parse addition input', function() {
            return Promise.all([
                run(parser, '2 + a').should
                    .become(new ast.numeric.AdditionNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.PathNode('a')
                    ]).serialize()),
                run(parser, '1 + 2 + 3').should
                    .become(new ast.numeric.AdditionNode( [
                        new ast.numeric.NumberNode(1),
                        new ast.numeric.AdditionNode( [
                            new ast.numeric.NumberNode(2),
                            new ast.numeric.NumberNode(3)
                        ])
                    ]).serialize())
            ]);
        });
        it('should parse subtraction input', function() {
            return Promise.all([
                run(parser, '2 - a').should
                    .become(new ast.numeric.SubtractionNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.PathNode('a')
                    ]).serialize()),
                run(parser, '1 - 2 - 3').should
                    .become(new ast.numeric.SubtractionNode( [
                        new ast.numeric.NumberNode(1),
                        new ast.numeric.SubtractionNode( [
                            new ast.numeric.NumberNode(2),
                            new ast.numeric.NumberNode(3)
                        ])
                    ]).serialize())
            ]);
        });
        it('should parse mixed input', function() {
            return Promise.all([
                run(parser, '2 - 3 + 4').should
                    .become(new ast.numeric.SubtractionNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.numeric.AdditionNode( [
                            new ast.numeric.NumberNode(3),
                            new ast.numeric.NumberNode(4)
                        ])
                    ]).serialize())
            ]);
        });
        it('should parse 1 * 2 + 3 / 4 - 5 * 6', function() {
            return Promise.all([
                run(parser, '1 * 2 + 3 / 4 - 5 * 6').should
                    .become(new ast.numeric.AdditionNode( [
                        new ast.numeric.MultiplicationNode( [
                            new ast.numeric.NumberNode(1),
                            new ast.numeric.NumberNode(2)
                        ]),
                        new ast.numeric.SubtractionNode( [
                            new ast.numeric.DivisionNode( [
                                new ast.numeric.NumberNode(3),
                                new ast.numeric.NumberNode(4)
                            ]),
                            new ast.numeric.MultiplicationNode( [
                                new ast.numeric.NumberNode(5),
                                new ast.numeric.NumberNode(6)
                            ])
                        ])
                    ]).serialize())
            ]);
        });
        it('should reject invalid input', function() {
            return Promise.all([
                run(parser, '+').should.be.rejected,
                run(parser, '+ 12').should.be.rejected,
                run(parser, 'false + true').should.be.rejected,
                run(parser, 'false + 12').should.be.rejected,
                run(parser, '"foobar" + 12').should.be.rejected,
                run(parser, '"foo" + "bar"').should.be.rejected,
                run(parser, '-').should.be.rejected,
                run(parser, '- 12').should.be.rejected,
                run(parser, 'false - true').should.be.rejected,
                run(parser, 'false - 12').should.be.rejected,
                run(parser, '"foobar" - 12').should.be.rejected,
                run(parser, '"foo" - "bar"').should.be.rejected,
            ]);
        });
        it('should reject level-3 expressions', function() {
            return Promise.all([
                run(parser, '2 < 2').should.be.rejected,
            ]);
        });
    });

    describe('exp5', function() {
        var parser = exp.parseExp5;
        it('should parse level-6 input', function() {
            return Promise.all([
                run(parser, 'not false').should
                    .become(new ast.predicate.NotNode(new ast.predicate.BooleanNode(false))
                           .serialize())
            ]);
        });
        it('should parse multiplication input', function() {
            return Promise.all([
                run(parser, '2 * a').should
                    .become(new ast.numeric.MultiplicationNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.PathNode('a')
                    ]).serialize()),
                run(parser, '1 * 2 * 3').should
                    .become(new ast.numeric.MultiplicationNode( [
                        new ast.numeric.NumberNode(1),
                        new ast.numeric.MultiplicationNode( [
                            new ast.numeric.NumberNode(2),
                            new ast.numeric.NumberNode(3)
                        ])
                    ]).serialize())
            ]);
        });
        it('should parse division input', function() {
            return Promise.all([
                run(parser, '2 / a').should
                    .become(new ast.numeric.DivisionNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.PathNode('a')
                    ]).serialize()),
                run(parser, '1 / 2 / 3').should
                    .become(new ast.numeric.DivisionNode( [
                        new ast.numeric.NumberNode(1),
                        new ast.numeric.DivisionNode( [
                            new ast.numeric.NumberNode(2),
                            new ast.numeric.NumberNode(3)
                        ])
                    ]).serialize())
            ]);
        });
        it('should parse mixed input', function() {
            return Promise.all([
                run(parser, '2 / 3 * 4').should
                    .become(new ast.numeric.DivisionNode( [
                        new ast.numeric.NumberNode(2),
                        new ast.numeric.MultiplicationNode( [
                            new ast.numeric.NumberNode(3),
                            new ast.numeric.NumberNode(4)
                        ])
                    ]).serialize())
            ]);
        });
        it('should reject invalid input', function() {
            return Promise.all([
                run(parser, '*').should.be.rejected,
                run(parser, '* 12').should.be.rejected,
                run(parser, 'false * true').should.be.rejected,
                run(parser, 'false * 12').should.be.rejected,
                run(parser, '"foobar" * 12').should.be.rejected,
                run(parser, '"foo" * "bar"').should.be.rejected,
                run(parser, '/').should.be.rejected,
                run(parser, '/ 12').should.be.rejected,
                run(parser, 'false / true').should.be.rejected,
                run(parser, 'false / 12').should.be.rejected,
                run(parser, '"foobar" / 12').should.be.rejected,
                run(parser, '"foo" / "bar"').should.be.rejected,
            ]);
        });
        it('should reject level-4 expressions', function() {
            return Promise.all([
                run(parser, '2 + 2').should.be.rejected,
            ]);
        });
    });

    describe('exp6', function() {
        var parser = exp.parseExp6;
        it('should parse level-7 input', function() {
            return Promise.all([
                run(parser, 'true').should.become(new ast.predicate.BooleanNode(true)
                                                  .serialize())
            ]);
        });
        it('should parse "not <predicate>"', function() {
            return Promise.all([
                run(parser, 'not false').should
                    .become(new ast.predicate.NotNode(new ast.predicate.BooleanNode(false))
                            .serialize())
            ]);
        });
        it('should parse "not not <predicate>"', function() {
            return Promise.all([
                run(parser, 'not not false').should
                    .become(new ast.predicate.NotNode(new ast.predicate.NotNode(
                        new ast.predicate.BooleanNode(false))).serialize())
            ]);
        });
        it('should reject invalid uses of not', function() {
            return Promise.all([
                run(parser, 'not').should.be.rejected,
                run(parser, 'not not').should.be.rejected,
                run(parser, 'not "foobar"').should.be.rejected,
                run(parser, 'not 34').should.be.rejected,
                run(parser, 'not ()').should.be.rejected
            ]);
        });
        it('should reject level-5 expressions', function() {
            return Promise.all([
                run(parser, '2 * 2').should.be.rejected,
            ]);
        });
    });

    describe('exp7', function() {
        var parser = exp.parseExp7;
        it('should parse constants', function() {
            return Promise.all([
                run(parser, '0').should.become(new ast.numeric.NumberNode(0).serialize()),
                run(parser, '42').should.become(new ast.numeric.NumberNode(42).serialize()),
                run(parser, '3.14').should.become(new ast.numeric.NumberNode(3.14).serialize()),
                run(parser, '"foobar"').should.become(new ast.StringNode('foobar').serialize()),
                run(parser, 'true').should.become(new ast.predicate.BooleanNode(true).serialize()),
                run(parser, 'false').should.become(new ast.predicate.BooleanNode(false).serialize())
            ]);
        });
        it('should parse count and size', function() {
            return Promise.all([
                run(parser, 'size').should.become(new ast.rules.SizeNode().serialize()),
                run(parser, 'count a').should.become(
                    new ast.numeric.CountNode(new ast.PathNode('a')).serialize())
            ]);
        });
        it('should parse parenthesized expressions', function() {
            return Promise.all([
                run(parser, '(0)').should.become(new ast.numeric.NumberNode(0).serialize()),
                run(parser, '(((42)))').should.become(new ast.numeric.NumberNode(42).serialize()),
                run(parser, '(((a)))').should.become(new ast.PathNode('a').serialize())
            ]);
        });
        it('should parse paths', function() {
            return Promise.all([
                run(parser, 'a').should.become(new ast.PathNode('a').serialize()),
                run(parser, 'a.b.c').should.become(
                    new ast.PathNode([ 'a', 'b', 'c' ]).serialize()),
                run(parser, 'a.b.c exists').should.become(
                    new ast.predicate.PathExistsNode(new ast.PathNode([ 'a', 'b', 'c' ])).serialize()),
                run(parser, 'a.b.c must exist').should.become(
                    new ast.predicate.PathExistsNode(new ast.PathNode([ 'a', 'b', 'c' ])).serialize()),
                run(parser, 'b does not exist').should.become(
                    new ast.predicate.NotNode(new ast.predicate.PathExistsNode(new ast.PathNode('b'))).serialize()),
                run(parser, 'b must not exist').should.become(
                    new ast.predicate.NotNode(new ast.predicate.PathExistsNode(new ast.PathNode('b'))).serialize())
            ]);
        });
        it('should reject unbalanced parentheses', function() {
            return Promise.all([
                run(parser, '(').should.be.rejected,
                run(parser, ')').should.be.rejected,
                run(parser, '((())').should.be.rejected,
                run(parser, '(()))').should.be.rejected,
                run(parser, '(()()()').should.be.rejected
            ]);
        });
        it('should reject invalid input', function() {
            return Promise.all([
                run(parser, '()').should.be.rejected,
                run(parser, '4 exists').should.be.rejected
            ]);
        });
        it('should reject keywords as paths', function() {
            return Promise.all([
                run(parser, 'and').should.be.rejected,
                run(parser, 'or').should.be.rejected,
                run(parser, 'not').should.be.rejected,
                run(parser, 'count count').should.be.rejected,
                run(parser, 'count size').should.be.rejected,
            ]);
        });
        it('should reject level-6 parsing', function() {
            return Promise.all([
                run(parser, 'not true').should.be.rejected
            ]);
        });
    });
});

function run(parser, input) {
    return parser(input)
        .then(function(state) {
            if (state.rest.trim().length) {
                return Promise.reject(state);
            }
            var result = state.stack[0];
            return result ? Array.isArray(result) ? result.map(function(r) {
                return r.serialize();
            }) : result.serialize() : result;
        }, function(reason) {
            // console.log('error', reason);
            return Promise.reject(reason);
        });
}
