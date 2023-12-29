import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import {
  bracketMatching,
  defaultHighlightStyle,
  syntaxHighlighting,
} from '@codemirror/language'
import { defaultKeymap, history } from '@codemirror/commands'
import Button from './button'
import React from 'preact/compat'
import { closeBrackets } from '@codemirror/autocomplete'
import clsx from 'clsx'
import { json } from '@codemirror/lang-json'

interface Props {
  className?: string
}

function FilterInput({ className }: Props) {
  const parent = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const theme = new Compartment()
    //
    const view = new EditorView({
      parent: parent.current!,
      state: EditorState.create({
        doc: '{}',
        extensions: [
          keymap.of(defaultKeymap),
          json(),
          bracketMatching(),
          closeBrackets(),
          syntaxHighlighting(defaultHighlightStyle),
        ],
      }),
    })

    return () => view.destroy()
  }, [])

  return (
    <div
      className={clsx(
        'border border-zinc-300 dark:border-neutral-600 rounded-md p-1 outline-none bg-zinc-200 dark:bg-neutral-700 focus-within:border-zinc-400 dark:focus-within:border-neutral-500 placeholder:text-zinc-400 placeholder:dark:text-neutral-400 focus:ring-0 disabled:opacity-70 flex',
        className
      )}
    >
      <div className="flex-1" ref={parent} />

      <div className="flex items-center gap-2">
        <div className="text-secondary">↵ to search</div>
        <Button>Clear</Button>
      </div>
    </div>
  )
}

export default FilterInput
