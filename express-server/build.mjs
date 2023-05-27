import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['express', 'mangobase'],
  outdir: 'dist/',
  platform: 'node',
  target: 'es2020',
})
