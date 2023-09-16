const tips = [
  {
    icon: 'add',
    title: 'Add a collection',
  },
  {
    icon: 'mouse',
    title: 'Click on collection to see data',
  },
  {
    icon: 'bug_report',
    title: 'View app logs',
  },
]

function CollectionEmptyState() {
  return (
    <div className="flex justify-center mt-[20%]">
      <div className="text-slate-500 dark:text-neutral-400">
        <ul>
          {tips.map((tip) => (
            <li
              key={tip.title}
              className="flex items-center space-x-2 [&+&]:mt-2"
            >
              <span className="material-symbols-rounded text-slate-400 dark:text-neutral-500">
                {tip.icon}
              </span>
              <span>{tip.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CollectionEmptyState
