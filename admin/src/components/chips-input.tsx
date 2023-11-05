import { Controller, ControllerProps } from 'react-hook-form'
import React from 'preact/compat'
import clsx from 'clsx'
import { slugify } from '../lib/slugify'

interface Value {
  id: string | number
  text: string
  [key: string]: any
}

interface Props {
  className?: string
  onChange: (value: Value[]) => void
  placeholder?: string
  value: Value[]
  helperText?: React.ReactNode
  getAction?: (value: Value, index: number) => React.ReactNode
}

const ChipsInput = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      className,
      getAction,
      helperText,
      onChange,
      placeholder = 'Enter text here',
      value,
    },
    ref
  ) => {
    const [text, setText] = React.useState('')

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Enter': {
          splitAndAdd(true)
          event.preventDefault()
          break
        }

        case 'Backspace': {
          if (text) {
            return
          }

          onChange(value.slice(0, -1))
          break
        }
      }
    }

    function splitAndAdd(skipCommaCheck = false) {
      if (!skipCommaCheck && !text.includes(',')) {
        return
      }

      const values: Value[] = []

      const possibleEntries = text.split(',')
      for (const entry of possibleEntries) {
        const trimmed = entry.trim()
        if (!trimmed) {
          continue
        }

        values.push({
          id: slugify(trimmed, true),
          text: trimmed,
        })
      }

      if (values.length === 0) {
        return
      }

      onChange([...value, ...values])
      setText('')
    }

    React.useEffect(splitAndAdd, [onChange, text, value])

    return (
      <div className="group">
        <div
          className={clsx(
            'bg-zinc-200 bg-opacity-75 dark:bg-neutral-700 dark:bg-opacity-60 p-1.5 rounded-lg flex gap-2 flex-wrap border border-transparent focus-within:border-zinc-300 dark:focus-within:border-neutral-600 min-h-[2.20rem]',
            className
          )}
          tabIndex={0}
          ref={ref}
        >
          {value.map((it, index) => (
            <div
              className="inline-flex items-center bg-zinc-300 dark:bg-neutral-700 px-2 rounded-lg gap-2"
              key={it.id}
            >
              {it.text}

              {getAction?.(it, index)}

              <button
                className="material-symbols-rounded text-lg text-secondary leading-none"
                type="button"
                onClick={() => {
                  onChange(value.filter((it2) => it2.id !== it.id))
                }}
              >
                close
              </button>
            </div>
          ))}

          <input
            className="bg-transparent p-0 ring-0 border-0 focus:ring-0"
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            onChange={(e) => setText((e.target as HTMLInputElement).value)}
            value={text}
          />
        </div>
        <div className="text-secondary ms-2 block text-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
          Use comma to separate values. {helperText}
        </div>
      </div>
    )
  }
)

ChipsInput.displayName = 'ChipsInput'

interface ControlledChipsInputProps
  extends Omit<Props, 'onChange' | 'value'>,
    Pick<ControllerProps, 'control' | 'name'> {}

const ControlledChipsInput = React.forwardRef<
  HTMLDivElement,
  ControlledChipsInputProps
>(({ name, control, ...props }) => (
  <Controller
    control={control}
    name={name}
    rules={{
      validate: (v) => !!v?.length,
    }}
    render={({ field: { onChange, value, ref } }) => (
      <ChipsInput
        onChange={onChange}
        ref={ref}
        value={value || []}
        {...props}
      />
    )}
  />
))

ControlledChipsInput.displayName = 'ControlledChipsInput'

export { ChipsInput, ControlledChipsInput }
export type { Value }
