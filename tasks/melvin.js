var path = require('path');
var deepExtend = require('deep-extend');

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-extend-config');
    require('time-grunt')(grunt);

    require('grunt-contrib-clean/tasks/clean')(grunt);
    require('grunt-contrib-concat/tasks/concat')(grunt);
    require('grunt-contrib-jade/tasks/jade')(grunt);
    require('grunt-contrib-copy/tasks/copy')(grunt);
    require('grunt-contrib-less/tasks/less')(grunt);
    require('grunt-contrib-jst/tasks/jst')(grunt);
    require('grunt-contrib-requirejs/tasks/requirejs')(grunt);
    require('grunt-contrib-uglify/tasks/uglify')(grunt);
    require('grunt-contrib-cssmin/tasks/cssmin')(grunt);
    require('grunt-contrib-watch/tasks/watch')(grunt);

    grunt.initConfig({
        clean: {
            before: ['compiled'],
            after: ['temp']
        },
        jade: {
            all: {
                files: [{
                    expand: true,
                    cwd: 'app/modules/',
                    src: ['**/*.jade', '!**/_*.jade'],
                    dest: 'temp/html',
                    ext: '.html'
                }]
            },
            index: {
                files: {
                    'www/index.html': 'app/index.jade'
                }
            },
            index_prod: {
                files: {
                    'www/index.html': 'app/index_prod.jade'
                }
            }
        },
        jst: {
            compile_jade: {
                options: {
                    processName: function( filename ) {
                        var filePath = path.normalize( filename );
                        var template = path.basename(filePath, '.html');
                        var module = filePath.split(path.sep)[2];

                        return '#' + module + '-' + template;
                    }
                },
                files: {
                    'www/templates.js': [
                        'temp/html/**/*.html'
                    ]
                }
            }
        },
        less: {
            app: {
                files: {
                    'www/styles.css': 'app/styles/main.less'
                },
                strictImport: true,
                compress: true
            }
        },

        // RequireJS optimizer full example:
        // https://github.com/requirejs/r.js/blob/master/build/example.build.js
        requirejs: {
            prod: {
                options: {
                    baseUrl: 'www/app',
                    mainConfigFile: 'www/require-config.js',
                    findNestedDependencies: true,
                    include: ['main'],
                    wrap: true,
                    out: 'www/app.js',
                    // Optimization manually done via uglify task
                    optimize: 'none'
                }
            }
        },

        // CSS Minify
        // https://github.com/gruntjs/grunt-contrib-cssmin
        cssmin: {
            prod: {
                files: {
                    'www/styles.css': 'www/styles.css'
                }
            }
        },

        // Uglify 2.0 - makes javascript small and efficient
        // https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            prod: {
                files: {
                    'www/app.js': 'www/app.js'
                }
            }
        },

        concat: {
            prod: {
                src: ['node_modules/requirejs/require.js', 'www/app.js', 'www/templates.js'],
                dest: 'www/app.js'
            }
        },

        // Copy files task
        copy: {
            // User static resorces, application files except
            // jade templates and less files
            www_dev: {
                src: ['res/**', 'app/**', '!app/**/*.less', '!app/**/*.jade'],
                expand: true,
                dest: 'www'
            },
            requirejs: {
                src: ['require.js'],
                expand: true,
                cwd: 'node_modules/requirejs/',
                dest: 'www'
            },
            requirejs_config: {
                src: ['require-config.js'],
                cwd: 'node_modules/melvinjs/',
                expand: true,
                dest: 'www'
            }
        },
        watch: {
            options: {
                spawn: true
            },
            styles: {
                files: 'app/**/*.less',
                tasks: ['less']
            },
            templates: {
                files: 'app/**/*.jade',
                tasks: ['jade:all', 'jade:index', 'jst']
            }
        }
    });

    grunt.registerTask('updateRequireConfig', 'Extend melvin\'s requirejs config with custom one', function() {
        //var done = this.async();

        var customConfigJson = grunt.file.readJSON('./app/config.json');
        var melvinConfig = grunt.file.read('./www/require-config.js');
        var melvinConfigJson = JSON.parse(melvinConfig.match(/require\.config\(({[\r\n\s\S]*})\);/)[1]);

        var extendedConfigContent = 'require.config(' + JSON.stringify(deepExtend(melvinConfigJson, customConfigJson)) + ');';

        grunt.file.write('./www/require-config.js', extendedConfigContent);
    });

    grunt.registerTask('melvinjs:dev', 'Compiles Melvin.js Project', function() {
        grunt.task.run('clean:before', 'jade:all', 'jade:index', 'jst', 'less', 'copy', 'clean:after');
    });

    grunt.registerTask('melvinjs:prod', 'Optimizes Melvin.js App, making it ready for production', function() {
        grunt.task.run('melvinjs:dev', 'updateRequireConfig', 'requirejs:prod', 'concat:prod', 'jade:index_prod', 'uglify:prod', 'cssmin:prod');
    });
};
