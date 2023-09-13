import AppError from '../lib/app-error'
import { Link } from 'react-router-dom'
import { useRouteError } from 'react-router-dom'

interface Props {
  error: AppError
}

function GeneralErrorBoundary({ error }: Props) {
  console.error(error)

  return (
    <div className="flex justify-center">
      <div className="bg-white dark:bg-neutral-800 p-3 rounded-md mt-[5rem] border-slate-200 dark:border-neutral-600 border w-[30rem]">
        {error.data.status ? (
          <ResponseError error={error} />
        ) : (
          <UnknownErrorContent />
        )}

        <footer className="mt-3">🥭</footer>
      </div>
    </div>
  )
}

function ResponseError({ error }: Props) {
  return (
    <>
      <div>
        <span className="material-symbols-rounded text-purple-600">
          release_alert
        </span>
      </div>
      <h1 className="text-lg font-bold mt-3">An API error occurred</h1>
      <p className="text-slate-500 dark:text-neutral-600">
        Status code: {error.data.status}
      </p>

      {error.data.status === 401 && (
        <div>
          <p>
            You may need to login again. If you think this is a mistake, check{' '}
            <a
              href="https://github.com/blackmann/mangobase/issues"
              className="underline"
            >
              our issues
            </a>{' '}
            or raise one.{' '}
          </p>

          <div className="mt-3">
            <Link
              className="bg-slate-500 text-white px-2 py-1 rounded-md inline-block"
              variant="primary"
              to="/login"
              replace
            >
              Login
            </Link>
          </div>
        </div>
      )}

      {error.data.status !== 401 && (
        <div>
          This error is unexpected. Check the console logs to get an idea of
          what could be happening.
        </div>
      )}
    </>
  )
}

function UnknownErrorContent() {
  const error = useRouteError() as Error

  return (
    <>
      <div>
        <span className="material-symbols-rounded text-red-500">
          release_alert
        </span>
      </div>
      <h1 className="text-lg font-bold mt-3">An error occurred</h1>
      <p className="text-slate-500 dark:text-neutral-400">
        The app encountered an error it could not handle
      </p>

      <h2 className="mt-3 font-bold">Message</h2>
      <p className="text-slate-500 dark:text-neutral-400">{error.message}</p>

      <h2 className="font-bold  mt-3">Stacktrace</h2>
      <div className="text-slate-500 dark:text-neutral-400">
        Check stacktrace from the browser's developer Console. If you think this
        is unexpected, please check{' '}
        <a
          href="https://github.com/blackmann/mangobase/issues"
          className="underline"
        >
          our issues
        </a>{' '}
        or raise one.
      </div>
    </>
  )
}

function LoaderErrorBoundary() {
  const error = useRouteError() as AppError

  return <GeneralErrorBoundary error={error} />
}

export { LoaderErrorBoundary, GeneralErrorBoundary }
