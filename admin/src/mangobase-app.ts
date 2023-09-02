import App from './client/app'

const app = new App(import.meta.env.VITE_API_URL || '/api')

export default app
