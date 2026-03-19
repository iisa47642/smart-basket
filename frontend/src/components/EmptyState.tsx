interface Props {
  icon?: string
  title: string
  description?: string
}

export default function EmptyState({ icon = '', title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <span className="text-5xl mb-4">{icon}</span>}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-400 max-w-sm">{description}</p>}
    </div>
  )
}
