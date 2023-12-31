import app from '../mangobase-app'
import dayjs from 'dayjs'
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

interface LogStat {
  _id: string
  date: string
  requests: number
}

const logs = signal<Log[]>([])
const logStats = signal<LogStat[]>([])

async function loadLogs() {
  const { data } = await app.req.get('_dev/logs?$sort[created_at]=-1')
  logs.value = data.data
}

function fillMissingHours(logs: LogStat[]) {
  const maxDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000 // 48 hours ago

  const now = Date.now()
  const res: LogStat[] = []
  let logsCursor = 0

  let currentTime = maxDaysAgo

  while (currentTime <= now) {
    const log = logs[logsCursor]

    if (dayjs(log.date).isSame(currentTime, 'hour')) {
      logsCursor++
      res.push(log)
    } else {
      const date = dayjs(currentTime).format('YYYY-MM-DDTHH:00:00')
      res.push({ _id: date, date, requests: 0 })
    }

    currentTime += 60 * 60 * 1000 // add an hour
  }

  return res
}

async function loadLogStats() {
  const { data } = await app.req.get('_dev/log-stats')
  logStats.value = fillMissingHours(data)
}

export default logs
export { loadLogs, logStats, loadLogStats }
export type { Log }
