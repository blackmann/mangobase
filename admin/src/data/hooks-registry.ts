import app from '../mangobase-app'
import { signal } from '@preact/signals'

interface Hook {
  description: string
  id: string
  name: string
}

const hooksRegistry = signal<Hook[]>([])

async function loadHooksRegistry() {
  hooksRegistry.value = (await app.hookRegistry()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

export default hooksRegistry
export { loadHooksRegistry }
