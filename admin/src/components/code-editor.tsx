import { Editor, EditorProps } from '@monaco-editor/react'
import React from 'preact/compat'

function CodeEditor(props: EditorProps) {
  const [editor, setEditor] = React.useState<any>(null)

  React.useEffect(() => {
    if (!editor) {
      return
    }

    function onThemeChange(e: MediaQueryListEvent) {
      console.log('matches?', e.matches)
      if (e.matches) {
        editor.updateOptions({ theme: 'vs-dark' })
        return
      }

      editor.updateOptions({ theme: 'vs' })
    }

    const MEDIA = '(prefers-color-scheme: dark)'
    const matchDark = window.matchMedia(MEDIA)

    if (matchDark.matches) {
      editor.updateOptions({ theme: 'vs-dark' })
    }

    matchDark.addEventListener('change', onThemeChange)

    return () => {
      window.matchMedia(MEDIA).removeEventListener('change', onThemeChange)
    }
  }, [editor])

  return <Editor onMount={(editor: any) => setEditor(editor)} {...props} />
}

export default CodeEditor
