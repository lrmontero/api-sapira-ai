module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin', 'import', 'unused-imports'],
	extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'prettier'],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.js'],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		// Removemos las reglas de indentación para dejar que Prettier se encargue
		'@typescript-eslint/indent': 'off',
		indent: 'off',
		// Reglas para ordenar importaciones
		'import/order': [
			'error',
			{
				groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type', 'object'],
				pathGroups: [
					{
						pattern: '@/**',
						group: 'internal',
						position: 'before',
					},
					{
						pattern: '../**',
						group: 'parent',
						position: 'after',
					},
				],
				'newlines-between': 'always',
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
				warnOnUnassignedImports: true,
			},
		],
		'sort-imports': [
			'error',
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
				ignoreMemberSort: false,
				allowSeparatedGroups: true,
			},
		],
		// Eliminar importaciones no utilizadas
		'unused-imports/no-unused-imports': 'error',
		'unused-imports/no-unused-vars': [
			'warn',
			{
				vars: 'all',
				args: 'after-used',
			},
		],
	},
};
