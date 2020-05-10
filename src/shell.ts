import { execSync, ExecSyncOptions } from 'child_process';

export function sh(command: string | string[], options: ExecSyncOptions): void {
	let finalCommand = '';

	if (Array.isArray(command)) {
		command = command ?? [];
		finalCommand = command.join(' ');
	}
	else {
		finalCommand = command ?? '';
	}

	const finalOptinos: ExecSyncOptions = {
		stdio: 'inherit',
		...options,
	};

	try {
		execSync(finalCommand, finalOptinos);
	}
	catch (error) {
		if (error.code === 130) {
			process.exit(0);
		}
	}
}
