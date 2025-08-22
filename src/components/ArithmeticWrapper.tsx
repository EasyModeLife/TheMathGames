import React, { useEffect, useMemo, useState } from 'react';
import ArithmeticTrainer from '../modules/arithmetic/ui/Trainer';

type SimpleOp = '+' | '-' | 'x' | '/';

const ALL_OPS: SimpleOp[] = ['+','-','x','/'];
const LABELS: Record<SimpleOp,string> = { '+':'Addition', '-':'Subtraction', 'x':'Product', '/':'Division' };

const STORAGE_KEY = 'fmt-config-v1';

interface PersistedConfig {
  ops: SimpleOp[];
  min: number;
  max: number;
  total: number;
}

const defaultConfig: PersistedConfig = { ops: ['+'], min: 0, max: 10, total: 10 };

export const ArithmeticWrapper: React.FC = () => {
  const [config, setConfig] = useState<PersistedConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.ops) && typeof parsed.min==='number') return { ...defaultConfig, ...parsed };
      }
    } catch {}
    return defaultConfig;
  });
  const [sessionKey, setSessionKey] = useState(0);
  const [lastStats, setLastStats] = useState<null | { correct: number; total: number; time: number; accuracy: number }>(null);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  function toggleOp(op: SimpleOp) {
    setConfig(c => {
      const exists = c.ops.includes(op);
      let ops = exists ? c.ops.filter(o => o !== op) : [...c.ops, op];
  if (ops.length === 0) ops = [op]; // keep at least one
      return { ...c, ops };
    });
  }

  function updateRange(part: 'min' | 'max', val: number) {
    setConfig(c => {
      let min = c.min;
      let max = c.max;
      if (part === 'min') min = val; else max = val;
      if (min > max) [min, max] = [max, min];
      return { ...c, min, max };
    });
  }

  function updateTotal(val: number) {
    setConfig(c => ({ ...c, total: Math.min(200, Math.max(1, val)) }));
  }

  function startSession() {
    setLastStats(null);
    setSessionKey(k => k + 1);
  }

  return (
    <div style={{display:'grid',gap:'1.25rem',maxWidth:600}}>
      <form onSubmit={e => { e.preventDefault(); startSession(); }} style={{display:'grid',gap:'1rem'}}>
        <fieldset style={fs}>
          <legend style={lg}>Operations</legend>
          <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
            {ALL_OPS.map(op => (
              <OpButton key={op} active={config.ops.includes(op)} label={LABELS[op]} onClick={() => toggleOp(op)} />
            ))}
          </div>
        </fieldset>
        <fieldset style={fs}>
          <legend style={lg}>Range</legend>
          <div style={{display:'flex',gap:'.75rem',flexWrap:'wrap',alignItems:'center'}}>
            <label style={lbl}>Min
              <input type="number" value={config.min} onChange={e => updateRange('min', Number(e.target.value))} style={inpSmall} />
            </label>
            <label style={lbl}>Max
              <input type="number" value={config.max} onChange={e => updateRange('max', Number(e.target.value))} style={inpSmall} />
            </label>
          </div>
        </fieldset>
        <fieldset style={fs}>
          <legend style={lg}>Total</legend>
          <input type="number" value={config.total} min={1} max={200} onChange={e => updateTotal(Number(e.target.value))} style={inpSmall} aria-label="total exercises" />
        </fieldset>
  <button type="submit" style={startBtn}>Start Session</button>
      </form>
      <ArithmeticTrainer
        key={sessionKey + JSON.stringify(config)}
        operations={config.ops}
        range={[config.min, config.max]}
        total={config.total}
        onFinish={stats => setLastStats(stats)}
      />
      {lastStats && (
  <div style={{fontSize:'.75rem',opacity:.7}}>Last session: {lastStats.correct}/{lastStats.total} ({lastStats.accuracy.toFixed(0)}%) in {lastStats.time.toFixed(1)}s</div>
      )}
    </div>
  );
};

interface OpButtonProps { active: boolean; label: string; onClick: () => void }
const OpButton: React.FC<OpButtonProps> = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding:'.45rem .9rem',
      borderRadius:20,
      cursor:'pointer',
      fontSize:'.75rem',
      background: active ? '#1f6feb' : '#30363d',
      border: active ? '1px solid #3b82f6' : '1px solid #30363d',
      color:'#fff',
      fontWeight: active ? 600 : 400,
      letterSpacing:'.5px',
      transition:'background .15s'
    }}
    aria-pressed={active}
  >{label}</button>
);

const fs: React.CSSProperties = { border:'1px solid #30363d', borderRadius:8, padding:'.75rem 1rem', display:'grid', gap:'.5rem', minWidth:0 };
const lg: React.CSSProperties = { padding:'0 .4rem', fontSize:'.75rem', letterSpacing:'.5px', fontWeight:600 };
const lbl: React.CSSProperties = { display:'grid', gap:'.25rem', fontSize:'.65rem', textTransform:'uppercase', letterSpacing:'.5px' };
const inpSmall: React.CSSProperties = { padding:'.35rem .55rem', background:'#161b22', color:'#fff', border:'1px solid #30363d', borderRadius:6, width:'5.5rem' };
const startBtn: React.CSSProperties = { background:'#238636', color:'#fff', border:'1px solid #2ea043', padding:'.6rem 1.1rem', borderRadius:6, cursor:'pointer', fontSize:'.85rem', fontWeight:600 };

export default ArithmeticWrapper;
