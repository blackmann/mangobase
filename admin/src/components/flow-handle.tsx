import { Handle, HandleProps, Position } from 'reactflow'
import clsx from 'clsx'

interface Props extends HandleProps {
  className?: string
}

function FlowHandle({ className, ...props }: Props) {
  return (
    <Handle
      {...props}
      className={clsx(
        '!border-none !transform-none !relative !top-0 !h-[1.1rem] !w-[1.1rem]',
        {
          '!left-[-0.55rem]': props.position !== Position.Right,
          '!right-[-0.55rem]': props.position === Position.Right,
        },
        className
      )}
    >
      <div className="w-full h-full bg-zinc-400 dark:bg-neutral-400 rounded-full pointer-events-none" />
    </Handle>
  )
}

export default FlowHandle
