import esbuild from 'esbuild'

const commonConfig = {
  bundle: true,
  external: ['bcrypt'],
  format: 'esm',
  platform: 'node',
  target: 'esnext',
}

// package
await esbuild.build({
  ...commonConfig,
  entryPoints: ['src/index.ts'],
  outdir: 'dist/',
})

// utitlities
await esbuild.build({
  ...commonConfig,
  entryPoints: ['src/lib/index.ts'],
  outdir: 'dist/lib',
})
