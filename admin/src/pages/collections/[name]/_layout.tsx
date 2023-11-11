import {
  LoaderFunctionArgs,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router-dom'
import AppError from '@/lib/app-error'
import Chip from '@/components/chip'
import Copy from '@/components/copy'
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

        <div className="mt-2 flex justify-between">
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
            <Popover
              trigger={
                <button className="material-symbols-rounded text-lg me-2 text-secondary hover:bg-zinc-200 rounded-md px-0.5">
                  data_object
                </button>
              }
            >
              <div>Hello world</div>
            </Popover>

            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://degreat.co.uk/mangobase/guide/query.html"
            >
              Docs
            </a>
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
