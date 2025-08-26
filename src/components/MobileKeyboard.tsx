/**
 * MobileKeyboard
 * - Layout configurable por módulo: 'numeric' | 'calc' | custom
 * - Eventos: onInput, onBackspace, onSubmit
 */
export function MobileKeyboard({ onInput, onBackspace, onSubmit, layout = 'numeric' as const }: { onInput: (ch: string) => void; onBackspace: () => void; onSubmit?: () => void; layout?: 'numeric' | 'calc' | { rows: string[][] } }) {
  const numeric = { rows: [['7','8','9'], ['4','5','6'], ['1','2','3'], ['0']] }
  const calc = { rows: [['7','8','9'], ['4','5','6'], ['1','2','3'], ['0','.','-']] }
  const conf = layout === 'numeric' ? numeric : layout === 'calc' ? calc : layout
  const cols = Math.max(...conf.rows.map(r => r.length))
  return (
    <div role="group" aria-label="Teclado" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
      {conf.rows.flatMap((row, ri) => row.map((k, i) => (
        <button key={`${ri}-${i}`} onClick={() => onInput(k)} aria-label={`tecla ${k}`}>{k}</button>
      )))}
      <button onClick={onBackspace} aria-label="Borrar">⌫</button>
      {onSubmit && <button onClick={onSubmit} aria-label="Enviar">OK</button>}
    </div>
  )
}
