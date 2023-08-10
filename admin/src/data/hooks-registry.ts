import app from '../mangobase-app'
import { signal } from '@preact/signals'

interface Hook {
  description: string
  id: string
  name: string
}

const hooksRegistry = signal<Hook[]>([])

async function loadHooksRegistry() {
  hooksRegistry.value = await app.hookRegistry()
}

export default hooksRegistry
export { loadHooksRegistry }
