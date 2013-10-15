module.exports = function (grunt) {

    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            allFiles: ['Gruntfile.js', 'lib/**/*.js', 'src/**/*.js', 'test/**/*.js']
        },
        compass: {
            dist: {
                options: {
                    sassDir: 'src/sass',
                    cssDir: 'public/dist',
                    environment: 'production',
                    outputStyle: 'compressed', // One of: nested, expanded, compact, compressed
                    force: true
                }
            }
        },
        watch: {
            scripts: {
                files: ['<%= jshint.allFiles %>'],
                tasks: ['jshint']
            },
            styles: {
                files: ['src/sass/**/*.scss'],
                tasks: ['compass']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'compass']);
};
