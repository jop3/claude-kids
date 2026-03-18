import React, { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'sv-SE', flag: '🇸🇪', name: 'Svenska' },
  { code: 'en-US', flag: '🇬🇧', name: 'Engelska' },
  { code: 'de-DE', flag: '🇩🇪', name: 'Tyska' },
];

export default function VoiceTextBlock({ config, onConfigChange }) {
  const language = config?.language ?? 'sv-SE';

  const [listening, setListening]       = useState(false);
  const [transcript, setTranscript]     = useState(config?.transcript ?? '');
  const [interim, setInterim]           = useState('');
  const [supported, setSupported]       = useState(true);
  const [copied, setCopied]             = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText) {
        setTranscript(prev => {
          const next = prev + finalText;
          onConfigChange({ ...config, transcript: next });
          return next;
        });
      }
      setInterim(interimText);
    };

    recognition.onerror = () => { setListening(false); setInterim(''); };
    recognition.onend = () => { setListening(false); setInterim(''); };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
    setInterim('');
  }

  function clearTranscript() {
    setTranscript('');
    setInterim('');
    onConfigChange({ ...config, transcript: '' });
  }

  function copyToClipboard() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(transcript).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }

  if (!supported) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>🎙️ Röst till text</div>
        <div style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 10, padding: '16px', color: '#8b949e', textAlign: 'center' }}>
          Din webbläsare stödjer inte taligenkänning 😔
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>🎙️ Röst till text</div>

      {/* Language selector */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>SPRÅK</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => onConfigChange({ ...config, language: lang.code })}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
                border: language === lang.code ? '2px solid #58a6ff' : '2px solid #30363d',
                background: language === lang.code ? '#0d2744' : '#21262d',
                color: '#e6edf3', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Listen button */}
      <button
        onClick={listening ? stopListening : startListening}
        style={{
          padding: '16px', borderRadius: 12, border: 'none',
          background: listening ? '#e94560' : '#238636',
          color: '#fff', fontSize: '1.1rem', fontWeight: 700,
          cursor: 'pointer',
          animation: listening ? 'none' : undefined,
        }}
      >
        {listening ? '⏹ Stopp' : '🎙️ Börja lyssna'}
      </button>

      {listening && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#e94560', fontSize: '0.85rem', fontWeight: 600,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e94560', display: 'inline-block', animation: 'none' }} />
          Lyssnar... ({LANGUAGES.find(l => l.code === language)?.name})
        </div>
      )}

      {/* Transcript box */}
      <div style={{
        background: '#0d1117', border: '1px solid #30363d', borderRadius: 10,
        padding: '12px', minHeight: 100, fontSize: '0.95rem', lineHeight: 1.6,
      }}>
        <span style={{ color: '#e6edf3' }}>{transcript}</span>
        {interim && <span style={{ color: '#8b949e' }}>{interim}</span>}
        {!transcript && !interim && (
          <span style={{ color: '#484f58' }}>Transkriptionen visas här...</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={copyToClipboard}
          disabled={!transcript}
          style={{
            flex: 1, padding: '10px', borderRadius: 10,
            border: '2px solid #30363d', background: '#21262d',
            color: copied ? '#4ecdc4' : '#e6edf3',
            fontSize: '0.9rem', fontWeight: 700,
            cursor: transcript ? 'pointer' : 'not-allowed',
            opacity: transcript ? 1 : 0.5,
          }}
        >
          {copied ? '✅ Kopierat!' : '📋 Kopiera'}
        </button>
        <button
          onClick={clearTranscript}
          disabled={!transcript}
          style={{
            padding: '10px 16px', borderRadius: 10,
            border: '2px solid #30363d', background: '#21262d',
            color: '#f85149', fontSize: '0.9rem', fontWeight: 700,
            cursor: transcript ? 'pointer' : 'not-allowed',
            opacity: transcript ? 1 : 0.5,
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
