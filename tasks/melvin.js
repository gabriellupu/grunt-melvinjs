module.exports = function(grunt) {
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.initConfig({
        clean: {
            compiled: ['compiled']
        },
        jade: {
            templates: {
                options: {
                    pretty: false,
                    processName: function( filename ) {
                        var moduleTemplateRegex = /modules\/([\w\d-_]+)\/templates\/([\w\d-_]+)/g;
                        var matches = moduleTemplateRegex.exec(filename);
                        return '#' + matches[1] + '-' + matches[2];
                    },
                    client: true
                },
                files: {
                    'tmp/templates.js': ['app/modules/**/templates/*.jade', '!_*.jade']
                }
            },
            index: {
                files: {
                    'index.html': 'app/index.jade'
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
        grunt.task.run('clean', 'jade', 'less', 'copy');
    });
};
