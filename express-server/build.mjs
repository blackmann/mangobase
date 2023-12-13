import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['express', 'mangobase', 'cors'],
  format: 'esm',
  outdir: 'dist/',
  platform: 'node',
})
