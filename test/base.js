import {expect} from 'chai';
import chalk from 'chalk';
import Debug from '../lib/debugBase.js';

describe('@MomsFriendlyDevCo/Debug (Base)', ()=> {

	let oldConsole = console;
	let output = {};

	before('mock console', ()=>  {
		console = { // eslint-disable-line no-global-assign
			log: (...msg) => {
				output.log = msg.join(' ');
				oldConsole.log(chalk.bold.white('    ▶'), ...msg);
			},
			warn: (...msg) => {
				output.warn = msg.join(' ');
				oldConsole.warn(chalk.bold.yellow('    ▶'), ...msg);
			},
		};
	});

	it('should output simple logging', ()=> {
		let log = Debug('test');
		log('Hello');
		expect(output).to.deep.equal({log: '[test] Hello'});
	});

});
