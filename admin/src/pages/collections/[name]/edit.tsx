import {
  useNavigate,
  useRevalidator,
  useRouteLoaderData,
} from 'react-router-dom'
import Collection from '../../../client/collection'
import CollectionForm from '@/components/collection-form'
import type { CollectionRouteData } from '../../../routes'

function Component() {
  const { collection } = useRouteLoaderData('collection') as CollectionRouteData
  const revalidator = useRevalidator()

  const navigate = useNavigate()
  function goBack(collection?: Collection) {
    if (!collection) {
      navigate(-1)
      return
    }

    revalidator.revalidate()
    navigate(`/collections/${collection.name}`, { replace: true })
  }

  return (
    <CollectionForm
      collection={collection}
      key={collection.name}
      onHide={goBack}
    />
  )
}

export { Component }
