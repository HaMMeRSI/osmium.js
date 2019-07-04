module.exports = {
	parser: '@typescript-eslint/parser',
	env: {
		node: true,
		es6: true,
	},
	extends: ['google', 'plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
		document: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'@typescript-eslint/interface-name-prefix': [1, 'always'],
		'linebreak-style': 0,
		indent: ['error', 'tab'],
		'no-tabs': 0,
		'require-jsdoc': 0,
		'max-len': 0,
		'no-unused-vars': 1,
		'object-curly-spacing': ['error', 'always'],
		'no-undef': 2,
	},
};
