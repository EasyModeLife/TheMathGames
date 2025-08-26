import { useMemo } from 'react'
import { arithmeticEngine } from '../logic/engine'
import type { ModuleConfig, SessionState } from '../../../lib/types'
import QAShell from '../../../components/QAShell'

interface TrainerProps {
  config?: ModuleConfig
  mode?: 'game' | 'practice'
  onFinish?: (state: SessionState) => void
}

export default function Trainer({ config, mode = 'game' as const, onFinish }: TrainerProps) {
  // Inicializa el engine al montar el componente (memo para evitar re-inits innecesarios)
  useMemo(() => {
    arithmeticEngine.init(config ?? { level: 1, ops: ['+', '-'], range: [0, 10] })
  }, [config])

  return (
    <div>
      <h3>Aritmética · Entrenador</h3>
      <QAShell engine={arithmeticEngine} mode={mode} onFinish={onFinish} />
    </div>
  )
}
