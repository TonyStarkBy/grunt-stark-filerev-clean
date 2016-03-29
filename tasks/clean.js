'use strict';

var rimraf = require('rimraf');
var fs = require('fs');

module.exports = function(grunt) {

  function clean(filepath, options) {
    if (!grunt.file.exists(filepath)) {
      return false;
    }

    grunt.log.write((options['no-write'] ? 'Not actually cleaning ' : 'Cleaning ') + filepath + '...');

    // Only delete cwd or outside cwd if --force enabled. Be careful, people!
    if (!options.force) {
      if (grunt.file.isPathCwd(filepath)) {
        grunt.verbose.error();
        grunt.fail.warn('Cannot delete the current working directory.');
        return false;
      } else if (!grunt.file.isPathInCwd(filepath)) {
        grunt.verbose.error();
        grunt.fail.warn('Cannot delete files outside the current working directory.');
        return false;
      }
    }

    try {
      // Actually delete. Or not.
      if (!options['no-write']) {
        rimraf.sync(filepath);
      }
      grunt.log.ok();
    } catch (e) {
      grunt.log.error();
      grunt.fail.warn('Unable to delete "' + filepath + '" file (' + e.message + ').', e);
    }
  }

  grunt.registerMultiTask('filerev-clean', 'Clean files and folders.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      force: grunt.option('force') === true,
      'no-write': grunt.option('no-write') === true,
      splitString: '~',
      minExpireDays: 1,
      keepCount: 1,
    });

    if (options.keepCount < 1) {
      options.keepCount = 1;
    }

    if (options.minExpireDays < 0) {
      options.minExpireDays = 0;
    }

    grunt.verbose.writeflags(options, 'Options');

    var files = {};
    this.filesSrc.forEach(function(filepath) {
      var stats = fs.statSync(filepath);
      var ut = (new Date(stats.mtime)).getTime() / 1000;

      var splittedName = filepath.split(options.splitString)[0];
      if (!Array.isArray(files[splittedName])){
        files[splittedName] = [];
      }

      files[splittedName].push({ut: ut, filename: filepath});
    });


    var expireDate = Math.floor(new Date().getTime()/1000) - options.minExpireDays * 86400;

    grunt.verbose.writeln( 'expireDate: ' + expireDate);

    for (var fileGroup in files) {
      files[fileGroup].sort(function(a, b){
        // сортируем по убыванию даты модификации (новые файлы в начале списка)
        return b.ut-a.ut
      });

      var fileCount = files[fileGroup].length;
      if (fileCount > options.keepCount) {
        for (var i=options.keepCount; i < fileCount; i++) {
          var f = files[fileGroup][i];

          if (f.ut < expireDate) {
            clean(f.filename, options);
          }
        }
      }      
    }     
  });
};
