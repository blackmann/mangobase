import type { Definition } from 'mangobase'
import app from '../mangobase-app'
import { signal } from '@preact/signals'

interface Hook {
  configSchema: Record<string, Definition>
  description: string
  id: string
  name: string
}

const hooksRegistry = signal<Hook[]>([])

async function loadHooksRegistry() {
  hooksRegistry.value = ((await app.hookRegistry()) as Hook[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

export default hooksRegistry
export { loadHooksRegistry }
export type { Hook }
