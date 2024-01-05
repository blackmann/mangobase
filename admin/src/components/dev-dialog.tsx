import {
  type ExportOptions,
  type ExportResult,
  exportSchema,
} from 'mangobase/lib'
import Button from './button'
import Collection from '@/client/collection'
import Input from './input'
import React from 'preact/compat'
import Select from './select'
import clsx from 'clsx'
import { getSchema } from '@/lib/get-schema'
import { useForm } from 'react-hook-form'
import { SchemaDefinitions } from 'mangobase'

const tabs = [
  { id: 'request', title: 'Request' },
  { id: 'code', title: 'Code' },
] as const

type TabId = (typeof tabs)[number]['id']

interface Props {
  collection: Collection
}

function DevDialog({ collection }: Props) {
  const [activeTab, setActiveTab] = React.useState<TabId>(tabs[0].id)

  return (
    <div className="bg-zinc-50 dark:bg-neutral-800 rounded-lg p-2 border border-zinc-200 dark:border-neutral-700 mx-2 w-[20rem]">
      <header>
        <h2 className="font-bold flex items-center gap-2 mb-2">
          <span className="material-symbols-rounded text-lg text-blue-500">
            deployed_code
          </span>
          <span className="text-zinc-700 dark:text-neutral-100">
            Dev Experience
          </span>
        </h2>
      </header>

      <div className="flex justify-between border-b border-b-zinc-200 dark:border-b-neutral-700 mb-2">
        <ul className="flex gap-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                className={clsx(
                  'rounded-t-md px-1 py-0.5 font-medium hover:bg-zinc-200 dark:hover:bg-neutral-700 text-secondary',
                  {
                    'bg-zinc-200 dark:bg-neutral-700 !text-zinc-800 dark:!text-neutral-200':
                      activeTab === tab.id,
                  }
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.title}
              </button>
            </li>
          ))}
        </ul>

        <a
          className="underline"
          target="_blank"
          rel="noreferrer"
          href="https://degreat.co.uk/mangobase/guide/query.html"
        >
          Docs
        </a>
      </div>

      <div>{activeTab === 'code' && <CodeTab collection={collection} />}</div>
      <div>{activeTab === 'request' && <RequestsTab />}</div>
    </div>
  )
}

type Status = 'idle' | 'loading' | 'error' | 'success'

type ExportOptionsValues = Omit<ExportOptions, 'name' | 'schema' | 'getRef'>

function CodeTab({ collection }: Props) {
  const { handleSubmit, register, setValue, watch } =
    useForm<ExportOptionsValues>()
  const [status, setStatus] = React.useState<Status>('idle')

  const { name, schema } = collection

  const schemaClone = structuredClone(schema)

  Object.assign(schemaClone, { created_at: { required: true, type: 'string' } })
  Object.assign(schemaClone, { updated_at: { required: true, type: 'string' } })

  const $includeObjectFieldSchema = watch('includeObjectSchema')

  async function getCode(options: ExportOptionsValues) {
    setStatus('loading')

    const { definition, includes } = (await exportSchema({
      async getRef(ref) {
        return (await getSchema(ref)).schema
      },
      name,
      schema: schemaClone,
      ...options,
    })) as ExportResult

    const declarations = [
      definition,
      Object.values(includes).join('\n\n'),
    ].join('\n\n')

    // [ ]: Include export statements

    try {
      await navigator.clipboard?.writeText(declarations)
      setStatus('success')
    } catch (err) {
      setStatus('error')
    }

    setTimeout(() => {
      setStatus('idle')
    }, 2000)
  }

  React.useEffect(() => {
    if (!$includeObjectFieldSchema) {
      setValue('inlineObjectSchema', false)
    }
  }, [$includeObjectFieldSchema, setValue])

  return (
    <form className="px-1" onSubmit={handleSubmit(getCode)}>
      <p className="text-secondary mb-2">
        Export this collection's schema into a preferred language.
      </p>

      <label className="flex gap-4 items-center mb-4">
        Language
        <Select {...register('language', { required: true })}>
          <option value="typescript">Typescript</option>
        </Select>
      </label>

      <label className="mb-3">
        <Input
          className="me-2"
          type="checkbox"
          // {...register('includeExportStatements')}
        />
        <code>export</code> statements
      </label>

      <label className="flex gap-2 mb-3">
        <div>
          <Input type="checkbox" {...register('includeObjectSchema')} />
        </div>
        <div>
          <p>Object field schema</p>
          <p className="text-secondary text-sm">
            When enabled, the type definition for object fields will be included
          </p>
        </div>
      </label>

      <label>
        <Input
          className="me-2"
          type="checkbox"
          disabled={!$includeObjectFieldSchema}
          {...register('inlineObjectSchema')}
        />
        Inline object field schema
      </label>

      <footer className="mt-4">
        <Button variant="secondary" disabled={status === 'loading'}>
          {status === 'loading'
            ? 'Exporting...'
            : status === 'success'
            ? 'Copied'
            : 'Copy code'}
        </Button>
      </footer>
    </form>
  )
}

function RequestsTab() {
  return <div>[-]: Provide request templates</div>
}

export { DevDialog }
