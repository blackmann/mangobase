import { Compartment, EditorState, Extension, Prec } from '@codemirror/state'
import { EditorView, ViewUpdate, keymap, placeholder } from '@codemirror/view'
import {
  bracketMatching,
  defaultHighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language'
import Button from './button'
import React from 'preact/compat'
import { closeBrackets } from '@codemirror/autocomplete'
import clsx from 'clsx'
import { cmDark } from './cm-dark'
import { defaultKeymap } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { useColorScheme } from '@/lib/use-color-scheme'

interface Props {
  className?: string
  onSubmit?: (value: Record<string, any> | null) => void
  placeholder?: string
}

const light: Extension = [syntaxHighlighting(defaultHighlightStyle)]

function FilterInput({
  className,
  onSubmit,
  placeholder: placeholderText,
}: Props) {
  const parent = React.useRef<HTMLDivElement>(null)
  const theme = React.useMemo(() => new Compartment(), [])
  const view = React.useRef<EditorView>()
  const scheme = useColorScheme()

  const [value, setValue] = React.useState('')

  function handleClear() {
    if (view.current) {
      const transaction = view.current.state.update({
        changes: { from: 0, insert: '', to: view.current.state.doc.length },
      })
      view.current.dispatch(transaction)
    }

    onSubmit?.(null)
  }

  React.useEffect(() => {
    view.current = new EditorView({
      parent: parent.current!,
      state: EditorState.create({
        doc: '',
        extensions: [
          keymap.of(defaultKeymap),
          Prec.high(
            keymap.of([
              {
                key: 'Enter',
                run(view) {
                  const query = parseQuery(view.state.doc.toString())

                  onSubmit?.(query)
                  return true
                },
              },
            ])
          ),
          json(),
          bracketMatching(),
          closeBrackets(),
          EditorView.lineWrapping,
          placeholder(placeholderText ?? '{name: "John", age: {$gt: 4}}'),
          theme.of(light),
          EditorView.updateListener.of((update: ViewUpdate) => {
            if (update.docChanged) {
              const newState = update.state.doc.toString()
              setValue(newState)
            }
          }),
        ],
      }),
    })

    return () => view.current?.destroy()
  }, [onSubmit, placeholderText, theme, view])

  React.useEffect(() => {
    view.current?.dispatch({
      effects: theme.reconfigure(scheme === 'dark' ? cmDark : light),
    })
  }, [scheme, theme, view])

  const hasValue = value.trim().length > 0

  return (
    <div
      className={clsx(
        'border border-zinc-300 dark:border-neutral-600 rounded-lg px-1 outline-none bg-zinc-200 dark:bg-neutral-700 focus-within:border-zinc-400 dark:focus-within:border-neutral-500 placeholder:text-zinc-400 placeholder:dark:text-neutral-400 focus:ring-0 disabled:opacity-70 flex gap-2 items-center',
        className
      )}
    >
      <div>
        <span className="material-symbols-rounded text-secondary text-lg">
          search
        </span>
      </div>

      <div className="flex-1" ref={parent} />

      <div
        className={clsx(
          'flex items-center gap-2 opacity-0 transition-opacity duration-200',
          {
            'opacity-100': hasValue,
          }
        )}
      >
        <div className="text-secondary">↵ to search</div>
        <Button className="!py-0" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  )
}

function parseQuery(query: string) {
  if (!/^\{.*:.*\}$/.test(query)) {
    return null
  }
  const evalQuery = new Function(`return ${query}`)() as Record<string, any>

  return JSON.parse(JSON.stringify(evalQuery))
}

export default FilterInput
