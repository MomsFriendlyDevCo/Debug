import {expect} from 'chai';
import chalk from 'chalk';
import Debug from '../lib/debugNode.js';
import stripAnsi from 'strip-ansi';

describe('@MomsFriendlyDevCo/Debug (Node)', ()=> {

	let oldConsole = console;
	let output = {};

	before('mock console', ()=>  {
		console = { // eslint-disable-line no-global-assign
			log: (...msg) => {
				output.log = stripAnsi(msg.join(' '));
				oldConsole.log(chalk.bold.white('    ▶'), ...msg);
			},
			warn: (...msg) => {
				output.warn = stripAnsi(msg.join(' '));
				oldConsole.warn(chalk.bold.yellow('    ▶'), ...msg);
			},
		};
	});

	it('should output simple logging', ()=> {
		let log = Debug('test');
		log('Hello');
		expect(output).to.deep.equal({log: '[test] Hello'});
	});

	it('should output handle types', ()=> {
		let log = Debug('types');
		log('string', 123, {foo: 456}, false);

		// Technically this shouldnt be '[object Object]' but when we splat the raw value back thats what we get
		expect(output).to.deep.equal({log: '[types] string 123 [object Object] false'});
	});

});
