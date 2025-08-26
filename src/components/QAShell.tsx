import { useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise, GameEngine, ModuleConfig, SessionState } from '../lib/types'
import { ProblemDisplay } from './ProblemDisplay'
import LevelProgress from './LevelProgress'
import SpeedStats from './SpeedStats'
import { useTimer } from '../lib/hooks/useTimer'
import { MobileKeyboard } from './MobileKeyboard'
import { useLocalStorage } from '../lib/hooks/useLocalStorage'
import './QAShell.css'
import { SessionSummary } from './SessionSummary'

interface Props<E extends GameEngine<ModuleConfig>> {
  engine: E
  mode: 'game' | 'practice'
  config?: ModuleConfig
  total?: number
  onFinish?: (state: SessionState) => void
}

export default function QAShell<E extends GameEngine<ModuleConfig>>({ engine, mode, config, total = 10, onFinish }: Props<E>) {
  const [level] = useState(config?.level ?? 1)
  const [correct, setCorrect] = useState(0)
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState<Exercise | undefined>()
  const [history, setHistory] = useState<Array<{ ex: Exercise; received: string; correct: boolean; ms: number }>>([])
  const [input, setInput] = useState('')
  const startedAtRef = useRef<number | undefined>(undefined)
  const lastStartRef = useRef<number | undefined>(undefined)
  const [announce, setAnnounce] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [lastSession, setLastSession] = useState<SessionState | null>(null)

  // Settings mínimos (ops y rango) persistentes por módulo
  const [ops, setOps] = useLocalStorage<string[]>(`${engine.id}:ops`, config?.ops ?? ['+','-'])
  const [range, setRange] = useLocalStorage<[number, number]>(`${engine.id}:range`, (config?.range as [number, number]) ?? [0, 10])
  const [totalCfg, setTotalCfg] = useLocalStorage<number>(`${engine.id}:total`, total)

  // Validación de configuración (solo práctica afecta UI; también evita re-init cuando inválida)
  const opsValid = ops.length > 0
  const rangeValid = Number.isFinite(range[0]) && Number.isFinite(range[1]) && range[0] <= range[1]
  const cfgValid = opsValid && rangeValid

  // Init engine once
  useEffect(() => {
    // Evitar re-init si la configuración es inválida (ej. rango inverso o sin operaciones)
    if (!cfgValid) return
    engine.init({ ...(config ?? {}), ops: ops as any, range })
    const ex = engine.next()
    setCurrent(ex)
    startedAtRef.current = performance.now()
    lastStartRef.current = startedAtRef.current
  }, [engine, config, ops, range, cfgValid])

  const budget = useMemo(() => engine.timeFor?.({ level, ex: current }) ?? 0, [engine, level, current])
  const timer = useTimer(mode === 'game' && budget > 0, budget, {
    onTimeout: () => handleSubmit(),
  })

  const handleSubmit = () => {
    if (!current) return
  const now = performance.now()
    const start = lastStartRef.current ?? now
    const ms = Math.max(0, Math.round(now - start))
    const res = engine.validate(current, input)
    setHistory((h) => [...h, { ex: current, received: input, correct: res.correct, ms }])
    if (res.correct) setCorrect((c) => c + 1)
    setAnnounce(res.correct ? 'Correcto' : `Incorrecto. Esperado ${res.expected}`)
    const nextCount = count + 1
    setCount(nextCount)
    setInput('')
    const next = engine.next()
    setCurrent(next)
    lastStartRef.current = performance.now()
    // re-enfocar input
    queueMicrotask(() => inputRef.current?.focus())

    if (mode === 'game' && nextCount >= totalCfg) {
      const state: SessionState = {
        level,
        total: nextCount,
        correct: res.correct ? correct + 1 : correct,
        startedAt: startedAtRef.current,
        current: next,
        elapsedMs: Math.round((performance.now() - (startedAtRef.current ?? performance.now()))),
        lastAnswerMs: ms,
        history: [...history, { ex: current, received: input, correct: res.correct, ms }],
      }
      try {
        const all = JSON.parse(localStorage.getItem('math-trainer-sessions') || '[]')
        all.push({ ...state, id: engine.id, title: engine.title, finishedAt: Date.now() })
        localStorage.setItem('math-trainer-sessions', JSON.stringify(all))
      } catch {}
      setLastSession(state)
      setShowSummary(true)
      onFinish?.(state)
    }
  if (budget > 0) timer.reset(budget)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') setInput('')
    if (e.key === 'Backspace') return // default ok
  }

  // Heurística simple para detectar viewport pequeño
  const isSmall = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 600px)').matches
  const layout = engine.keyboardLayout?.({ ex: current }) ?? 'numeric'

  // Reset de sesión (Play Again)
  const resetSession = () => {
    setShowSummary(false)
    setLastSession(null)
    setCorrect(0)
    setCount(0)
    setHistory([])
    setInput('')
    startedAtRef.current = performance.now()
    lastStartRef.current = startedAtRef.current
    if (cfgValid) {
      engine.init({ ...(config ?? {}), ops: ops as any, range })
      const ex = engine.next()
      setCurrent(ex)
    }
    queueMicrotask(() => inputRef.current?.focus())
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {showSummary && lastSession ? (
        <div tabIndex={-1} ref={(el) => {
          // Enfocar el resumen al mostrarse
          if (el) queueMicrotask(() => el.focus())
        }}>
          <SessionSummary session={lastSession} onClose={resetSession} />
        </div>
      ) : (
        <>
      <LevelProgress correct={correct} total={mode === 'game' ? totalCfg : Math.max(totalCfg, count)} />
  <ProblemDisplay key={count} exercise={current} />

      {/* Input de respuesta */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <input
          aria-label="Respuesta"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          ref={inputRef}
          style={{ padding: '8px 12px', minWidth: 160 }}
        />
  <button onClick={handleSubmit} disabled={(mode === 'practice' && input.trim() === '') || !cfgValid}>OK</button>
      </div>

      {/* Anunciador accesible */}
      <div aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' }}>{announce}</div>

      <SpeedStats historyMs={history.map(h => h.ms)} />

      {/* Timer visual simple */}
      {mode === 'game' && budget > 0 && (
        <div aria-label="Timer" style={{ height: 6, background: 'var(--border)', borderRadius: 999 }}>
          <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, (timer.remainingMs / budget) * 100))}%`, background: 'var(--primary-color)', borderRadius: 999 }} />
        </div>
      )}

      {/* Teclado móvil opcional */}
      {isSmall && (
        <MobileKeyboard
          layout={layout as any}
          onInput={(ch) => setInput((v) => v + ch)}
          onBackspace={() => setInput((v) => v.slice(0, -1))}
          onSubmit={handleSubmit}
        />
      )}

      {/* Configuración (solo en practice) */}
      {mode === 'practice' && (
        <fieldset style={{ display: 'grid', gap: 8 }}>
          <legend>Configuración</legend>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['+','-','x','/'].map(op => (
              <label key={op} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <input type="checkbox" checked={ops.includes(op)} onChange={(e) => {
                  setOps((prev) => e.target.checked ? [...new Set([...prev, op])] : prev.filter(o => o !== op))
                }} />
                {op}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>Rango
              <input
                style={{ marginLeft: 6, width: 72, borderColor: rangeValid ? undefined : 'var(--error-color, #e22)' }}
                type="number"
                value={range[0]}
                onChange={(e) => setRange([Number(e.target.value), range[1]])}
              />
            </label>
            <span>—</span>
            <label>
              <input
                style={{ width: 72, borderColor: rangeValid ? undefined : 'var(--error-color, #e22)' }}
                type="number"
                value={range[1]}
                onChange={(e) => setRange([range[0], Number(e.target.value)])}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>Total
              <input
                style={{ marginLeft: 6, width: 72 }}
                type="number"
                min={1}
                max={200}
                step={1}
                value={totalCfg}
                onChange={(e) => {
                  const n = Number(e.target.value)
                  setTotalCfg(Number.isFinite(n) ? Math.max(1, Math.min(200, Math.round(n))) : 10)
                }}
              />
            </label>
          </div>
          {!opsValid && (
            <div role="alert" style={{ color: 'var(--error-color, #e22)' }}>Selecciona al menos una operación.</div>
          )}
          {!rangeValid && (
            <div role="alert" style={{ color: 'var(--error-color, #e22)' }}>Rango inválido: el mínimo no puede ser mayor que el máximo.</div>
          )}
        </fieldset>
      )}
        </>
      )}
    </div>
  )
}