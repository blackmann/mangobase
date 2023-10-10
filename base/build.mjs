import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: [],
  outdir: 'dist/',
  platform: 'node',
})
