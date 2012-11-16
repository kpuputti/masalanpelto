/*global module:false*/
module.exports = function (grunt) {

    grunt.initConfig({
        pkg: '<json:package.json>',
        meta: {
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        lint: {
            files: ['grunt.js', 'src/js/**/*.js', 'lib/**/*.js', 'test/**/*.js']
        },
        concat: {
            dist: {
                src: ['<banner:meta.banner>', '<file_strip_banner:src/js/app.js>'],
                dest: 'public/dist/app.js'
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'public/dist/app.min.js'
            }
        },
        compass: {
            dev: {
                src: 'src/sass',
                dest: 'public/dist',
                outputstyle: 'compressed',
                linecomments: false,
                forcecompile: true,
                debugsass: false,
                images: 'public/img',
                relativeassets: true
            }
        },
        watch: {
            scripts: {
                files: '<config:lint.files>',
                tasks: 'lint'
            },
            styles: {
                files: ['src/sass/**/*.scss', 'public/img/*'],
                tasks: 'compass:dev'
            }
        },
        jshint: {
            options: {
                // enforcing options

                camelcase: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                nonew: true,
                quotmark: 'single',
                undef: true,
                unused: true,
                strict: false,
                trailing: true,

                // environment

                devel: true,
                node: true

            },
            globals: {
                jQuery: true
            }
        },
        uglify: {}
    });

    grunt.loadNpmTasks('grunt-compass');

    // Default task.
    grunt.registerTask('default', 'lint concat min compass:dev');

};
