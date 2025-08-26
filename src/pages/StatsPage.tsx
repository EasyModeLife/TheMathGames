import { useState, useEffect } from 'react';

// A simplified interface for the session data we expect to find in localStorage
interface StoredSession {
  id: string;
  title: string;
  finishedAt: number;
  correct: number;
  total: number;
  elapsedMs: number;
}

export default function StatsPage() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('math-trainer-sessions') || '[]');
      // Sort by most recent first
      stored.sort((a: StoredSession, b: StoredSession) => b.finishedAt - a.finishedAt);
      setSessions(stored);
    } catch (e) {
      console.error("Failed to load sessions", e);
      setSessions([]);
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete all session history?')) {
      try {
        localStorage.removeItem('math-trainer-sessions');
        setSessions([]);
      } catch (e) {
        console.error("Failed to clear sessions", e);
      }
    }
  };

  return (
    <div>
      <h2>Session History</h2>
      {sessions.length > 0 ? (
        <>
          <button onClick={handleClearHistory} style={{ marginBottom: 16 }}>
            Clear History
          </button>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
            {sessions.map((session, index) => (
              <li key={index} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                <strong>{session.title}</strong>
                <div>Score: {session.correct} / {session.total}</div>
                <div>Date: {new Date(session.finishedAt).toLocaleString()}</div>
                <div>Time: {(session.elapsedMs / 1000).toFixed(2)}s</div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No session history found.</p>
      )}
    </div>
  );
}
