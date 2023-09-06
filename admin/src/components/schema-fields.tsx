import {
  Control,
  Controller,
  FieldValues,
  UseFormRegister,
} from 'react-hook-form'
import CodeEditor from './code-editor'
import Input from './input'
import type { SchemaDefinitions } from 'mangobase'
import clsx from 'clsx'

interface Props {
  schema: SchemaDefinitions
  register: UseFormRegister<FieldValues>
  control: Control
}

const EDITOR_OPTIONS = {
  acceptSuggestionOnEnter: 'off',
  codeLens: false,
  contextmenu: false,
  foldingHighlight: false,
  fontFamily: 'Zed Mono',
  fontLigatures: true,
  fontSize: 14,
  hover: {
    enabled: false,
  },
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 2,
  minimap: { enabled: false },
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  parameterHints: {
    enabled: false,
  },
  quickSuggestions: {
    comments: false,
    other: false,
    strings: false,
  },
  renderLineHighlight: 'none',
  scrollbar: {
    horizontalSliderSize: 5,
    verticalSliderSize: 5,
  },
  suggestOnTriggerCharacters: false,
  tabCompletion: 'off',
  wordBasedSuggestions: false,
} as const

function SchemaFields({ control, register, schema }: Props) {
  return (
    <div>
      {Object.entries(schema).map(([name, definition]) => {
        const singleColumn =
          definition.type === 'string' && definition.treatAs === 'code'
        const labelText = <span className="col-span-1">{name}</span>

        return (
          <label
            className={clsx('grid gap-4 [&+&]:mt-2 grid-cols-3', {
              'gap-0': singleColumn,
              'grid-cols-1': singleColumn,
            })}
            key={name}
          >
            {labelText}
            {(() => {
              // iife
              switch (definition.type) {
                case 'string': {
                  if (definition.treatAs === 'code') {
                    return (
                      <div className="cols-span-1 nodrag">
                        <Controller
                          control={control}
                          name={name}
                          render={({ field: { onChange, value } }) => (
                            <CodeEditor
                              className="rounded-md bg-slate-100 border border-slate-300 dark:border-neutral-600 overflow-hidden"
                              language="javascript"
                              defaultValue={value || definition.defaultValue}
                              height="14rem"
                              onChange={onChange}
                              options={EDITOR_OPTIONS}
                            />
                          )}
                        />
                      </div>
                    )
                  }

                  return (
                    <Input
                      className="col-span-2"
                      defaultValue={definition.defaultValue}
                      type="string"
                      {...register(name, { required: definition.required })}
                    />
                  )
                }

                case 'number': {
                  return (
                    <Input
                      className="w-16 col-span-2"
                      defaultValue={definition.defaultValue?.toString()}
                      type="number"
                      {...register(name, {
                        required: definition.required,
                        valueAsNumber: true,
                      })}
                    />
                  )
                }

                case 'boolean': {
                  return (
                    <Input
                      className="mt-2 col-span-2"
                      defaultChecked={definition.defaultValue}
                      type="checkbox"
                      {...register(name, { required: definition.required })}
                    />
                  )
                }

                default: {
                  return null
                }
              }
            })()}
          </label>
        )
      })}
    </div>
  )
}

export default SchemaFields
