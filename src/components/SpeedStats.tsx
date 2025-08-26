interface Props {
  historyMs: number[]
}

export default function SpeedStats({ historyMs }: Props) {
  const avg = historyMs.length ? Math.round(historyMs.reduce((a, b) => a + b, 0) / historyMs.length) : 0
  return (
    <div aria-label="Velocidad" style={{ display: 'flex', gap: 12, fontSize: 12, opacity: 0.8 }}>
      <span>Avg: {avg} ms</span>
      <span>Count: {historyMs.length}</span>
    </div>
  )
}
