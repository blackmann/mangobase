import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  outdir: 'dist/',
  platform: 'node',
  target: 'es6',
})
