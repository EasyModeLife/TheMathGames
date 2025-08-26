import { useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { ArithmeticTrainer } from '../modules/arithmetic'
import { SessionSummary } from '../components/SessionSummary'
import type { SessionState } from '../lib/types'

export default function ArithmeticPage() {
  const params = useParams()
  const [session, setSession] = useState<SessionState | null>(null)
  const allowed = new Set(['game', 'practice', 'learning', 'howto'])
  const view = (params.view as string) ?? 'game'
  if (!allowed.has(view)) {
    return <Navigate to="/arithmetic/game" replace />
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
      {view === 'game' && <ArithmeticTrainer mode="game" onFinish={handleFinish} />}
      {view === 'practice' && <ArithmeticTrainer mode="practice" />}
      {view === 'learning' && <div style={{ padding: 8 }}>Learning resources coming soon.</div>}
      {view === 'howto' && <div style={{ padding: 8 }}>
        <h3>Cómo jugar Aritmética</h3>
        <p>Este modo te ayuda a practicar tus habilidades aritméticas básicas.</p>
        <ul style={{ paddingLeft: 18, display: 'grid', gap: 8, marginTop: 8 }}>
          <li><b>Modo Juego:</b> Resuelve tantos problemas como puedas antes de que se acabe el tiempo. La dificultad aumenta con cada nivel.</li>
          <li><b>Modo Práctica:</b> Tómate tu tiempo para resolver los problemas. Puedes configurar los tipos de operaciones y el rango de números.</li>
        </ul>
        <h4 style={{ marginTop: 12 }}>Controles</h4>
        <ol style={{ paddingLeft: 18, display: 'grid', gap: 6, marginTop: 4 }}>
          <li>Lee el problema que se muestra en la pantalla.</li>
          <li>Usa el teclado numérico en pantalla (en móvil) o tu teclado físico para introducir la respuesta.</li>
          <li>Presiona "OK" o la tecla "Enter" para enviar tu respuesta.</li>
          <li>Si te equivocas, el campo se marcará en rojo. Si aciertas, en verde.</li>
          <li>En el modo de práctica, puedes cambiar los operadores y el rango de números en la sección de configuración.</li>
        </ol>
      </div>}
    </div>
  )
}
