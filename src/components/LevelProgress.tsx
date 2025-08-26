interface Props {
  correct: number
  total: number
}

export default function LevelProgress({ correct, total }: Props) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div aria-label="Progreso" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary-color)', borderRadius: 999 }} />
      </div>
      <span>{correct}/{total} ({pct}%)</span>
    </div>
  )
}
