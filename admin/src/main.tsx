import { render } from 'preact'
import { App } from './app.tsx'
import './index.css'
import './extras.css'

render(<App />, document.getElementById('app') as HTMLElement)
