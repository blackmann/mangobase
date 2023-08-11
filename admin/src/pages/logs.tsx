import { cleanDate, cleanTime } from '../lib/clean-date'
import logs, { loadLogs } from '../data/logs'
import Chip from '../components/chip'
import React from 'preact/compat'
import clsx from 'clsx'
import styles from './logs.module.css'

function Logs() {
  React.useEffect(() => {
    loadLogs()
  }, [])

  return (
    <div className={clsx('container-fluid', styles.page)}>
      <h1 className="mt-2">Logs</h1>
      <div>
        <input
          className="d-block w-100"
          type="search"
          name="filter"
          id="filter"
          placeholder="Filter logs"
        />
      </div>

      <div className={clsx('flex-fill', styles.data)}>
        <table className="w-100">
          <thead>
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
              <tr key={log._id}>
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
