import { Ref } from 'mangobase'
import app from '../mangobase-app'
import { signal } from '@preact/signals'

const schemaRefs = signal<Ref[]>([])

async function loadSchemaRefs() {
  schemaRefs.value = (await await app.req.get('_dev/schema-refs')).data
}

export default schemaRefs
export { loadSchemaRefs }
