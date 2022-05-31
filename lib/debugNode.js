import chalk from 'chalk';
import DebugBase from '#lib/debugBase';

export default function debugFactoryNode(context) {
	let debug = DebugBase(context);

	// Override logger for Node
	debug._log = function(...msg) {
		console[this._as](
			chalk.hex(this._color)(`[${this._prefix}]`),
			...msg,
		)
	};

	return debug;
}
