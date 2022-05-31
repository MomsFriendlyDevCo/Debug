import DebugBase from '#lib/debugBase';

export default function debugFactoryBrowser(context) {
	let debug = DebugBase(context);

	// Override logger for the Browser
	debug._log = function(...msg) {
		console[this._as](
			`%c[${debug._prefix}]`,
			`color: ${this._color}; font-weight: bold`,
			...msg,
		)
	};

	return debug;
}
