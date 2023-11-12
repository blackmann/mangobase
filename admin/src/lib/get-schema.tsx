import schemaRefs, { loadSchemaRefs } from '../data/schema-refs'
import AppError from '@/lib/app-error'
import type { Ref } from 'mangobase'
import app from '../mangobase-app'
import { loadCollections } from '../data/collections'

export async function getSchema(name: string): Promise<Ref> {
  if (!schemaRefs.value?.length) {
    await loadCollections()
    await loadSchemaRefs()
  }

  if (name === 'new') {
    return {
      name: 'Add new schema',
      schema: {},
    }
  }

  const nameParts = name.split('/')
  const refName = nameParts.pop()!
  const [scope] = nameParts

  try {
    const { data: schema } = await app.req.get(
      `_dev/schema-refs/${refName}?$scope=${scope || ''}`
    )

    return schema
  } catch (err) {
    throw new AppError((err as any).message, err)
  }
}
