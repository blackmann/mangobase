import appDevelopers, { loadAppDevelopers } from '../../data/app-developers'
import AVATAR_COLORS from '@/lib/avatar-colors'
import Avatar from 'boring-avatars'
import React from 'preact/compat'

function Devs() {
  React.useEffect(() => {
    loadAppDevelopers()
  }, [])

  return (
    <div className="mt-3">
      <h1 className="font-bold text-lg leading-none">Devs</h1>
      <p className="text-secondary">
        Accounts with developer permissions for the app
      </p>

      <div className="mt-4">
        {appDevelopers.value.map((dev) => {
          return (
            <div key={dev._id}>
              <Avatar
                colors={AVATAR_COLORS}
                name={dev.fullname}
                variant="beam"
              />

              <div className="-ms-2">
                <span className="text-secondary">@</span>
                {dev.username}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Devs
