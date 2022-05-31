@MomsFriendlyDevCo/Debug
========================
Isomorphic chainable log / debugging utility.

This module works in Node as well as the browser.


CJS
---

```javascript
var log = require('@momsfriendlydevco/debug')('MyApp');

log('Hello World') // Will log `[MyApp] Hello World`
```


ESM
---
```javascript
import Debug from '../lib/debugNode.js';
let log = Debug('MyApp');


log('Hello World') // Will log `[MyApp] Hello World`
```


API
===
The Debug function is a chainable object so any number of methods can be used in sequence.

```javascript
log.as('New Context').force('Hello World') // Will log even if the current logger is disabled
```


Debug(prefix)
-------------
Create a new Debug instance and set its prefix.


debug(...msg)
-------------
Debug instance, output whatever input is given with the associated prefix.


as(prefix) / prefix(prefix)
---------------------------
Set a new prefix for this instance.


warn(...msg)
------------
Same as `log()` but outputs to `STDERR` instead of `STDOUT`.


force(...msg)
-------------
Output even if this logger is disabled.


enable(isEnabled?)
------------------
Set whether this debugger is enabled.


disable(isDisabled?)
--------------------
Opposite of `enable()`


only(...msg)
------------
Output a message (even if disabled) then disable this logger.


new(prefix)
-----------
Create a new debugger based on the given prefix.
