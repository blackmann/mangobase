import { cleanDate, cleanTime } from '@/lib/clean-date'

interface Props {
  date: Date
}

function CleanDate({ date }: Props) {
  return (
    <div>
      <div>{cleanDate(date)}</div>
      <div className="text-secondary text-sm">
        {cleanTime(date)}
      </div>
    </div>
  )
}

export default CleanDate
