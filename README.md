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

See `debug.log()` for full details.


debug.log(...msg)
-----------------
Output the message contents. This is just a convenience wrapper for `debug(...msg)` that makes chaining a little easier.

If the first argument is a number, it is assumed to be the verbosity level to print at.

```javascript
import Debug from '../lib/debugNode.js';
let log = Debug('Foo').verbosity(1);

log('Default'); // Will output
log(1, 'One'); // Will output if verbosity >= 1
log(2, 'Two'); // Will not print as if verbosity == 1
```


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


debug.verbosity(level)
----------------------
Set the verbosity level of the debugging component.


debug.highlight(match, color, options)
--------------------------------------
Add a highlighting option to add color / special characters to matched text.

Match is a RegExp to match against and color is the function to use to decorate the match.

```javascript
let log = Debug('Highlighting')
log.highlight(/SKU:\d{3,6}/g, log.colors.blue, {prefix: '▷', suffix: '◁'});

log('Should highlight SKUs like SKU:123, SKU:66666 & SKU:123456');
```

Options are:

| Option   | Type     | Default | Description                         |
|----------|----------|---------|-------------------------------------|
| `prefix` | `string` | `''`    | Optional prefix to add to the match |
| `suffix` | `string` | `''`    | Optional suffix to add to the match |


debug.new(prefix)
-----------------
Create a new debugger based on the given prefix.


debug.clone(prefix)
-----------------
Create a new debugger based on the given prefix but also copy over all existing settings.


debug.diff(options)
-------------------
Selectively log the differences between two objects.

Options are:

|Name          | Types                     | Default  | Description                                                                                                                                                                     |
|--------------| ------------------------- | ---------|
|`log`         | function                  | `this`   | Log output function to use, must provide color library as `.colors` subkey                                                                                                      |
|`original`    | Object                    |          | Original, pristine value to examine                                                                                                                                             |
|`originalVia` | function                  |          | Optional function to run original via before diffing. Called as `(original, settings)`                                                                                          |
|`updated`     | Object                    |          | Updated value, provide either this OR `merge` key                                                                                                                               |
|`updatedVia`  | function                  |          | Optional function to run updated (or merged) obejcts through via before diffing. Called as `(updated, settings)`                                                                |
|`merge`       | Object                    |          | Value to merge with original (mutating original)                                                                                                                                |
|`mergeVia`    | function                  |          | Function to conduct the merge of `original` + `merge`. Called as `(original, merge, settings)`, if this function returns non-falsy that value is now used as the updated object |
|`prefix`      | string                    |          | String to use as prefix when a diff is detected                                                                                                                                 |
|`ignore`      | Array or Set              | `['updated']` | Paths to ignore from output                                                                                                                                                     |
|`noChanges`   | string                    |          | String to force display if no changes are present, if omitted nothing is shown                                                                                                  |
|`inspect`     | function                  | `utils.inspect` | Inspector to use when formatting object output. Called as `(thing, settings)`                                                                                                   |
|`formatter`   | function                  |          | Function to use for formated output. Called as `(diff, settings)`                                                                                                               |


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
