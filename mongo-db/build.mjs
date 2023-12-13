import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['mongodb', 'mangobase'],
  format: 'esm',
  outdir: 'dist/',
  platform: 'node',
})
