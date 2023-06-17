import { render } from 'preact'
import { App } from './app.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

function Wrapped() {
  return (
    <BrowserRouter basename="/_">
      <App />
    </BrowserRouter>
  )
}

render(<Wrapped />, document.getElementById('app') as HTMLElement)
