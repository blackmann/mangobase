import esbuild from 'esbuild'

esbuild.build({
	entryPoints: ['src/index.ts'],
	bundle: true,
	outfile: 'dist/index.js',
	format: 'esm',
	platform: 'node',
	target: 'node18',
	external: [
		'@mangobase/express',
		'@mangobase/mongodb',
		'@next/env',
		'express',
		'mangobase',
		'mongodb',
	],
})
