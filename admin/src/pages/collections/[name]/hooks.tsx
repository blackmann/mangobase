import React from 'preact/compat'
import { useForm } from 'react-hook-form'
import hooksRegistery, { loadHooksRegistry } from '../../../data/hooks-registry'
import { useRouteLoaderData } from 'react-router-dom'
import type Collection from '../../../client/collection'
import {
  HooksConfig,
  Method,
  Stage,
  hookStages,
  methods,
} from '../../../client/collection'

type RouteData = { collection: Collection }

function CollectionHooks() {
  const { collection } = useRouteLoaderData('collection') as RouteData

  const { getValues, handleSubmit, register, watch } = useForm({
    defaultValues: {
      stage: 'before',
      method: 'find',
      hook: '__none',
    },
  })

  const [config, setConfig] = React.useState<HooksConfig>({
    before: {},
    after: {},
  })

  function addHook() {
    const { stage, method, hook } = getValues()
    const stage_ = stage as Stage
    const method_ = method as Method

    setConfig((config) => {
      let existing = config[stage_][method_] || []
      if (existing.find((e) => e[0] === hook)) {
        return config
      }

      config[stage_][method_] = [...existing, [hook]]

      return { ...config }
    })
  }

  async function save() {
    await collection.setHooks(config)
  }

  React.useEffect(() => {
    loadHooksRegistry()
    collection.hooks().then((hooks) => setConfig(hooks))
  }, [])

  const $stage = watch('stage')
  const $method = watch('method')

  const hooks = config[$stage as Stage][$method as Method] || []

  return (
    <form onSubmit={handleSubmit(save)}>
      <fieldset>
        <legend>Stage</legend>
        {hookStages.map((stage) => (
          <label key={stage}>
            <input type="radio" value={stage} {...register('stage')} />
            {stage}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Method</legend>
        {methods.map((method) => (
          <label key={method}>
            <input type="radio" value={method} {...register('method')} />
            {method}
          </label>
        ))}
      </fieldset>

      <p>Hooks are ran in the order which you add them</p>

      <ul>
        {hooksRegistery.value
          .filter((hook) => hooks.find((h) => h[0] === hook.id))
          .map((hook) => (
            <li key={hook.id}>
              {hook.name}: {hook.description}
            </li>
          ))}
      </ul>

      <div>
        <select {...register('hook')}>
          <option value="__none" disabled>
            Select hook
          </option>
          {hooksRegistery.value.map((hook) => (
            <option key={hook.id} value={hook.id}>
              {hook.name} <br />
              {hook.description}
            </option>
          ))}
        </select>

        <button onClick={addHook} type="button">
          Add hook
        </button>
      </div>

      <button onClick={save}>Save</button>
    </form>
  )
}

export default CollectionHooks
