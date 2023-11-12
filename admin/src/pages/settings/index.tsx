import schemaRefs, { loadSchemaRefs } from '../../data/schema-refs'
import NavContentLayout from '../../layouts/NavContentLayout'
import NavLinks from '@/components/nav-links'
import { Outlet } from 'react-router-dom'
import React from 'preact/compat'

function Settings() {
  const links = React.useMemo(
    () => [
      {
        leading: (
          <span className="material-symbols-rounded leading-none me-2 text-sm">
            supervised_user_circle
          </span>
        ),
        path: 'devs',
        title: 'Devs',
      },
      {
        children: schemaRefs.value.map((ref) => ({
          path: `schemas/${ref.name}`,
          title: ref.name,
        })),
        leading: (
          <span className="material-symbols-rounded leading-none me-2 text-sm">
            code_blocks
          </span>
        ),
        path: 'schemas',
        title: 'Validation Schemas',
      },
      {
        leading: (
          <span className="material-symbols-rounded leading-none me-2 text-sm">
            face_4
          </span>
        ),
        path: 'profile',
        title: 'Profile',
      },
    ],
    [schemaRefs.value]
  )

  React.useEffect(() => {
    loadSchemaRefs()
  }, [])

  return (
    <NavContentLayout
      nav={
        <>
          <header className="text-base font-bold mb-2">Configurations</header>

          <NavLinks links={links} />
        </>
      }
    >
      <Outlet />
    </NavContentLayout>
  )
}

export default Settings
