import logs, { Log, loadLogStats, loadLogs, logStats } from '@/data/logs'
import BarChart from '@/components/chart'
import Chip from '@/components/chip'
import CleanDate from '@/components/date'
import FilterInput from '@/components/filter-input'
import React from 'preact/compat'

function Component() {
  React.useEffect(() => {
    loadLogs()
    loadLogStats()
  }, [])

  return (
    <div className="flex flex-col h-screen me-2">
      <h1 className="mt-4 text-2xl">Logs</h1>
      <FilterInput placeholder="{status: 400, created_at: {$gt: 170000000}}" />

      <div className="relative h-[150px] w-[94vw] mt-3">
        <BarChart
          data={logStats.value.map((value) => ({
            x: new Date(value._id).getHours().toString(),
            y: value.requests,
          }))}
        />
      </div>

      <div className="flex-1 h-0 overflow-y-auto">
        <table className="w-full max-w-full">
          <thead className="sticky top-0 bg-zinc-100 dark:bg-neutral-800">
            <tr>
              <th>Date</th>
              <th className="max-w-[7rem]">Category</th>
              <th>Label</th>
              <th className="max-w-[7rem]">Status</th>
              <th className="max-w-[7rem]">Time</th>
            </tr>
          </thead>

          <tbody>
            {logs.value.map((log) => (
              <tr
                className="hover:bg-zinc-200 dark:hover:bg-neutral-700 transition-background duration-150 align-top *:pt-2"
                key={log._id}
              >
                <td className="max-w-[7rem] w-[7rem]">
                  <CleanDate date={new Date(log.created_at)} />
                </td>
                <td className="max-w-[4rem] w-[4rem]">
                  <Chip>{log.category}</Chip>
                </td>
                <td>
                  <LogContent log={log} />
                </td>
                <td className="max-w-[3rem] w-[3rem]">
                  <Status status={log.status} />
                </td>
                <td className="max-w-[3rem] w-[3rem]">
                  {typeof log.time === 'number' ? `${log.time}ms` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface StatusProps {
  status: number
}

function Status({ status }: StatusProps) {
  if (status >= 200 && status < 400) {
    return <>{status}</>
  }

  if (status >= 400 && status < 500) {
    return (
      <div className="flex gap-2 items-center">
        {status}
        <span className="block size-2 rounded-full bg-yellow-500" />
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center">
      {status}
      <span className="block size-2 rounded-full bg-red-500" />
    </div>
  )
}

interface LogContentProps {
  log: Log
}

function LogContent({ log }: LogContentProps) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div>
      <div className="flex gap-2 items-center">
        {log.label}{' '}
        {log.data && (
          <button
            className="text-pink-700 bg-pink-500 bg-opacity-20 dark:bg-pink-700 dark:bg-opacity-20 dark:text-pink-400 rounded-lg px-2 font-medium inline-flex items-center gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            data{' '}
            <span className="material-symbols-rounded text-lg">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        )}
      </div>

      {expanded && (
        <pre className="text-sm text-neutral-500 dark:text-neutral-400 font-['IBM_Plex_Mono']">
          {JSON.stringify(log.data, null, 2)}
        </pre>
      )}
    </div>
  )
}

export { Component }
