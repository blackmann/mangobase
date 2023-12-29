import React from 'preact/compat'

type ColorScheme = 'light' | 'dark'

function useColorScheme() {
  const [scheme, setScheme] = React.useState<ColorScheme>('light')

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    if (mediaQuery.matches) {
      setScheme('dark')
    }

    const listener = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setScheme('dark')
      } else {
        setScheme('light')
      }
    }

    mediaQuery.addEventListener('change', listener)

    return () => {
      mediaQuery.removeEventListener('change', listener)
    }
  }, [])

  return scheme
}

export { useColorScheme }
