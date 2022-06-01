/**
* Global debug options
* @type {Object}
* @property {array<string>} colorTable Lookup colors to use, nominated in order of the component loading
* @property {Object<number>} seen Which components have been seen and what their nominated colorTable offset is
*/
export let globalDefaults = {
	colorTable: ['#009ACD', '#8b2323', '#2f4f4f', '#2e8b57', '#ee7600', '#ff1493', '#9932cc', '#b03060', '#0000FF'],
	seen: {}, // debuggers we have seen this session and their allocated offset in the above color table
}


/**
* @example Debug simple data
* let log = require('@momsfriendlydevco/debug')('myName');
* log('hello world') // Will output `[myName] Hello World`
*
* @example Chain methods
* let debug = require('@momsfriendlydevco/debug')
* let log = debug().as('myName').warn('This is a warning');
*/
export default function DebugFactory(prefix) {
	let debug = (...msg) => debug.log(...msg);

	/**
	* Hex color assigned to this Debug session from globalDefaults.colorTable
	* If none is allocated the first call to `log` sets this
	* @type {string};
	*/
	debug._color = undefined;

	/**
	* Currently set prefix
	* @type {string}
	*/
	debug._prefix = 'UNKNOWN';

	/**
	* Method on `console` to actually use to output
	* @type {string}
	*/
	debug._method = 'log'; // Method to use to output

	/**
	* Array of functions to run when drain is called
	* This serves as a tidy-up queue which can be used by some chainable functions to undo temporary operations
	* @type {array<function>}
	*/
	debug._drain = [];

	/**
	* Whether this debugger is enabled
	* @type {boolean}
	*/
	debug.enabled = true;


	/**
	* Main logger function called if no other chainable function is used from the base function
	* @param {string} [msg...] Messages to output
	* @this The active debugger instance
	*/
	debug.log = function(...msg) {
		if (!debug.enabled) return debug;

		// Not allocated a color before
		if (!debug._color) {
			if (globalDefaults.seen[debug.prefix] === undefined) // Not seen this prefix before
				globalDefaults.seen[debug.prefix] = Object.keys(globalDefaults.seen).length % globalDefaults.colorTable.length; // Nominate the color to use for this element based on the order it loaded

			debug._color = globalDefaults.colorTable[globalDefaults.seen[debug.prefix]] || '#FF00FF'; // Alloc color offset or use fallback purple
		}

		debug._log.apply(debug, msg.map(m => debug.deconstruct(m)));

		return debug;
	};


	/**
	* Actual log output function
	* This is expected to be subclassed by an upstream module like ./debugNode or ./debugBrowser
	* Note that a call to `drain()` is required as the post-output action to empty the drain queue
	* @param {string} [msg...] Messages to output
	* @this The active debugger instance
	*/
	debug._log = function(...msg) {
		console[debug._method](
			`[${debug._prefix}]`,
			...msg,
		);
		debug.drain();
	};


	/**
	* Permanently the debug prefix based either on a simple string or try to extract it from a VueComponent automatically
	* To set the prefix temporarily use `as()`
	* @param {Object|VueComponent} prefix Either a string ID prefix or a VueComponent to extract one from
	* @returns {Debug} This chainable debug instance
	*/
	debug.prefix = function(prefix) {
		this._prefix =
			typeof prefix == 'string' ? prefix
			: this._id ? this._id // If the component has a specified ID
			: this.$vnode && this.$vnode.tag ? this.$vnode.tag.replace(/^vue-component-\d+-/, '') // Use a (mangled) Vue tag
			: this._uid ? this._uid
			: (()=> { // Try to read stack trace
				let caller = Error().stack.split('\n').slice(3, 4);
				if (!caller) return;
				let callerBits = /^\s+at (.+) /.exec(caller);
				if (!callerBits) return;
				return callerBits[1];

			})() || 'UNKNOWN';

		return debug;
	};


	/**
	* Temporarily set the prefix, output something then set the prefix back
	* @param {string} prefix The new prefix to temporarily set
	* @param {*} msg... Message to output
	* @returns {Debug} This chainable debug instance
	*/
	debug.as = function(prefix, ...msg) {
		let oldPrefix = debug._prefix;
		debug.prefix(prefix);
		debug._drain.push(d => d.prefix(oldPrefix));

		if (msg.length > 0) debug.log(...msg); // If args, call the logger, otherwise continue chaining

		return debug;
	};


	/**
	* Force output the given message as a warning
	* @param {*} msg... The message contents to output
	* @returns {Debug} This chainable debug instance
	*
	* @example Force debugging even if vm.debugging is disabled
	* vm.debug.force('Hello', this.world);
	*/
	debug.warn = function(...msg) {
		let oldMethod = debug._method;
		debug._method = 'warn';
		debug._drain.push(d => d._method = oldMethod);
		debug.log(...msg);
		return debug;
	};


	/**
	* Switch on debugging for this one message + output
	* @param {*} msg... The message contents to output
	* @returns {Debug} This chainable debug instance
	*
	* @example Force debugging even if vm.debugging is disabled
	* vm.debug.force('Hello', this.world);
	*/
	debug.force = function(...msg) {
		let oldEnabled = debug.enabled;
		debug.enabled = true;
		debug._drain.push(d => d.enabled = oldEnabled);
		if (msg.length) debug.log(...msg);
		return debug;
	};


	/**
	* Enable or disable debugging
	* @param {boolean} [isEnabled=true] Whether the component is enabled
	* @returns {Debug} This chainable debug instance
	*/
	debug.enable = function(isEnabled) {
		debug.enabled = isEnabled ?? true;
		return debug;
	};


	/**
	* Disable or enabled debugging
	* @param {boolean} [isDisabled=true] Whether the component is disabled
	* @returns {Debug} This chainable debug instance
	*/
	debug.disable = function(isDisabled) {
		debug.enabled = isDisabled == true;
		return debug;
	};


	/**
	* Output this item and disable outputting for any other debug call that is not also marked as `only`
	* @param {*} msg... The message contents to output
	* @returns {Debug} This chainable debug instance
	*
	* @example Output only this item and disable from hereon unless another call to a `only()` marked function is used
	* vm.debug.only('Hello', this.world);
	*/
	debug.only = (...msg) => debug.enable().log(...msg).disable();


	/**
	* Runs all actions in the `_drain` queue to tidy up after logging has occured
	* @returns {Debug} This chainable debug instance
	*/
	debug.drain = function() {
		debug._drain.forEach(f => f.call(debug, debug));
		return debug;
	};


	/**
	* Utilify function to flatten Vue proxies into a native object
	* Yes, doing a stringify |> parse is exceptionally stupid, you find a better way - MC 2020-10-13
	* This function is sub-classable
	* @param {*} v Value to deconstruct
	* @returns {*} Flattened, de-proxied version of the input object
	*/
	debug.deconstruct = function(v) {
		try {
			return JSON.parse(JSON.stringify(v));
		} catch (e) { // Can't deconstruct - probably something stupid like circular references
			return v;
		}
	};


	/**
	* Quick method to return a new instance of a debugger and also set a prefix
	* @param {string|VueComponent} prefix Optional prefix to set for the new instance
	* @returns {Debug} New debugging instance
	*
	* @example Create a specific debug utility from the generic Vue service
	* let myDebugger = this.debug.new('New-Debugger');
	*/
	debug.new = function(prefix) {
		return DebugFactory(prefix);
	};


	/**
	* Wrapper to stop unnecessary garbage printout in the console when using the debug functions inline
	*/
	debug.toString = ()=> '[debug]';


	// Return this instance
	if (prefix) debug.prefix(prefix);
	return debug;
}
