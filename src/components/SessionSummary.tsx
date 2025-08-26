import type { SessionState } from '../lib/types';

interface Props {
  session: SessionState;
  onClose: () => void;
}

export function SessionSummary({ session, onClose }: Props) {
  const accuracy = (session.correct / session.total) * 100;
  const avgTime = session.elapsedMs / session.total;

  return (
    <div style={{ padding: 16, background: 'var(--box-bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <h2>Session Summary</h2>
      <p>Accuracy: {accuracy.toFixed(1)}%</p>
      <p>Average time: {(avgTime / 1000).toFixed(2)}s</p>
      <button onClick={onClose} style={{ marginTop: 16 }}>Play Again</button>
    </div>
  );
}
