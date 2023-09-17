import Chip from './chip'
import Copy from './copy'

interface Props {
  id: string
}

function IdTag({ id }: Props) {
  if (!id) return null
  return (
    <Chip>
      {id.substring(14)}
      <Copy className="text-sm ms-1" value={id} />
    </Chip>
  )
}

export default IdTag
