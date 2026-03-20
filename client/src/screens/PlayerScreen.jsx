import React, { useState, useEffect } from 'react';

export default function PlayerScreen({ file, projectId, navigate }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    function handleMessage(e) {
      if (e.data?.type === 'highscore' && typeof e.data.score === 'number') {
        try {
          const projects = JSON.parse(localStorage.getItem('claude-kids-projects') || '[]');
          const idx = projects.findIndex(p => p.id === projectId);
          if (idx >= 0) {
            const prev = projects[idx].highscore;
            // For memory, lower is better; for everything else, higher is better
            const isMemory = projects[idx].answers?.speltyp === 'memory';
            const isBetter = prev == null
              || (isMemory ? e.data.score < prev : e.data.score > prev);
            if (isBetter) {
              projects[idx].highscore = e.data.score;
              localStorage.setItem('claude-kids-projects', JSON.stringify(projects));
            }
          }
        } catch {}
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId]);

  function handleShare() {
    const url = window.location.origin + '/preview/' + file;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  const backScreen = projectId ? 'myStuff' : 'home';
  const backLabel = projectId ? '← Mina Saker' : '← Hem';

  if (!file) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#fff', gap: 16, padding: 24,
      }}>
        <div style={{ fontSize: 72 }}>😕</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, textAlign: 'center' }}>
          Filen hittades inte!
        </div>
        <button
          onClick={() => navigate(backScreen)}
          style={{
            padding: '14px 32px', borderRadius: 14,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: '1rem', cursor: 'pointer',
          }}
        >
          {backLabel}
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <iframe
        src={`/preview/${file}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Ditt skapelse"
      />
      <button
        onClick={() => navigate(backScreen)}
        style={{
          position: 'fixed', top: 12, left: 12,
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: 12, padding: '8px 16px',
          fontSize: '0.9rem', cursor: 'pointer',
          backdropFilter: 'blur(4px)',
        }}
      >
        {backLabel}
      </button>
      <button
        onClick={handleShare}
        style={{
          position: 'fixed', top: 12, right: 12,
          background: copied ? 'rgba(0,121,107,0.85)' : 'rgba(0,0,0,0.6)',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: 12, padding: '8px 16px',
          fontSize: '0.9rem', cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          transition: 'background 0.3s',
        }}
      >
        {copied ? '✓ Kopierat!' : '🔗 Dela'}
      </button>
    </div>
  );
}
