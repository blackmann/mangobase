import { useNavigate, useRouteLoaderData } from 'react-router-dom'
import CollectionForm from '../../../components/collection-form'
import { CollectionRouteData } from '../../../routes'

function Edit() {
  const { collection } = useRouteLoaderData('collection') as CollectionRouteData

  const navigate = useNavigate()
  function goBack() {
    navigate(-1)
  }

  return <CollectionForm collection={collection} onHide={goBack} />
}

export default Edit
