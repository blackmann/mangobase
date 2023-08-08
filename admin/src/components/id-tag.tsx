import Chip from './chip'

interface Props {
  id: string
}

function IdTag({ id }: Props) {
  return <Chip>{id.substring(14)}</Chip>
}

export default IdTag
