import { FieldValues, useForm } from 'react-hook-form'
import AVATAR_COLORS from '../lib/avatar-colors'
import Avatar from 'boring-avatars'
import Button from '../components/button'
import Input from '../components/input'
import React from 'preact/compat'
import RequestStatus from '../lib/request-status'
import app from '../mangobase-app'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { handleSubmit, register, watch } = useForm()
  const [username, setUsername] = React.useState('')
  const [isNewEnv, setIsNewEnv] = React.useState(false)
  const [status, setStatus] = React.useState<RequestStatus>('idle')

  const navigate = useNavigate()

  const nameChangeTime = React.useRef<ReturnType<typeof setTimeout>>()

  async function login(form: FieldValues) {
    setStatus('in-progress')
    try {
      if (isNewEnv) {
        await app.req.post('users', {
          ...form,
          fullname: form.username,
          role: 'dev',
        })
      }

      const { data } = await app.req.post('login', { ...form })
      app.set('auth', data)

      navigate('/collections', { replace: true })
    } catch (err) {
      setStatus('failed')
    }
  }

  const $username = watch('username')
  React.useEffect(() => {
    clearTimeout(nameChangeTime.current)
    nameChangeTime.current = setTimeout(() => {
      setUsername($username)
    }, 1000)
  }, [$username])

  React.useEffect(() => {
    app.req.get('_dev/dev-setup').then((res) => setIsNewEnv(!res.data))
  }, [])

  return (
    <div className="container py-5 mx-auto">
      <div className="flex flex-col items-center mt-[10%]">
        <form
          className="w-[16rem] max-w-[24rem]"
          onSubmit={handleSubmit(login)}
        >
          <div className="flex flex-col items-center">
            <Avatar
              variant="beam"
              colors={AVATAR_COLORS}
              name={username || ''}
            />
            <fieldset className="mt-3 w-full flex flex-col items-center">
              {isNewEnv && (
                <>
                  <p className=" text-center text-slate-500 dark:text-neutral-400 mb-4">
                    Sweet Mango 🥭
                    <br />
                    Be the first dev.
                  </p>
                  <Input
                    type="email"
                    placeholder="email"
                    className="block w-full mb-2"
                    {...register('email', { required: true })}
                  />
                </>
              )}

              <Input
                type="text"
                placeholder="username"
                className="block w-full mb-2"
                {...register('username', { required: true })}
              />

              <Input
                type="password"
                placeholder="password"
                className="block w-full mb-2"
                {...register('password', { required: true })}
              />

              <div>
                <Button variant="primary" disabled={status === 'in-progress'}>
                  {status === 'in-progress' ? 'Please wait…' : 'Continue'}
                </Button>
              </div>
            </fieldset>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
