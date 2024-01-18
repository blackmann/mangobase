import { removeSnack, snacks } from '@/lib/snacks'
import clsx from 'clsx'

const ICONS = {
  error: 'emergency_home',
  neutral: 'stat_2',
  success: 'verified',
}

function Snacks() {
  return (
    <div class="absolute bottom-0 right-0 m-4 w-[20rem]">
      <ul>
        {snacks.value.map((snack) => {
          if (snack.type === 'custom') return snack.content

          return (
            <li key={snack.id} className="[&+&]:mt-2">
              <div
                class={clsx(
                  'bg-red-500 text-white px-2 py-1 rounded-lg flex justify-between gap-2',
                  {
                    '!bg-green-600': snack.type === 'success',
                    'bg-zinc-50 dark:bg-neutral-700 border dark:border-neutral-600 text-inherit':
                      snack.type === 'neutral',
                  }
                )}
              >
                <div className="flex gap-2 items-start">
                  <span className="material-symbols-rounded text-lg opacity-75">
                    {ICONS[snack.type]}
                  </span>
                  <div>{snack.content}</div>
                </div>
                <div>
                  <button onClick={() => removeSnack(snack.id)}>
                    <span className="material-symbols-rounded text-sm opacity-75">
                      close
                    </span>
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { Snacks }
