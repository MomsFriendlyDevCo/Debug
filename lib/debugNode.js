import chalk from 'chalk';
import DebugBase from '#lib/debugBase';

export default function debugFactoryNode(context) {
	let debug = DebugBase(context);

	// Override logger for Node
	debug._log = function(...msg) {
		console[debug._method](
			chalk.hex(debug._color)(`[${debug._prefix}]`),
			...msg,
		);
		debug.drain();
	};

	// Check that new instances this module, not the base
	debug.new = prefix => debugFactoryNode(prefix);

	// Glue Chalk instance
	debug.colors = chalk;

	return debug;
}
