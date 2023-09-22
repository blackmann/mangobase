import { cleanDate, cleanTime } from '../lib/clean-date'

interface Props {
  date: Date
}

function CleanDate({ date }: Props) {
  return (
    <div>
      <div>{cleanDate(date)}</div>
      <div className="text-zinc-500 dark:text-neutral-400 text-sm">
        {cleanTime(date)}
      </div>
    </div>
  )
}

export default CleanDate
