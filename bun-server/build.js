import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  outdir: 'dist/',
  external: ['mangobase'],
  platform: 'node',
})
