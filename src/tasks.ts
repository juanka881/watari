import minimist from 'minimist';

/**
 * task options
 */
export interface TaskOptions {
	autorun: boolean;
}

/**
 * task arguments
 */
export interface TaskArgs {
	[key: string]: any;
}

/**
 * tasks fn type
 */
export type TaskFn =
	| ((args?: TaskArgs) => Promise<void>)
	| ((args?: TaskArgs) => void);

/**
 * general error code
 */
export const ERROR_GENERAL = 1;

/**
 * no tasks found error code
 */
export const ERROR_NO_TASKS = 201;

/**
 * task is not a fn
 */
export const ERROR_TASK_IS_NOT_FN = 202;

/**
 * task name not found error code
 */
export const ERROR_TASK_NOT_FOUND = 203;

/**
 * tasks registry
 */
let registry: { [key: string]: TaskFn } = {};

/**
 * get default task options
 */
export function getDefaultOptions(): TaskOptions {
	return {
		autorun: true,
	};
}

/**
 * task options
 */
const taskOptions = getDefaultOptions();

/**
 * get current task options
 */
export function getOptions(): TaskOptions {
	return taskOptions;
}

/**
 * set current task options
 * @param options options
 */
export function setOptions(options: Partial<TaskOptions>): void {
	Object.assign(taskOptions, options);
}

/**
 * reset all registered tasks
 */
export function reset(): void {
	registry = {};
}

/**
 * register a list of tasks, task names are taken
 * from the object keys
 * @param list object with list of tasks
 */
export function task(list: { [key: string]: TaskFn }): void;

/**
 * register a task
 * @param name task name
 * @param fn task fn
 */
export function task(name: string, fn: TaskFn): void;

/**
 * overloaded task fn impl
 * @param args arguments
 */
export function task(...args: any[]): void {
	const len = args.length;
	const autorun = getOptions().autorun;

	if (len === 1) {
		const taskList = args[0];
		const keys = Object.keys(taskList);
		for (const key of keys) {
			registry[key] = taskList[key];
		}
	}
	else if (len === 2) {
		const name = args[0];
		const fn = args[1];
		registry[name] = fn;
	}
	else {
		throw new Error('invalid call, expected task list or task name and fn');
	}

	if (autorun) {
		scheduleAutorun();
	}
}

/**
 * run a task
 * @param name task name
 */
export async function run(name: string, args?: TaskArgs): Promise<number> {
	const fn = registry[name];

	if (!fn) {
		return ERROR_TASK_NOT_FOUND;
	}

	if (typeof fn !== 'function') {
		return ERROR_TASK_IS_NOT_FN;
	}

	const result: any = fn(args);

	const isPromise = typeof result?.then === 'function';
	if (isPromise) {
		await result;
	}

	return 0;
}

/**
 * schedule tasks to run, if not already set
 */
let scheduled = false;
export function scheduleAutorun(): void {
	if (scheduled) {
		return;
	}

	scheduled = true;
	process.nextTick(async () => {
		const args = process.argv.slice(2);
		const code = await execute(args);
		if (code !== 0) {
			process.exit(code);
		}
	});
}

/**
 * run tasks main function
 */
export async function execute(args: string[]): Promise<number> {
	if (Object.keys(registry).length === 0) {
		console.log('watari: no tasks registered');
		return ERROR_NO_TASKS;
	}

	const taskArguments = minimist(args);
	let taskNames = taskArguments._ || [];

	if (taskNames.length === 0) {
		taskNames = ['default'];
	}

	let currentTaskName = '';
	try {
		for (const taskName of taskNames) {
			currentTaskName = taskName;
			const code = await run(currentTaskName, taskArguments);

			if (code !== 0) {
				return code;
			}
		}
	}
	catch (error) {
		const code = error.code === undefined ? ERROR_GENERAL : error.code;
		console.log(
			`${currentTaskName}: error ${code} - ${error.message}`,
		);
		return code;
	}

	return 0;
}
