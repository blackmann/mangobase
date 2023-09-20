import schemaRefs, { loadSchemaRefs } from '../../data/schema-refs'
import NavContentLayout from '../../layouts/NavContentLayout'
import NavLinks from '../../components/nav-links'
import { Outlet } from 'react-router-dom'
import React from 'preact/compat'

function Settings() {
  const links = React.useMemo(
    () => [
      {
        path: 'devs',
        title: 'Devs',
      },
      {
        children: schemaRefs.value.map((ref) => ({
          path: `schemas/${ref.name}`,
          title: ref.name,
        })),
        path: 'schemas',
        title: 'Validation Schemas',
      },
      {
        path: 'profile',
        title: 'Profile',
      },
    ],
    [schemaRefs.value]
  )

  React.useEffect(() => {
    console.log('loading schemas')
    loadSchemaRefs()
  }, [])

  return (
    <NavContentLayout
      nav={
        <>
          <header className="text-base font-bold">Settings</header>

          <NavLinks links={links} />
        </>
      }
    >
      <Outlet />
    </NavContentLayout>
  )
}

export default Settings
