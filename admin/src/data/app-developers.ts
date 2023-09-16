import app from '../mangobase-app'
import { signal } from '@preact/signals'

interface User {
  _id: string
  fullname: string
  username: string
}

const appDevelopers = signal<User[]>([])

async function loadAppDevelopers() {
  const users = await app.collection('users')
  const { data } = await users.find({ role: 'dev' })

  appDevelopers.value = data
}

export default appDevelopers
export { loadAppDevelopers }
