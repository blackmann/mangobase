import { cleanDate, cleanTime } from '../lib/clean-date'

interface Props {
  date: Date
}

function CleanDate({ date }: Props) {
  return (
    <div>
      <div>{cleanDate(date)}</div>
      <small className="text-secondary">{cleanTime(date)}</small>
    </div>
  )
}

export default CleanDate
