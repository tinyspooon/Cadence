'use client'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-border px-7 py-3.5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-[15px] font-bold text-text leading-tight font-sans">{title}</h1>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
