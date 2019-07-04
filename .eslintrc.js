module.exports = {
	env: {
		node: true,
		es6: true,
	},
	extends: ['google'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'linebreak-style': 0,
		indent: ['error', 'tab'],
		'no-tabs': 0,
		'require-jsdoc': 0,
		'max-len': 0,
		'no-unused-vars': 1,
		'object-curly-spacing': ['error', 'always'],
	},
};
