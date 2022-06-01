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


debug.log(...msg)
-----------------
Output the message contents. This is just a convenience wrapper for `debug(...msg)` that makes chaining a little easier.


debug.prefix(prefix)
--------------------
Set a new, permanent prefix for this instance.


debug.as(prefix, ...msg?)
-------------------------
Set a _temporary_ prefix for the next logging operation.
This will revert to the last prefix after log() has performed an operation.

```javascript
import Debug from '../lib/debugNode.js';
let log = Debug('Foo');

log('1'); // Output: [Foo] 1

log.as('Bar', '2'); // Output: [Bar] 2

log.as('Baz').log('3'); // Output: [Baz] 3
```


debug.warn(...msg)
------------------
Same as `log()` but outputs to `STDERR` instead of `STDOUT`.


debug.force(...msg)
-------------------
Output even if this logger is disabled.


debug.enable(isEnabled?)
------------------------
Set whether this debugger is enabled.


debug.disable(isDisabled?)
--------------------------
Opposite of `enable()`


debug.only(...msg)
------------------
Output a message (even if disabled) then disable this logger.


debug.new(prefix)
-----------------
Create a new debugger based on the given prefix.


debug.colors
------------
Only available to Node instances.
Instance of [Chalk](https://github.com/chalk/chalk) to easily wrap coloring.

```javascript
import Debug from '../lib/debugNode.js';
let log = Debug('MyApp', log.colors.red('Red'), log.colors.white('White'), log.colors.blue('Blue'));
```

debug.enabled
-------------
Boolean indicating if this debugger is enabled.
