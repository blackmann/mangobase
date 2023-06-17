import { signal } from '@preact/signals'
import Collection from '../client/collection'
import app from '../mangobase-app'

const collections = signal(<Collection[]>[])

async function loadCollections() {
  const cols = await app.collections()
  collections.value = cols
}

export default collections
export { loadCollections }
