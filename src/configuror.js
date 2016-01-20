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

    toAbsolutePath = function(file) {
        return path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    },

    loadJs = function(file) {
        file = toAbsolutePath(file);
        delete require.cache[require.resolve(file)];
        return require(file);
    },
    loadYaml = function(file) {
        var yaml = require('js-yaml');
        file = toAbsolutePath(file);
        return yaml.safeLoad(fs.readFileSync(file))
    },
    /*
      Given a path to a config file of one of the supported types,
      return an object representing the contained data.
     */
    loadFile = function(file) {
        var loaders = {
            js: loadJs,
            json: loadJs,
            yaml: loadYaml
        };
        return loaders[fileType(file)](file);
    },
    
    loadFiles = function(files) {
        return _.extend.apply(_,
                              _.flatten([files.global, files.env, files.local]).map(loadFile))
    },

    configuror = function(dirs, env) {
        var defaults = {
            dirs: ['./config'],
            env: process.env.NODE_ENV
        }, options;

        if( _.isObject(dirs) ) {
            options = _.extend({}, defaults, dirs);
        } else {
            options = _.extend({}, defaults);
            if( _.isString(dirs) ) {
                options.dirs = [dirs];
            } else if( _.isArray(dirs) ) {
                options.dirs = dirs;
            }

            if( _.isString(env) ) {
                options.env = env;
            }
        }

        return loadFiles(parseFiles(getFiles(options.dirs), options.env))
    }
;

configuror.getEnvFromFile = getEnvFromFile;
configuror.getFiles = getFiles;
configuror.parseFiles = parseFiles;
configuror.loadFile = loadFile;
module.exports = configuror;
