#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import meow from 'meow'
import App from './app.js'

meow(
	`
	Usage
	  $ create-mango

	Examples
	  $ create-mango awesome-app
`,
	{
		importMeta: import.meta,
		booleanDefault: undefined,
	}
)

render(<App />)
