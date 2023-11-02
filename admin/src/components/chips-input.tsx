import { Controller, ControllerProps } from 'react-hook-form'
import React from 'preact/compat'
import clsx from 'clsx'
import { slugify } from '../lib/slugify'

interface Value {
  id: string | number
  text: string
}

interface Props {
  className?: string
  onChange: (value: Value[]) => void
  placeholder?: string
  value: Value[]
}

const ChipsInput = React.forwardRef<HTMLDivElement, Props>(
  ({ className, onChange, placeholder = 'Enter text here', value }, ref) => {
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
      <div>
        <div
          className={clsx(
            'bg-zinc-200 bg-opacity-75 dark:bg-neutral-800 p-2 rounded-lg flex gap-2 flex-wrap focus:border-zinc-200',
            className
          )}
          tabIndex={0}
          ref={ref}
        >
          {value.map((it) => (
            <div
              className="inline-flex items-center bg-zinc-300 dark:bg-neutral-700 px-2 rounded-lg"
              key={it.id}
            >
              {it.text}
              <button
                className="ms-2 mt-1 material-symbols-rounded text-lg text-secondary"
                type="button"
                onClick={() =>
                  onChange(value.filter((it2) => it2.id !== it.id))
                }
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
        <small className="text-secondary ms-2 block">
          Use comma to separate values
        </small>
      </div>
    )
  }
)

ChipsInput.displayName = 'ChipsInput'

interface ControlledChipsInputProps
  extends Omit<Props, 'onChange' | 'value'>,
    Pick<ControllerProps, 'control' | 'name'> {
  defaultValue?: Value[]
}

const ControlledChipsInput = React.forwardRef<
  HTMLDivElement,
  ControlledChipsInputProps
>(({ name, control, ...props }) => (
  <Controller
    control={control}
    name={name}
    rules={{ validate: (value) => value?.length !== 0 }}
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
