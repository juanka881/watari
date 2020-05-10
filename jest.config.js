module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	coverageDirectory: '<rootDir>/dist/.coverage',
	roots: [
		'<rootDir>/test',
	],
};
