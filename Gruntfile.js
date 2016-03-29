'use strict';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    'filerev-clean': {
      options: {
        keepCount: 2,     // кол-во версий файла, которые не удаленяются
        minExpireDays: 3, // файлы не удаляются, если они были созданые за этот промежуток времени   
        splitString: '~', // filename~file_rev_md5_hash.png
      },

      flash: ['public/_hashed/*.swf'],
    },
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-stark-filerev-clean');

  grunt.registerTask('default', ['filerev-clean']);
};
