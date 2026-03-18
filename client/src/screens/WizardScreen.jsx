import React, { useState, useEffect } from 'react';
import { WIZARD_CONFIG } from '../lib/wizardConfig.js';

export default function WizardScreen({ category, navigate, answers: initialAnswers = {} }) {
  const config = WIZARD_CONFIG[category];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [transitioning, setTransitioning] = useState(false);
  const [slideDir, setSlideDir] = useState('in'); // 'in' | 'out'
  const [sliderValue, setSliderValue] = useState(null);
  const [multiSelected, setMultiSelected] = useState([]);

  if (!config) {
    return (
      <div style={{ color: '#fff', padding: 32 }}>
        Okänd kategori: {category}
        <button onClick={() => navigate('home')} style={{ marginLeft: 16 }}>Hem</button>
      </div>
    );
  }

  const steps = config.steps;
  const step = steps[currentStep];
  const totalSteps = steps.length;

  // Init slider/multi state when step changes
  useEffect(() => {
    if (step.type === 'slider') {
      const saved = answers[step.id];
      setSliderValue(saved !== undefined ? saved : step.default);
    }
    if (step.type === 'multiChoice') {
      const saved = answers[step.id];
      setMultiSelected(Array.isArray(saved) ? saved : []);
    }
  }, [currentStep, category]);

  function advanceStep(newAnswers) {
    if (currentStep + 1 >= totalSteps) {
      navigate('playground', { category, answers: newAnswers });
      return;
    }
    setTransitioning(true);
    setSlideDir('out');
    setTimeout(() => {
      setCurrentStep(s => s + 1);
      setSlideDir('in');
      setTransitioning(false);
    }, 200);
  }

  function handleChoiceTap(choiceId) {
    const newAnswers = { ...answers, [step.id]: choiceId };
    setAnswers(newAnswers);
    setTimeout(() => advanceStep(newAnswers), 220);
  }

  function handleMultiToggle(choiceId) {
    setMultiSelected(prev => {
      if (prev.includes(choiceId)) {
        return prev.filter(id => id !== choiceId);
      }
      if (prev.length >= step.max) {
        // Replace oldest
        return [...prev.slice(1), choiceId];
      }
      return [...prev, choiceId];
    });
  }

  function handleMultiNext() {
    if (multiSelected.length < step.min) return;
    const newAnswers = { ...answers, [step.id]: multiSelected };
    setAnswers(newAnswers);
    advanceStep(newAnswers);
  }

  function handleSliderNext() {
    const newAnswers = { ...answers, [step.id]: sliderValue };
    setAnswers(newAnswers);
    advanceStep(newAnswers);
  }

  function handleBack() {
    if (currentStep === 0) {
      navigate('home');
    } else {
      setTransitioning(true);
      setSlideDir('out');
      setTimeout(() => {
        setCurrentStep(s => s - 1);
        setSlideDir('in');
        setTransitioning(false);
      }, 200);
    }
  }

  const themeColor = config.color;

  const slideStyle = {
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    transform: transitioning
      ? slideDir === 'out' ? 'translateX(-60px)' : 'translateX(60px)'
      : 'translateX(0)',
    opacity: transitioning ? 0 : 1,
    width: '100%',
  };

  const multiReady = multiSelected.length >= (step.min || 1);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        flexShrink: 0,
      }}>
        {/* Back arrow */}
        <button
          onClick={handleBack}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontSize: '1.4rem',
            cursor: 'pointer',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ←
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? 20 : 10,
                height: 10,
                borderRadius: 5,
                background: i < currentStep
                  ? themeColor
                  : i === currentStep
                  ? '#fff'
                  : 'rgba(255,255,255,0.25)',
                transition: 'all 0.3s ease',
                animation: i === currentStep ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            />
          ))}
        </div>

        {/* Category emoji */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: themeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          flexShrink: 0,
        }}>
          {config.emoji}
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: '8px 24px 20px', flexShrink: 0 }}>
        <h2 style={{
          fontSize: 'clamp(1.4rem, 4vw, 2rem)',
          fontWeight: 900,
          color: '#fff',
          margin: 0,
          textAlign: 'center',
        }}>
          {step.question}
        </h2>
      </div>

      {/* Step content */}
      <div style={{ ...slideStyle, flex: 1, display: 'flex', flexDirection: 'column', padding: '0 16px', overflowY: 'auto' }}>
        {step.type === 'choice' && (
          <ChoiceGrid
            choices={step.choices}
            selected={answers[step.id]}
            themeColor={themeColor}
            onSelect={handleChoiceTap}
          />
        )}

        {step.type === 'multiChoice' && (
          <>
            <ChoiceGrid
              choices={step.choices}
              selected={multiSelected}
              themeColor={themeColor}
              onSelect={handleMultiToggle}
              multi={true}
            />
            <div style={{ padding: '16px 0 24px', display: 'flex', justifyContent: 'center' }}>
              <NextButton
                onClick={handleMultiNext}
                disabled={!multiReady}
                themeColor={themeColor}
                label={`Nästa → (${multiSelected.length}/${step.min})`}
              />
            </div>
          </>
        )}

        {step.type === 'slider' && (
          <SliderStep
            step={step}
            value={sliderValue}
            onChange={setSliderValue}
            themeColor={themeColor}
            onNext={handleSliderNext}
          />
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

function ChoiceGrid({ choices, selected, themeColor, onSelect, multi = false }) {
  const isSelected = (id) => multi
    ? Array.isArray(selected) && selected.includes(id)
    : selected === id;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 12,
      width: '100%',
      paddingBottom: 8,
    }}>
      {choices.map(choice => {
        const sel = isSelected(choice.id);
        const otherSelected = !multi && selected && selected !== choice.id;
        return (
          <button
            key={choice.id}
            onClick={() => onSelect(choice.id)}
            style={{
              minHeight: 100,
              background: sel
                ? themeColor
                : 'rgba(255,255,255,0.08)',
              border: sel
                ? `3px solid #fff`
                : '3px solid transparent',
              borderRadius: 16,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 8px',
              boxShadow: sel ? `0 0 16px ${themeColor}99` : 'none',
              transform: sel ? 'scale(1.05)' : otherSelected ? 'scale(0.93)' : 'scale(1)',
              opacity: otherSelected ? 0.5 : 1,
              transition: 'transform 0.18s ease, opacity 0.18s ease, background 0.15s ease, box-shadow 0.15s ease',
              position: 'relative',
            }}
          >
            {multi && sel && (
              <div style={{
                position: 'absolute',
                top: 6,
                right: 8,
                fontSize: '1rem',
                color: '#fff',
              }}>
                ✓
              </div>
            )}
            <span style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', lineHeight: 1 }}>{choice.emoji}</span>
            <span style={{
              fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)',
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              {choice.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SliderStep({ step, value, onChange, themeColor, onNext }) {
  if (value === null) return null;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 32,
      padding: '16px 0 32px',
      flex: 1,
    }}>
      {/* Big value display */}
      <div style={{
        fontSize: '5rem',
        fontWeight: 900,
        color: themeColor,
        lineHeight: 1,
        textShadow: `0 0 24px ${themeColor}88`,
      }}>
        {value}
      </div>

      {/* Slider */}
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          <span>{step.minLabel}</span>
          <span>{step.maxLabel}</span>
        </div>
        <input
          type="range"
          min={step.min}
          max={step.max}
          step={step.step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            width: '100%',
            height: 8,
            accentColor: themeColor,
            cursor: 'pointer',
            borderRadius: 4,
          }}
        />
      </div>

      <NextButton onClick={onNext} themeColor={themeColor} label="Nästa →" />
    </div>
  );
}

function NextButton({ onClick, disabled, themeColor, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '16px 48px',
        fontSize: '1.1rem',
        fontWeight: 800,
        borderRadius: 16,
        border: 'none',
        background: disabled ? 'rgba(255,255,255,0.15)' : themeColor,
        color: disabled ? 'rgba(255,255,255,0.4)' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : `0 4px 20px ${themeColor}66`,
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}
