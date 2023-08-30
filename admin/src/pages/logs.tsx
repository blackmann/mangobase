import { cleanDate, cleanTime } from '../lib/clean-date'
import logs, { loadLogs } from '../data/logs'
import Chip from '../components/chip'
import Input from '../components/input'
import React from 'preact/compat'

function Logs() {
  React.useEffect(() => {
    loadLogs()
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <h1 className="mt-4 text-2xl">Logs</h1>
      <Input
        className="block w-full mt-4"
        type="search"
        name="filter"
        id="filter"
        placeholder="Filter logs"
      />

      <div className="flex-1 h-0 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-100 dark:bg-neutral-800">
            <tr>
              <th>Category</th>
              <th>Label</th>
              <th>Status</th>
              <th>Data</th>
              <th>Time</th>
              <th>Created at</th>
            </tr>
          </thead>

          <tbody>
            {logs.value.map((log) => (
              <tr
                className="hover:bg-slate-200 dark:hover:bg-neutral-700 transition-background duration-150"
                key={log._id}
              >
                <td>
                  <Chip>{log.category}</Chip>
                </td>
                <td>{log.label}</td>
                <td>{log.status}</td>
                <td>{log.data && JSON.stringify(log.data)}</td>
                <td>{typeof log.time === 'number' ? `${log.time}ms` : ''}</td>
                <td>
                  <div>{cleanDate(log.created_at)}</div>
                  <div className="text-secondary">
                    {cleanTime(log.created_at)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Logs
