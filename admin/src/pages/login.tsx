import { FieldValues, useForm } from 'react-hook-form'
import AVATAR_COLORS from '../lib/avatar-colors'
import Avatar from 'boring-avatars'
import React from 'preact/compat'
import styles from './login.module.css'

function Login() {
  const { handleSubmit, register, watch } = useForm()
  const [username, setUsername] = React.useState('')

  const nameChangeTime = React.useRef<ReturnType<typeof setTimeout>>()

  function login(form: FieldValues) {
    //
  }

  const $username = watch('username')
  React.useEffect(() => {
    clearTimeout(nameChangeTime.current)
    nameChangeTime.current = setTimeout(() => {
      setUsername($username)
    }, 1000)
  }, [$username])

  return (
    <div className="container py-5">
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit(login)}>
          <div className="d-flex flex-column align-items-center">
            <Avatar
              variant="beam"
              colors={AVATAR_COLORS}
              name={username || ''}
            />
            <fieldset className="mt-3 w-100 d-flex flex-column align-items-center">
              <input
                type="text"
                placeholder="username"
                className="d-block w-100 mb-2"
                {...register('username', { required: true })}
              />

              <input
                type="password"
                placeholder="password"
                className="d-block w-100 mb-2"
                {...register('password', { required: true })}
              />

              <button className="primary">Continue</button>
            </fieldset>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
