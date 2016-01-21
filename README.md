<div id="table-of-contents">
<h2>Table of Contents</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#orgheadline9">1. Configuror</a>
<ul>
<li><a href="#orgheadline3">1.1. Quick start</a>
<ul>
<li><a href="#orgheadline1">1.1.1. Global/Local style configuration</a></li>
<li><a href="#orgheadline2">1.1.2. Environment style configuration</a></li>
</ul>
</li>
<li><a href="#orgheadline8">1.2. Details</a>
<ul>
<li><a href="#orgheadline7">1.2.1. File formats</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>

# Configuror<a id="orgheadline9"></a>

Config file loader based on 2 different configuration styles:

-   Global/Local
-   Environment (dev/test/staging/prod/etc&#x2026;)

Supporting multiple file formats:

-   .js
-   .json
-   .yml

Sane defaults included&#x2026;

## Quick start<a id="orgheadline3"></a>

Given the following directory structure in your project root:

    config/
      db.js
      api.js

    var config = require('configuror')();

config will contain values from files in config/ merged.

### Global/Local style configuration<a id="orgheadline1"></a>

by adding files with .local. preceding the extension allows overriding config
options with machine specific values.

    config/
      db.js
      api.js
      db.local.js

### Environment style configuration<a id="orgheadline2"></a>

by adding files with .env. preceding the extension allows overriding config
options with environment specific values.

    config/
      db.js
      api.js
      api.test.js

    NODE_ENV=test node app.js

With NODE<sub>ENV</sub> set to test the api.test.js will override values in api.js

## Details<a id="orgheadline8"></a>

Both global/local and environment style configurations can be mixed.

There are no predefined environments such as dev/test/staging/production so you
can use any name desired for the environments.

Any of the above mentioned file formats can be used. 
db.local.yml will override db.js.

### File formats<a id="orgheadline7"></a>

1.  JS

        module.exports = {
          host: "example.com"
        }

2.  JSON

        {
          "user": "jim"
        }

3.  YAML

        ipaddress: 127.0.0.1
