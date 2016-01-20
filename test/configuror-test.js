var assert = require('chai').assert,
    is = assert.strictEqual,
    p = require('path'),
    _ = require('lodash'),
    c = require('../src/configuror'),

    appendTo = function(dir, files) {
        return files.reduce(function(all, file) {
            if( _.isArray(file) ) return all.concat(appendTo(dir, file));
            all.push(p.join(dir, file));
            return all;
        }, []);
    }
;

describe('configuror', function() {
    it('getEnvFromFile: can extra environment from global/local/env files.', function() {
        is('global', c.getEnvFromFile('config.js'));
        is('global', c.getEnvFromFile('config.json'));
        is('global', c.getEnvFromFile('config.yml'));


        is('local', c.getEnvFromFile('config.local.js'));
        is('local', c.getEnvFromFile('config.local.json'));
        is('local', c.getEnvFromFile('config.local.yml'));


        is('dev', c.getEnvFromFile('config.dev.js'));
        is('test', c.getEnvFromFile('config.test.json'));
        is('prod', c.getEnvFromFile('c-onfig.prod.yml'));
        is('preprod', c.getEnvFromFile('con_fig.preprod.yml'));
        is('staging', c.getEnvFromFile('c-o_n.fig.staging.yml'));
    });


    it('getFiles: can get a list of config files given one or more directories', function() {
        var dir = 'test/fixtures/config1/',
            expected = ['c1.js', 'c1.local.js'].map(function(f) { return dir + f; });

        assert.deepEqual(expected, c.getFiles(dir));


        var dir = ['test/fixtures/config1/', 'test/fixtures/config2/'],
            expected = dir.reduce(function(files, dir) {
                return files.concat(['c1.js', 'c1.local.js'].map(function(f) { return dir + f; }));
            }, []);
        assert.deepEqual(expected, c.getFiles(dir));
    });



    it('parseFiles: Given a list of files and an environment, it can return a map of filetype -> list of files', function() {
        var dir = 'test/fixtures/config3',
            global = ['c1.js', 'c2.json', 'c3.yml' ],
            local = ['c1.local.json'],
            env = ['c3.test.js', 'c4.test.yml'],
            files = appendTo(dir, [global, local, env]),
            expected = {
                global: appendTo(dir, global),
                local: appendTo(dir, local),
                env: appendTo(dir, env)
            }

        assert.deepEqual(expected, c.parseFiles(files, 'test'));

        files.push('scrap.prod.js');
        files.push('scrap.staging.js');
        assert.deepEqual(expected, c.parseFiles(files, 'test'));

        expected.env = [];
        assert.deepEqual(expected, c.parseFiles(files));
    });


    it('loadFile: Given any supported file type, load its data as an object', function() {
        var files = {
            'test/fixtures/config.json': { a:1, B:'asdf'}, 
            'test/fixtures/config.js': { Z:9, 'a.b.c': '123', 'computed value': 9 }
        };


        for( var file in files ) {
            assert.deepEqual(files[file], c.loadFile(file));
        }
    });
});
