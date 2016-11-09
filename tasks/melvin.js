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

    grunt.initConfig({
        clean: {
            before: ['compiled'],
            after: ['temp'],
            prod: ['deploy']
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
                    'deploy/index.html': 'app/index_prod.jade'
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
                strictImport: true
            }
        },
        requirejs: {
            prod: {
                options: {
                    baseUrl: 'www/app',
                    mainConfigFile: 'www/require-config.js',
                    findNestedDependencies: true,
                    include: ['main'],
                    wrap: true,
                    out: 'deploy/app.js',
                    optimize: 'none'
                }
            }
        },
        concat: {
            prod: {
                src: ['node_modules/requirejs/require.js', 'deploy/app.js', 'www/templates.js'],
                dest: 'deploy/app.js'
            }
        },
        copy: {
            www_dev: {
                src: ['app/**', '!app/**/*.less', '!app/**/*.jade'],
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
            },
            prod: {
                src: ['index.html', 'styles.css'],
                cwd: 'www/',
                expand: true,
                dest: 'deploy'
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
        grunt.task.run('clean:prod', 'melvinjs:dev', 'updateRequireConfig', 'requirejs:prod', 'concat:prod', 'copy:prod', 'jade:index_prod');
    });
};