import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['mongodb'],
  outdir: 'dist/',
  platform: 'node',
})
