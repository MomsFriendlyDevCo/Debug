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
export default function DebugFactory(context) {
	let debug = function debug(...msg) {
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

	debug._color = undefined;
	debug._prefix = 'UNKNOWN';
	debug.enabled = true;
	debug._as = 'log'; // Method to use to output


	/**
	* Actual log output function
	* This is expected to be subclassed by an upstream module like ./debugNode or ./debugBrowser
	* @param {string} [msg...] Messages to output
	* @this The active debugger instance
	*/
	debug._log = function(...msg) {
		console[this._as](
			`[${this._prefix}]`,
			...msg,
		);
	};


	/**
	* Set the debug prefix based either on a simple string or try to extract it from a VueComponent automatically
	* @param {Object|VueComponent} context Either a string ID prefix or a VueComponent to extract one from
	* @returns {Debug} This chainable debug instance
	*/
	debug.as = debug.prefix = function(context) {
		this._prefix =
			typeof context == 'string' ? context
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
	* Force output the given message as a warning
	* @param {*} msg... The message contents to output
	* @returns {Debug} This chainable debug instance
	*
	* @example Force debugging even if vm.debugging is disabled
	* vm.debug.force('Hello', this.world);
	*/
	debug.warn = (...msg) => {
		let oldAs = debug._as;
		debug._as = 'warn';
		if (msg.length) debug.force(...msg);
		debug._as = oldAs;
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
	debug.force = (...msg) => {
		let oldEnabled = debug.enabled;
		debug.enabled = true;
		if (msg.length) debug(...msg);
		debug.enabled = oldEnabled;
		return debug;
	};


	/**
	* Enable or disable debugging
	* @param {boolean} [isEnabled=true] Whether the component is enabled
	* @returns {Debug} This chainable debug instance
	*/
	debug.enable = isEnabled => {
		debug.enabled = isEnabled ?? true;
		return debug;
	};


	/**
	* Disable or enabled debugging
	* @param {boolean} [isDisabled=true] Whether the component is disabled
	* @returns {Debug} This chainable debug instance
	*/
	debug.disable = isDisabled => {
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
	debug.only = (...msg) => debug.enable()(...msg).disable();


	/**
	* Utilify function to flatten Vue proxies into a native object
	* Yes, doing a stringify |> parse is exceptionally stupid, you find a better way - MC 2020-10-13
	* This function is sub-classable
	* @param {*} v Value to deconstruct
	* @returns {*} Flattened, de-proxied version of the input object
	*/
	debug.deconstruct = v => {
		try {
			return JSON.parse(JSON.stringify(v));
		} catch (e) { // Can't deconstruct - probably something stupid like circular references
			return v;
		}
	};


	/**
	* Quick method to return a new instance of a debugger and also set a prefix
	* @param {string|VueComponent} context Optional prefix to set for the new instance
	* @returns {Debug} New debugging instance
	*
	* @example Create a specific debug utility from the generic Vue service
	* let myDebugger = this.debug.new('New-Debugger');
	*/
	debug.new = context => DebugFactory(context);


	/**
	* Wrapper to stop unnecessary garbage printout in the console when using the debug functions inline
	*/
	debug.toString = ()=> '[debug]';


	// Return this instance
	if (context) debug.prefix(context);
	return debug;
}
