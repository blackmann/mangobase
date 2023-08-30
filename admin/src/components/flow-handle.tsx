import { Handle, Position } from 'reactflow'
import type { HandleComponentProps } from '@reactflow/core/dist/esm/components/Handle'
import clsx from 'clsx'

function FlowHandle({ className, ...props }: HandleComponentProps) {
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
      <div className="w-full h-full bg-slate-400 dark:bg-neutral-400 rounded-full pointer-events-none" />
    </Handle>
  )
}

export default FlowHandle
