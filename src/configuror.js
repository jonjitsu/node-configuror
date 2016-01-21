var DEFAULT_DIR = 'config',
    SUPPORTED_EXT = [ 'js', 'json', 'yml', 'yaml' ],

    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),

    /**
       Given a file name, extract the environment it is for.

       For files with no environment part it returns global.

       @param {String} filename
       @return {String} 'global', 'local', a string representing the environment
    */
    getEnvFromFile = function(filename) {
        var parts = path.parse(filename),
            env = path.extname(parts.name);

        if( env[0]==='.' ) return env.substr(1);
        else return 'global';
    },

    /**
       Given a list of directories, return a list of files within them.

       @param {String|[String]} dirs 1+ directories
       @return {Array} List of files.
     */
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


    /**
       Given a list of files and an optional environment,
       return a map of the necessary files to process.

       @param {[String]} files  List of possible files.
       @param [String] ENV optional environment
       @return {Object} a map consisting of 3 keys with arrays of 0+ filenames

       { global:[String], local:[String], env:[String] }
    */
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

    /**
       Extracts filetype from filename.

       @param {String} file  filename
       @return {String} filetype
     */
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

    /**
       Given a path to a file (relative or absolute),
       return it's absolute path.

       @param {string} file relative/absolute file path
       @return {String}  Absolute file path
     */
    toAbsolutePath = function(file) {
        return path.isAbsolute(file) ? file : path.join(process.cwd(), file);
    },

    /**
       Given a path to a js or json file,
       return the data contained as an object.

       @param {String} file Absolute path to file.
       @return {Object} data contained in file.
     */
    loadJs = function(file) {
        file = toAbsolutePath(file);
        delete require.cache[require.resolve(file)];
        return require(file);
    },
    /**
       Given a path to a yaml file,
       return the data contained as an object.

       @param {String} file  Absolute path to file.
       @return {Object}  data contained in file.
    */
    loadYaml = function(file) {
        var yaml = require('js-yaml');
        file = toAbsolutePath(file);
        return yaml.safeLoad(fs.readFileSync(file))
    },
    /**
      Given a path to a config file of one of the supported types,
      return an object representing the contained data.

      @param {String}   Absolute path to file.
      @return {Object}  Data contained in the file.
     */
    loadFile = function(file) {
        var loaders = {
            js: loadJs,
            json: loadJs,
            yaml: loadYaml
        };
        return loaders[fileType(file)](file);
    },

    /**
       Given a map of global, local, env files,
       fetch all data in files in the following order:
       1. global
       2. environment
       3. local

       and merge it all together overriding any fields.

       @param {Object} files map of the global, local, environment files available.
       @return {Object} all the combined config data.
    */
    loadFiles = function(files) {
        return _.extend.apply(_,
                              _.flatten([files.global, files.env, files.local]).map(loadFile))
    },

    /**
       Main function and entry point.
       Given optional list of config directories
       and an optional environment string,
       return all config data merged and ready to use.

       @param {String|[String]} dirs optional list of directories to fetch config
                                files.
                                Defaults to ['config/']
       @param {String} env  String representing the current environment.
                            Defaults to the NODE_ENV environment variable which
                            is undefined when not set.
       @return {Object} all the combined config data.
    */
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
