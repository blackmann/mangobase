import { signal } from "@preact/signals"
import app from "../mangobase-app"

interface Hook {
  description: string
  id: string
  name: string
}

const hooksRegistery = signal<Hook[]>([])

async function loadHooksRegistry() {
  hooksRegistery.value = await app.hookRegistry()
}

export default hooksRegistery
export { loadHooksRegistry }
