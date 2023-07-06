import './extras.css'
import './index.css'
import { App } from './app.tsx'
import { render } from 'preact'

render(<App />, document.getElementById('app') as HTMLElement)
