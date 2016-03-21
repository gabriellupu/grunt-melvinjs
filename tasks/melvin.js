var path = require('path');

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-extend-config');
    require('time-grunt')(grunt);

    require('grunt-contrib-clean/tasks/clean')(grunt);
    require('grunt-contrib-jade/tasks/jade')(grunt);
    require('grunt-contrib-copy/tasks/copy')(grunt);
    require('grunt-contrib-less/tasks/less')(grunt);
    require('grunt-contrib-jst/tasks/jst')(grunt);

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
                }
            }
        }
    });

    grunt.registerTask('melvinjs:dev', 'Compiles Melvin.js Project', function() {
        grunt.task.run('clean:before', 'jade', 'jst', 'less', 'copy', 'clean:after');
    });

    grunt.registerTask('melvinjs:prod', 'Optimizes Melvin.js App, making it ready for production', function() {
        grunt.task.run('melvinjs:dev');
    });
};
