import Chip from './chip'

interface Props {
  id: string
}

function IdTag({ id }: Props) {
  if (!id) return null
  return <Chip>{id.substring(14)}</Chip>
}

export default IdTag
