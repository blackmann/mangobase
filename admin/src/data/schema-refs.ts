import { Ref } from 'mangobase'
import app from '../mangobase-app'
import { signal } from '@preact/signals'

const schemaRefs = signal<Ref[]>([])

async function loadSchemaRefs() {
  schemaRefs.value = (await app.req.get('_dev/schema-refs')).data
  schemaRefs.value.sort((a, b) => a.name.localeCompare(b.name))
}

export default schemaRefs
export { loadSchemaRefs }
