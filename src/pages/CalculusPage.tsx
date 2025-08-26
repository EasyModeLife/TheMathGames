import { useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { CalculusTrainer } from '../modules/calculus'
import { SessionSummary } from '../components/SessionSummary'
import type { SessionState } from '../lib/types'

export default function CalculusPage() {
  const params = useParams()
  const [session, setSession] = useState<SessionState | null>(null)
  const allowed = new Set(['game', 'practice', 'learning', 'howto'])
  const view = (params.view as string) ?? 'game'
  if (!allowed.has(view)) {
    return <Navigate to="/calculus/game" replace />
  }

  const handleFinish = (state: SessionState) => {
    setSession(state)
  }

  const handleCloseSummary = () => {
    setSession(null)
  }

  if (session) {
    return <SessionSummary session={session} onClose={handleCloseSummary} />
  }

  return (
    <div>
      {view === 'game' && <CalculusTrainer mode="game" onFinish={handleFinish} />}
      {view === 'practice' && <CalculusTrainer mode="practice" />}
      {view === 'learning' && <div style={{ padding: 8 }}>Learning resources coming soon.</div>}
      {view === 'howto' && <div style={{ padding: 8 }}>
        <h3>Cómo jugar Cálculo</h3>
        <p>Este modo te reta a resolver derivadas simples.</p>
        <ul style={{ paddingLeft: 18, display: 'grid', gap: 8, marginTop: 8 }}>
          <li><b>Modo Juego:</b> Resuelve la derivada antes de que se acabe el tiempo.</li>
          <li><b>Modo Práctica:</b> Tómate tu tiempo para encontrar la derivada correcta.</li>
        </ul>
        <h4 style={{ marginTop: 12 }}>Reglas de formato</h4>
        <ol style={{ paddingLeft: 18, display: 'grid', gap: 6, marginTop: 4 }}>
          <li>Para exponentes, usa el símbolo `^`. Por ejemplo, `x` al cuadrado es `x^2`.</li>
          <li>No es necesario que escribas `f'(x) =`, solo la expresión de la derivada.</li>
          <li>El sistema es flexible con los espacios, pero intenta ser claro.</li>
        </ol>
      </div>}
    </div>
  )
}
