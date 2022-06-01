import DebugBase from '#lib/debugBase';

export default function debugFactoryBrowser(context) {
	let debug = DebugBase(context);

	// Override logger for the Browser
	debug._log = function(...msg) {
		console[debug._method](
			`%c[${debug._prefix}]`,
			`color: ${debug._color}; font-weight: bold`,
			...msg,
		);
		debug.drain();
	};

	return debug;
}
