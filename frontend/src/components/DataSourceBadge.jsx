import { Cloud, CloudOff, Database } from 'lucide-react'

const SOURCE_META = {
  supabase: {
    label: 'Supabase',
    Icon: Database,
    className: 'data-source--supabase',
    title: 'Data langsung dari Supabase PostgREST',
  },
  express: {
    label: 'API Express',
    Icon: Cloud,
    className: 'data-source--express',
    title: 'Data dari backend Express (Module 1)',
  },
  local: {
    label: 'Data offline',
    Icon: CloudOff,
    className: 'data-source--local',
    title: 'Data seed/cache lokal — server tidak terjangkau',
  },
}

export default function DataSourceBadge({ source = 'local' }) {
  const meta = SOURCE_META[source] || SOURCE_META.local
  const { Icon } = meta

  return (
    <span
      className={`data-source ${meta.className}`}
      title={meta.title}
    >
      <Icon size={14} aria-hidden="true" />
      {meta.label}
    </span>
  )
}
