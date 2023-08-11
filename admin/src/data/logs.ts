import app from '../mangobase-app'
import { signal } from '@preact/signals'

interface Log {
  _id: string
  category: string
  created_at: string
  data: any
  label: string
  status: number
  time: number
}

const logs = signal<Log[]>([])

async function loadLogs() {
  const { data } = await app.req.get('_dev/logs?$sort[created_at]=-1')
  logs.value = data.data
}

export default logs
export { loadLogs }
