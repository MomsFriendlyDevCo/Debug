import {expect} from 'chai';
import chalk from 'chalk';
import Debug, {debugDefaults} from '../lib/debugNode.js';
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

	afterEach('clear mock console state', ()=> output = {});
	afterEach('clear seen log', ()=> debugDefaults.seen = {});

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

	it('should handle color rotation for multiple logs', ()=> {
		let logs = Array.from(new Array(10))
			.map((x, i) => Debug(`Log${i+1}`).log('Test output'))

		logs.forEach((log, i) => {
			expect(log).to.have.property('_color', debugDefaults.colorTable[i]);
		})
	});

	it('should handle temporary as() calls inline', ()=> {
		let log = Debug('Foo');
		log.as('Bar', 'Test');
		expect(output).to.deep.equal({log: '[Bar] Test'});
	});

	it('should handle temporary as() calls with chaining', ()=> {
		let log = Debug('Foo');
		log.as('Baz').warn('Test');
		expect(output).to.deep.equal({warn: '[Baz] Test'});
	});

	it('should handle multiple as() calls with chaining', ()=> {
		let log = Debug('Foo');
		log.as('Quz').as('Quuuz').as('Quuuuz').log('Hello');
		expect(output).to.deep.equal({log: '[Quuuuz] Hello'});
	});

	it('only should output once', ()=> {
		let log = Debug('Foo');
		log.only('one');
		log('two');
		log.log('three');
		expect(output).to.deep.equal({log: '[Foo] one'});
	});

	it('should provide a colors subkey', ()=> {
		let log = Debug('Color Tests');
		expect(log).to.have.property('colors');
		expect(log.colors.cyan).to.be.a('function');

		log(log.colors.red('This'), log.colors.green('is'), log.colors.blue('colorful'));
		expect(output).to.deep.equal({log: '[Color Tests] This is colorful'});
	});

});


describe('@MomsFriendlyDevCo/Debug (Node + Diff)', ()=> {

	it('should diff two objects', ()=> {
		let log = Debug('Diff Test');
		log.diff({
			original: {foo: 'Foo'},
			updated: {foo: 'Foo!', bar: 'Bar!'},
		});
	});

});
