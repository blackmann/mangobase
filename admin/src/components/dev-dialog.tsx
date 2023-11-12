import Button from './button'
import Collection from '@/client/collection'
import Input from './input'
import React from 'preact/compat'
import Select from './select'
import clsx from 'clsx'
// import { exportSchema } from 'mangobase'
import { useForm } from 'react-hook-form'

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
    </div>
  )
}

type Status = 'idle' | 'loading' | 'error' | 'success'

function CodeTab({ collection }: Props) {
  const { register, setValue, watch } = useForm()
  const [status, setStatus] = React.useState<Status>('idle')

  const $includeObjectFieldSchema = watch('includeObjectFieldSchema')

  async function getCode() {
    setStatus('loading')

    // const {} = await exportSchema({
    //   async getRef() {
    //     return {}
    //   },
    //   language: 'typescript',
    //   name: collection.name,
    //   schema: collection.schema,
    // })

    console.log('getref', collection)
  }

  React.useEffect(() => {
    if (!$includeObjectFieldSchema) {
      setValue('inlineObjectFieldSchema', false)
    }
  }, [$includeObjectFieldSchema, setValue])

  return (
    <div className="px-1">
      <p className="text-secondary mb-2">
        Export this collection's schema into a preferred language.
      </p>

      <label className="flex gap-4 items-center mb-4">
        Language
        <Select>
          <option value="typescript">Typescript</option>
        </Select>
      </label>

      <label className="mb-3">
        <Input
          className="me-2"
          type="checkbox"
          {...register('includeExportStatements')}
        />
        <code>export</code> statements
      </label>

      <label className="flex gap-2 mb-3">
        <div>
          <Input type="checkbox" {...register('includeObjectFieldSchema')} />
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
          {...register('inlineObjectFieldSchema')}
        />
        Inline object field schema
      </label>

      <footer className="mt-4">
        <Button
          onClick={getCode}
          variant="secondary"
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? 'Exporting...'
            : status === 'success'
            ? 'Copied'
            : 'Copy code'}
        </Button>
      </footer>
    </div>
  )
}

export { DevDialog }
