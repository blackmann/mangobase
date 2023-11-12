import * as RadixPopover from '@radix-ui/react-popover'
import React from 'preact/compat'

interface Props extends React.PropsWithChildren {
  trigger: React.ReactNode
}

function Popover({ children, trigger }: Props) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content>{children}</RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export { Popover }
