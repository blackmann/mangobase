import {
  LoaderFunctionArgs,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router-dom'
import AppError from '@/lib/app-error'
import Chip from '@/components/chip'
import Copy from '@/components/copy'
import { DevDialog } from '@/components/dev-dialog'
import { Popover } from '@/components/popover'
import { RouteData } from '.'
import app from '../../../mangobase-app'
import clsx from 'clsx'

function Component() {
  const { collection } = useLoaderData() as RouteData

  const links = [
    {
      href: '',
      title: 'Records',
    },
    {
      href: 'hooks',
      title: 'Hooks',
    },
    {
      href: `/logs/?label[$startswith]=/api/${collection.name}`,
      title: 'Logs',
    },
    {
      href: 'edit',
      title: 'Edit',
    },
  ]

  const path = `/api${collection.exposed ? '/' : '/_x/'}${collection.name}`
  const endpoint = `${window.location.protocol}//${window.location.host}${path}`

  return (
    <div className="h-screen flex flex-col">
      <header className="mt-2">
        <h1 className="m-0 text-xl font-bold">{collection.name}</h1>

        <div className="flex items-center">
          <Chip
            className="!px-1 !py-0 me-2"
            title="Only devs can access hidden collections"
          >
            {collection.exposed ? 'exposed' : 'hidden'}
          </Chip>

          <Chip className="!px-1 !py-0">
            <Copy className="text-sm" value={endpoint} />
            {path}
          </Chip>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <div>
            {links.map((link) => (
              <NavLink
                className={({ isActive }: { isActive: boolean }) =>
                  clsx('text-secondary me-2 hover:underline', {
                    'text-zinc-800 dark:!text-neutral-200 underline': isActive,
                  })
                }
                end
                key={link.href}
                to={link.href}
              >
                {link.title}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center">
            {/* <button
              className="material-symbols-rounded text-lg text-secondary hover:bg-zinc-200 dark:hover:bg-neutral-700 rounded-md size-8 inline-flex justify-center items-center"
              title="Refresh data"
            >
              refresh
            </button> */}

            <Popover
              trigger={
                <button
                  className="material-symbols-rounded text-lg text-secondary hover:bg-zinc-200 dark:hover:bg-neutral-700 rounded-md size-8 inline-flex justify-center items-center"
                  title="Dev Experience"
                >
                  data_object
                </button>
              }
            >
              <DevDialog collection={collection} />
            </Popover>
          </div>
        </div>
      </header>

      <div className="mt-3 flex-1 h-0 flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

const loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const collection = await app.collection(params.name!)
    return { collection }
  } catch (err) {
    throw new AppError((err as any).message || '', err)
  }
}

export { Component, loader }
