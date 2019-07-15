module.exports = {
	parser: '@typescript-eslint/parser',
	env: {
		node: true,
		es6: true,
		browser: true,
	},
	extends: ['google', 'plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'@typescript-eslint/no-var-requires': 0,
		'@typescript-eslint/interface-name-prefix': [1, 'always'],
		'@typescript-eslint/prefer-interface': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'linebreak-style': 0,
		'no-tabs': 0,
		'require-jsdoc': 0,
		'max-len': 0,
		'no-unused-vars': 1,
		'object-curly-spacing': ['error', 'always'],
		'no-undef': 2,
	},
};
