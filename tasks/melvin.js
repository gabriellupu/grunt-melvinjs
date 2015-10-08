var path = require('path');

module.exports = function(grunt) {
    require('time-grunt')(grunt);

    require('../node_modules/grunt-contrib-clean/tasks/clean')(grunt);
    require('../node_modules/grunt-contrib-jade/tasks/jade')(grunt);
    require('../node_modules/grunt-contrib-copy/tasks/copy')(grunt);
    require('../node_modules/grunt-contrib-less/tasks/less')(grunt);
    require('../node_modules/grunt-contrib-jst/tasks/jst')(grunt);

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
                    'index.html': 'app/index.jade'
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
                    'compiled/templates.js': [
                        'temp/html/**/*.html'
                    ]
                }
            }
        },
        less: {
            app: {
                files: {
                    'tmp/styles.css': 'app/styles/main.less'
                }
            }
        },
        copy: {
            require: {
                expand: true,
                flatten: true,
                src: ['bower_components/requirejs/require.js', 'bower_components/melvinjs/require_config.js'],
                dest: './tmp'
            }
        }
    });

    grunt.registerTask('melvin', 'Compiles Melvin Project', function() {
        grunt.task.run('clean:before', 'jade', 'jst', 'less', 'copy', 'clean:after');
    });
};
