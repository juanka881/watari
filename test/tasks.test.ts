import { assert } from 'chai';
import { task, reset, execute, setOptions } from '../src';

beforeEach(() => {
	reset();
	setOptions({
		autorun: false,
	});
});

it('can run task', async () => {
	let value = 0;

	task('inc', () => (value += 1));
	const code = await execute(['inc']);

	assert.equal(code, 0);
	assert.equal(value, 1);
});

it('can run multiple tasks', async () => {
	let x = 0;
	let y = 0;

	task('incx', () => (x += 1));
	task('incy', () => (y += 1));

	const code = await execute(['incx', 'incy']);

	assert.equal(code, 0);
	assert.equal(x, 1);
	assert.equal(y, 1);
});

it('can register task via list', async () => {
	let x = 0;
	function incx(): void {
		x += 1;
	}

	let y = 0;
	function incy(): void {
		y += 1;
	}

	task({ incx, incy });

	const code = await execute(['incx', 'incy']);

	assert.equal(code, 0);
	assert.equal(x, 1);
	assert.equal(y, 1);
});
