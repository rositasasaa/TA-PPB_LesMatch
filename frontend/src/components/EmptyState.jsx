import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={28} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div className="empty-actions">{action}</div>}
    </div>
  )
}
