#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import meow from 'meow'
import App from './app.js'

const cli = meow(
	`
	Usage
	  $ create-mango

	Options
		--javascript, -j Use Javascript instead of Typescript (default)

	Examples
	  $ create-mango awesome-app
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
			javascript: {
				alias: 'j',
				type: 'boolean',
			},
		},
		booleanDefault: undefined
	}
)

render(<App destination={cli.input[0]} flags={cli.flags} />)
