import React, { useEffect, useMemo, useState } from 'react';
import { createArithmeticModule, Exercise } from '../index';

interface Props {
  operations?: Array<'+' | '-' | 'x' | '/'>;
  range?: [number, number];
  total?: number;
  onFinish?: (stats: { correct: number; total: number; time: number; accuracy: number }) => void;
}

export const ArithmeticTrainer: React.FC<Props> = ({ operations = ['+','-','x','/'], range = [0, 10], total = 10, onFinish }) => {
  const mod = useMemo(() => createArithmeticModule({ operations, range, total }), [operations, range, total]);
  const [exercise, setExercise] = useState<Exercise>(() => mod.getNext());
  const [input, setInput] = useState('');
  const [count, setCount] = useState(1);
  const [correct, setCorrect] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [start] = useState(() => performance.now());
  const [end, setEnd] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [lock, setLock] = useState(false); // prevent multiple triggers while animating

  function handleChange(raw: string) {
    if (finished) return;
  // Sanitize: allow digits and a leading '-' (for negative results in subtraction)
    let val = raw.replace(/[^0-9\-]/g, '');
    if (val.indexOf('-') > 0) {
  // if '-' is not the first char, remove it
      val = val.replace(/-/g, '');
    }
    setInput(val);
    if (lock) return;
  // Validate only if numeric
    if (val.trim() === '') { setFeedback(null); return; }
    const num = Number(val);
    if (Number.isNaN(num)) { setFeedback(''); return; }
    if (num === exercise.answer) {
  // correct
      setLock(true);
      setFlash(true);
      setCorrect(c => c + 1);
      setFeedback('✔');
      const isLast = count >= (total || 0);
      if (isLast) {
        const endTime = performance.now();
        setTimeout(() => {
          setFinished(true);
          setEnd(endTime);
          const t = (endTime - start) / 1000;
          const accuracy = ((correct + 1) / total) * 100;
          onFinish?.({ correct: correct + 1, total, time: t, accuracy });
        }, 220);
      } else {
        setTimeout(() => {
          setExercise(mod.getNext());
          setCount(c => c + 1);
          setInput('');
          setFlash(false);
          setLock(false);
          setFeedback(null);
        }, 220);
      }
    } else {
      setFeedback('');
    }
  }

  function restart() {
    // Reset internal state keeping same operations and range
    setExercise(mod.getNext());
    setInput('');
    setCount(1);
    setCorrect(0);
    setFeedback(null);
    setFinished(false);
  }

  // Clear lock if exercise changes externally (new config)
  useEffect(() => { setLock(false); setFlash(false); }, [exercise.id]);

  if (finished) {
    const t = end ? (end - start) / 1000 : 0;
    return (
      <div style={{display:'grid',gap:'1rem'}}>
  <h2>Summary</h2>
  <div><strong>Correct:</strong> {correct} / {total}</div>
  <div><strong>Accuracy:</strong> {Math.round((correct/total)*100)}%</div>
  <div><strong>Time:</strong> {t.toFixed(1)} s</div>
  <button onClick={restart} style={{background:'#238636',color:'#fff',border:'1px solid #2ea043',padding:'0.6rem 1rem',fontSize:'0.9rem',borderRadius:6,cursor:'pointer'}}>Restart</button>
      </div>
    );
  }

  return (
    <div style={{display:'grid',gap:'0.75rem',maxWidth:360}}>
  <div style={{fontSize:'0.8rem',opacity:0.7}}>Exercise {count} / {total}</div>
      <div style={{
          fontSize:'2rem',
          fontWeight:600,
          padding:'.4rem .6rem',
          borderRadius:8,
          background: flash ? 'rgba(35,134,54,.25)' : 'transparent',
          transition:'background .25s, transform .25s',
          transform: flash ? 'scale(1.05)' : 'scale(1)'
        }}>{exercise.question}</div>
      <input
        style={inputStyle}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        autoFocus
        value={input}
        onChange={e => handleChange(e.target.value)}
  aria-label="answer"
        onKeyDown={e => {
          const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Enter'];
          if (allowed.includes(e.key)) return;
          if (/^[0-9]$/.test(e.key)) return;
          if (e.key === '-' && (input.length === 0)) return; // permitir negativo inicial
          e.preventDefault();
        }}
      />
      <div style={{minHeight:'1.2rem',fontSize:'0.9rem',color:'#2ea043',fontWeight:600}} aria-live="polite">{feedback}</div>
      <progress value={count} max={total} style={{width:'100%'}} />
    </div>
  );
};

// botón eliminado (validación automática)

const inputStyle: React.CSSProperties = {
  padding:'0.5rem 0.75rem',
  borderRadius:6,
  border:'1px solid #30363d',
  background:'#161b22',
  color:'#e6edf3',
  fontSize:'1.2rem'
};

export default ArithmeticTrainer;
