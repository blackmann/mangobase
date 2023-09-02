import logs, { loadLogStats, loadLogs, logStats } from '../data/logs'
import BarChart from '../components/chart'
import Chip from '../components/chip'
import CleanDate from '../components/date'
import Input from '../components/input'
import React from 'preact/compat'

function Logs() {
  React.useEffect(() => {
    loadLogs()
    loadLogStats()
  }, [])

  return (
    <div className="flex flex-col h-screen me-2">
      <h1 className="mt-4 text-2xl">Logs</h1>
      <Input
        className="block w-full mt-4"
        type="search"
        name="filter"
        id="filter"
        placeholder="Filter logs"
      />

      <div className="relative h-[150px] w-[94vw] mt-3">
        <BarChart
          data={logStats.value.map((value) => ({
            x: new Date(value._id).getHours().toString(),
            y: value.requests,
          }))}
        />
      </div>

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
                <td className="max-w-[14rem] text-slate-500 dark:text-neutral-400">
                  {log.data && JSON.stringify(log.data)}
                </td>
                <td>{typeof log.time === 'number' ? `${log.time}ms` : ''}</td>
                <td>
                  <CleanDate date={new Date(log.created_at)} />
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
