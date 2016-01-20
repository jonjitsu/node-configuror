var assert = require('chai').assert,
    is = assert.strictEqual,
    c = require('../src/configuror')
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

    it('getFiles: can get a list of config files given a list of directories', function() {
        var dir = 'test/fixtures/config1/',
            expected = ['c1.js', 'c1.local.js'].map(function(f) { return dir + f; });

        assert.deepEqual(expected, c.getFiles(dir));


        var dir = ['test/fixtures/config1/', 'test/fixtures/config2/'],
            expected = dir.reduce(function(files, dir) {
                return files.concat(['c1.js', 'c1.local.js'].map(function(f) { return dir + f; }));
            }, []);
        assert.deepEqual(expected, c.getFiles(dir));
    });
});
