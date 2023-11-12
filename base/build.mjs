import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: [],
  format: 'esm',
  outdir: 'dist/',
  platform: 'node',
})
