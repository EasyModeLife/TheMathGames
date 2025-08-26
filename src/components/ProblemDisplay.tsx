import MathComp from './Math';
import type { Exercise } from '../lib/types';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * ProblemDisplay
 * - Renderiza enunciados de problemas.
 * - Debe medir el contenedor y ajustar escala (auto-fit), permitiendo multilínea cuando aplique.
 * - Para expresiones matemáticas, se integrará KaTeX vía componente <Math>.
 */
interface Props {
  exercise?: Exercise;
  className?: string;
}

export function ProblemDisplay({ exercise, className }: Props) {
  const isMath = exercise?.meta?.math ?? false;
  const multiline = exercise?.meta?.multiline ?? false;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    // Reset scale before measuring
    content.style.transform = 'scale(1)';
    content.style.transformOrigin = 'center center';
    const { clientWidth } = el;
    const needed = content.scrollWidth;
    if (needed > 0 && clientWidth > 0) {
      const s = Math.max(0.6, Math.min(1, clientWidth / needed));
      setScale(s);
    } else {
      setScale(1);
    }
  }, [exercise?.prompt]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const el = containerRef.current;
      const content = contentRef.current;
      if (!el || !content) return;
      content.style.transform = 'scale(1)';
      const { clientWidth } = el;
      const needed = content.scrollWidth;
      if (needed > 0 && clientWidth > 0) {
        const s = Math.max(0.6, Math.min(1, clientWidth / needed));
        setScale(s);
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ minHeight: 56, textAlign: 'center', overflow: 'hidden' }}>
      <div
        ref={contentRef}
        style={{
          display: 'inline-block',
          whiteSpace: multiline ? 'normal' : 'nowrap',
          lineHeight: 1.2,
          fontSize: '2rem',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
  {isMath ? <MathComp>{exercise?.prompt ?? ''}</MathComp> : (exercise?.prompt ?? '—')}
      </div>
    </div>
  );
}
