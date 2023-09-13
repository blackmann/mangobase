import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: [
    'jose', // jose is an external dependency because bundling it causes an issue with bun. bun has not implement some 'crypto' API yet.
  ],
  outdir: 'dist/',
  platform: 'node',
})
