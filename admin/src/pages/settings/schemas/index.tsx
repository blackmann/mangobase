import Button from '../../../components/button'
import { useNavigate } from 'react-router-dom'

function Schemas() {
  const navigate = useNavigate()

  function addNew() {
    navigate('/settings/schemas/new')
  }
  return (
    <div className="flex flex-col items-center mt-[20vh]">
      <div className="text-slate-500 dark:text-neutral-400 max-w-[20rem]">
        <span className="text-slate-400 dark:text-neutral-500 material-symbols-rounded">
          reply
        </span>
        <p>
          Expand Validations Schema and select a schema name to view or edit.
        </p>

        <div className="mt-2">
          <Button onClick={addNew} variant="primary">
            Add new
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Schemas
