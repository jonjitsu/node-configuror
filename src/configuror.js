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

    parseFiles = function(files, ENV) {
        var base = {global:[], local:[], env:[]};
        return files
            .reduce(function(map, file) {
                var env = getEnvFromFile(file);

                if( env==='global' || env==='local' ) {
                    map[env].push(file);
                } else if( ENV!==undefined && ENV===env ) {
                    map.env.push(file);
                }
                return map;
            }, base);
    },

    fileType = function(file) {
        var types = {
            js: 'js',
            json: 'json',
            yaml: '(?:yml|yaml)'
        }, type;
        for(type in types) {
            if( new RegExp('\\.' + types[type] + '$').test(file) ) return type;
        }
        return false;
    },

    loadJs = function(file) {
        file = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
        delete require.cache[require.resolve(file)];
        return require(file);
    },
    /*
      Given a path to a config file of one of the supported types,
      return an object representing the contained data.
     */
    loadFile = function(file) {
        var loaders = {
            js: loadJs,
            json: loadJs
        };
        return loaders[fileType(file)](file);
    },
    loadFiles = function(files) {
        
    },

    configuror = function(dirs, env) {
    }
;

configuror.getEnvFromFile = getEnvFromFile;
configuror.getFiles = getFiles;
configuror.parseFiles = parseFiles;
configuror.loadFile = loadFile;
module.exports = configuror;
