"use strict";

var Promise = require('bluebird');
var fs = require('mz/fs');
var util = require('util');
var path = require('path');
var Parser = require('./index.js');

module.exports = function(grunt) {
    grunt.initConfig({
        parse: {
            patterns: {
                cwd: '.',
                src: 'examples/**/*.pattern',
                dest: 'generated',
                ext: '.ast.json'
            }
        },
        clean: {
            tilde: {
                cwd: '.',
                src: ['.*~', '**/*.*~'],
                filter: 'isFile'
            },
            asts: {
                cwd: '.',
                src: ['generated/**/*', 'generated']
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['examples/**/*.pattern'],
                        dest: 'generated/'
                    }
                ]
            }
        },
        convert: {
            options: {
                explicitArray: false
            },
            patterns: {
                files: [
                    {
                        expand: true,
                        cwd: 'generated',
                        src: ['**/*.ast.json'],
                        dest: 'generated',
                        ext: '.ast.yaml'
                    }
                ]
            }
        }
    });

    grunt.registerTask('default', [ 'build' ]);
    grunt.registerTask('build', [ 'clean', 'copy', 'parse', 'convert' ]);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-convert');

    grunt.registerMultiTask('parse', 'parse rule patterns', function() {
        var done = this.async(); // async grunt task
        return Promise.all(this.files.map(doSection)).then(function() {
            console.log('all patterns converted successfully');
            done(true);
        });

        function doSection(section) {
            console.log('parsing rule patterns for section');
            var astExt = section.astExt || '.ast.json';
            var specs = section.src.map(function(file) {
                return {
                    srcFile: path.resolve(section.cwd, file),
                    astFile: path.resolve(section.cwd, section.dest,
                                          path.dirname(file),
                                          path.basename(file, '.pattern') + astExt)
                };
            });
            return Promise.all(specs.map(doSpec));
        }

        function doSpec(spec) {
            console.log('parsing file ' + spec.srcFile);
            return fs.readFile(spec.srcFile, 'utf8')
                .then(function(input) {
                    return new Parser().parse(input);
                })
                .then(function(ast) {
                    return fs.writeFile(spec.astFile,
                                        JSON.stringify(ast.serialize(), null, 2));
                })
                .catch(function(reason) {
                    return grunt.warn(util.inspect(reason, null, 2));
                });
        }
    });
};
