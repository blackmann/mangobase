import './index.css'
import './extras.css'
import { App } from './app.tsx'
import { render } from 'preact'

render(<App />, document.getElementById('app') as HTMLElement)
