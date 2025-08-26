import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer(enabled: boolean, budgetMs: number, opts?: { onTimeout?: () => void }) {
  const [remaining, setRemaining] = useState(budgetMs)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback((now: number) => {
    if (startRef.current == null) startRef.current = now
    const elapsed = now - startRef.current
    const left = Math.max(0, budgetMs - elapsed)
    setRemaining(left)
    if (left <= 0) {
      opts?.onTimeout?.()
      startRef.current = null
      rafRef.current = null
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [budgetMs, opts])

  const start = useCallback(() => {
    cancel()
    startRef.current = null
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const cancel = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const reset = useCallback((newBudget?: number) => {
    const b = newBudget ?? budgetMs
    setRemaining(b)
    startRef.current = null
  }, [budgetMs])

  useEffect(() => {
    if (!enabled) return
    start()
    return cancel
  }, [enabled, start, cancel])

  return { remainingMs: remaining, start, cancel, reset }
}
