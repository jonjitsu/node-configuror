var DEFAULT_DIR = 'config',
    SUPPORTED_EXT = [ 'js', 'json', 'yml' ],

    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),

    fileExtRegEx = '(' + SUPPORTED_EXT.join('|') + ')',
    getEnvFromFile = function(filename) {
        var parts = path.parse(filename),
            env = path.extname(parts.name);

        if( env[0]==='.' ) return env.substr(1);
        else return 'global';
    },
    getFiles = function(dirs) {
        if( _.isString(dirs) ) dirs = [dirs];
 
        return dirs
            .reduce(function(allFiles, dir) {
                var files = fs.readdirSync(dir);
                return allFiles.concat(files.map(function(file) {
                    return path.join(dir, file);
                }));
            }, []);
    },
    configuror = function() {}
;

configuror.getEnvFromFile = getEnvFromFile;
configuror.getFiles = getFiles;
module.exports = configuror;
