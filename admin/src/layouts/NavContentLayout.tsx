import { ComponentChild } from 'preact'
import React from 'preact/compat'

interface Props extends React.PropsWithChildren {
  nav: ComponentChild
}
function NavContentLayout({ children, nav }: Props) {
  return (
    <div class="grid grid-cols-12 xl:grid-cols-10 2xl:grid-cols-8 gap-4 me-4">
      <nav class="col-span-2 xl:col-span-2 2xl:col-span-1 mt-4">{nav}</nav>

      <div className="col-span-10 xl:col-span-8 2xl:col-span-7">{children}</div>
    </div>
  )
}

export default NavContentLayout
