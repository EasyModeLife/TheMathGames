import { type ReactNode } from 'react'

interface Props {
  header?: ReactNode
  children?: ReactNode
}

export function GameFrame({ header, children }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: '100%', gap: '8px' }}>
      {header && <div>{header}</div>}
      <div style={{ border: '1px solid var(--border, #ddd)', borderRadius: 8, padding: 16 }}>{children}</div>
    </div>
  )
}
