import React, { useState, useEffect, useRef } from 'react';
import { getProject, saveProject, exportProject } from '../lib/projectStore.js';
import { exportToWav } from '../lib/wavExport.js';
import { exportCanvasAsPng, exportPixelGridAsPng } from '../lib/pngExport.js';
import { captureAnimationFrames, exportAnimationAsGif } from '../lib/gifExport.js';
import { getStateAtTime as getAnimStateAtTime } from '../lib/animationEngine.js';
import ColorPickerBlock from '../blocks/ColorPickerBlock.jsx';
import ColorPickerPreview from '../blocks/ColorPickerPreview.jsx';
import DrumsBlock from '../blocks/drums/DrumsBlock.jsx';
import SynthBlock from '../blocks/synth/SynthBlock.jsx';
import VoiceBlock from '../blocks/voice/VoiceBlock.jsx';
import MixerBlock from '../blocks/mixer/MixerBlock.jsx';
import ArrangerBlock from '../blocks/arranger/ArrangerBlock.jsx';
import WaveformBlock from '../blocks/waveform/WaveformBlock.jsx';
import CanvasDrawBlock from '../blocks/canvas-draw/CanvasDrawBlock.jsx';
import PixelEditorBlock from '../blocks/pixel-editor/PixelEditorBlock.jsx';
import SpritePickerBlock from '../blocks/sprite-picker/SpritePickerBlock.jsx';
import BackgroundPickerBlock from '../blocks/background-picker/BackgroundPickerBlock.jsx';
import ParticleFxBlock from '../blocks/particle-fx/ParticleFxBlock.jsx';
import CharacterBuilderBlock from '../blocks/character-builder/CharacterBuilderBlock.jsx';
import AnimationTimelineBlock from '../blocks/animation-timeline/AnimationTimelineBlock.jsx';
import VisualEffectsBlock from '../blocks/visual-effects/VisualEffectsBlock.jsx';
import BackgroundScrollerBlock from '../blocks/background-scroller/BackgroundScrollerBlock.jsx';
import GameLoopBlock from '../blocks/game-loop/GameLoopBlock.jsx';
import InputHandlerBlock from '../blocks/input-handler/InputHandlerBlock.jsx';
import PlatformerCtrlBlock from '../blocks/platformer-ctrl/PlatformerCtrlBlock.jsx';
import TopdownCtrlBlock from '../blocks/topdown-ctrl/TopdownCtrlBlock.jsx';
import TilemapBlock from '../blocks/tilemap/TilemapBlock.jsx';
import EnemyAIBlock from '../blocks/enemy-ai/EnemyAIBlock.jsx';
import ScoreBlock from '../blocks/score/ScoreBlock.jsx';
import HealthBlock from '../blocks/health/HealthBlock.jsx';
import TimerBlock from '../blocks/timer/TimerBlock.jsx';
import PowerupBlock from '../blocks/powerup/PowerupBlock.jsx';
import TriggerZoneBlock from '../blocks/trigger-zone/TriggerZoneBlock.jsx';
import TypewriterBlock from '../blocks/typewriter/TypewriterBlock.jsx';
import SpeechBubbleBlock from '../blocks/speech-bubble/SpeechBubbleBlock.jsx';
import NarrationBoxBlock from '../blocks/narration-box/NarrationBoxBlock.jsx';
import ChoiceButtonBlock from '../blocks/choice-button/ChoiceButtonBlock.jsx';
import VariableBlock from '../blocks/variable/VariableBlock.jsx';
import SceneSystemBlock from '../blocks/scene-system/SceneSystemBlock.jsx';
import FontPickerBlock from '../blocks/font-picker/FontPickerBlock.jsx';
import TextFxBlock from '../blocks/text-fx/TextFxBlock.jsx';
import Playground from '../components/Playground.jsx';

const CATEGORY_EMOJI = {
  musik: '🎵',
  spel: '🎮',
  konst: '🎨',
  animation: '✨',
  berattelse: '📖',
  filmstudio: '🎬',
};

const ALL_BLOCKS = [
  { id: 'color-picker', name: 'Färg', emoji: '🎨', type: 'color-picker' },
  { id: 'drums', name: 'Trummor', emoji: '🥁', type: 'drums', categories: ['musik'] },
  { id: 'synth',  name: 'Synth',  emoji: '🎹', type: 'synth',  categories: ['musik'] },
  { id: 'voice',  name: 'Röst',  emoji: '🎤', type: 'voice',  categories: ['musik'] },
  { id: 'mixer',    name: 'Mixer',    emoji: '🎚️', type: 'mixer',    categories: ['musik'] },
  { id: 'arranger', name: 'Arranger', emoji: '🎼',  type: 'arranger', categories: ['musik'] },
  { id: 'waveform', name: 'Vågor',    emoji: '〰️',  type: 'waveform', categories: ['musik'] },
  { id: 'canvas-draw', name: 'Rita', emoji: '🎨', type: 'canvas-draw', categories: ['ritprogram'] },
  { id: 'pixel-editor', name: 'Pixelkonst', emoji: '🖼️', type: 'pixel-editor', categories: ['ritprogram'] },
  { id: 'sprite-picker', name: 'Figurer', emoji: '🐱', type: 'sprite-picker', categories: ['ritprogram'] },
  { id: 'background-picker', name: 'Bakgrund', emoji: '🌄', type: 'background-picker', categories: ['ritprogram', 'musik'] },
  { id: 'particle-fx', name: 'Effekter', emoji: '✨', type: 'particle-fx', categories: ['ritprogram', 'musik', 'spel', 'animation', 'berattelse', 'konst'] },
  { id: 'character-builder', name: 'Karaktar', emoji: '🧑', type: 'character-builder', categories: ['animation'] },
  { id: 'animation-timeline', name: 'Animation', emoji: '🎬', type: 'animation-timeline', categories: ['animation'] },
  { id: 'visual-effects', name: 'Effekter', emoji: '💥', type: 'visual-effects', categories: ['animation'] },
  { id: 'background-scroller', name: 'Bakgrundsrullning', emoji: '🌄', type: 'background-scroller', categories: ['animation'] },
  { id: 'game-loop', name: 'Spelmotor', emoji: '⚙️', type: 'game-loop', categories: ['spel'] },
  { id: 'input-handler', name: 'Kontroller', emoji: '🕹️', type: 'input-handler', categories: ['spel'] },
  { id: 'platformer-ctrl', name: 'Plattformsspel', emoji: '🏃', type: 'platformer-ctrl', categories: ['spel'] },
  { id: 'topdown-ctrl', name: 'Uppifrån-spel', emoji: '🗺️', type: 'topdown-ctrl', categories: ['spel'] },
  { id: 'tilemap', name: 'Bandesign', emoji: '🗺️', type: 'tilemap', categories: ['spel'] },
  { id: 'enemy-ai', name: 'Fiender', emoji: '👾', type: 'enemy-ai', categories: ['spel'] },
  { id: 'score', name: 'Poäng', emoji: '⭐', type: 'score', categories: ['spel'] },
  { id: 'health', name: 'Hälsa', emoji: '❤️', type: 'health', categories: ['spel'] },
  { id: 'timer', name: 'Timer', emoji: '⏱️', type: 'timer', categories: ['spel'] },
  { id: 'powerup', name: 'Power-up', emoji: '⚡', type: 'powerup', categories: ['spel'] },
  { id: 'trigger-zone', name: 'Triggerzon', emoji: '🚪', type: 'trigger-zone', categories: ['spel'] },
  { id: 'typewriter', name: 'Skrivmaskin', emoji: '⌨️', type: 'typewriter', categories: ['filmstudio'] },
  { id: 'speech-bubble', name: 'Pratbubbla', emoji: '💬', type: 'speech-bubble', categories: ['filmstudio'] },
  { id: 'narration-box', name: 'Berattarruta', emoji: '📜', type: 'narration-box', categories: ['filmstudio'] },
  { id: 'choice-button', name: 'Valknapp', emoji: '🔀', type: 'choice-button', categories: ['filmstudio'] },
  { id: 'variable', name: 'Variabel', emoji: '🔢', type: 'variable', categories: ['filmstudio'] },
  { id: 'scene-system', name: 'Scensystem', emoji: '🗂️', type: 'scene-system', categories: ['filmstudio'] },
  { id: 'font-picker', name: 'Typsnitt', emoji: '🔤', type: 'font-picker', categories: ['filmstudio'] },
  { id: 'text-fx', name: 'Texteffekter', emoji: '✨', type: 'text-fx', categories: ['filmstudio'] },
];

function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > 768);
  useEffect(() => {
    function handleResize() {
      setIsLandscape(window.innerWidth > 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isLandscape;
}

const DEFAULT_NAME = 'Nytt projekt';

export default function BuilderScreen({ navigate, category, projectId: initialProjectId, name: initialName }) {
  const isLandscape = useIsLandscape();
  const [projectName, setProjectName] = useState(initialName || DEFAULT_NAME);
  const [addedBlocks, setAddedBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockConfigs, setBlockConfigs] = useState({});
  const [currentProjectId, setCurrentProjectId] = useState(initialProjectId || null);
  const [toast, setToast] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [autoSavePending, setAutoSavePending] = useState(!!initialName && !initialProjectId);
  const [gifExporting, setGifExporting] = useState(false);
  const nameRef = useRef(null);
  const toastTimerRef = useRef(null);
  const canvasDrawRef = useRef(null);

  const cat = category || 'musik';
  const catEmoji = CATEGORY_EMOJI[cat] || '🎵';
  const AVAILABLE_BLOCKS = ALL_BLOCKS.filter(b => !b.categories || b.categories.includes(cat));

  useEffect(() => {
    if (initialProjectId) {
      const proj = getProject(initialProjectId);
      if (proj) {
        setProjectName(proj.name || DEFAULT_NAME);
        setCurrentProjectId(proj.id);
        if (Array.isArray(proj.blocks)) {
          const mapped = proj.blocks.map(b =>
            AVAILABLE_BLOCKS.find(d => d.id === b.id) || b
          );
          setAddedBlocks(mapped);
          const configs = {};
          proj.blocks.forEach(b => {
            if (b.config) configs[b.id] = b.config;
          });
          setBlockConfigs(configs);
        }
      }
    }
  }, [initialProjectId]);

  // Auto-save when arriving back from name picker with a name
  useEffect(() => {
    if (autoSavePending && initialName) {
      setAutoSavePending(false);
      const name = initialName;
      const now = new Date().toISOString();
      const project = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
        version: '1.0',
        type: cat,
        name,
        theme: 'default',
        colorPalette: [],
        thumbnail: null,
        created: now,
        modified: now,
        blocks: [],
        playgroundState: {},
      };
      saveProject(project);
      setCurrentProjectId(project.id);
      showToast('Sparat som ' + name + '!');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(msg) {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  }

  function buildProject(name, id) {
    const now = new Date().toISOString();
    const existing = id ? getProject(id) : null;
    return {
      id: id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)),
      version: '1.0',
      type: cat,
      name,
      theme: 'default',
      colorPalette: [],
      thumbnail: null,
      created: existing?.created || now,
      modified: now,
      blocks: addedBlocks.map(b => ({ id: b.id, name: b.name, emoji: b.emoji, type: b.type, config: blockConfigs[b.id] || {} })),
      playgroundState: {},
    };
  }

  function handleSave() {
    const name = nameRef.current ? nameRef.current.innerText.trim() : projectName;
    // First save with default name — send to name picker
    if (!currentProjectId && (!name || name === DEFAULT_NAME)) {
      navigate('namePicker', { category: cat, returnTo: 'builder' });
      return null;
    }
    const project = buildProject(name, currentProjectId);
    saveProject(project);
    setCurrentProjectId(project.id);
    showToast('Sparat!');
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2000);
    return project;
  }

  function handleDela() {
    if (!currentProjectId) {
      showToast('Spara först!');
      return;
    }
    exportProject(currentProjectId);
  }

  async function handleExportWav() {
    const project = buildProject(
      nameRef.current ? nameRef.current.innerText.trim() : projectName,
      currentProjectId
    );
    showToast('Exporterar...');
    try {
      await exportToWav(project, 8);
      showToast('Nedladdat!');
    } catch (err) {
      console.error('WAV export failed:', err);
      showToast('Kunde inte exportera');
    }
  }

  function handleExportPng() {
    const canvasDrawBlock = addedBlocks.find(b => b.type === 'canvas-draw');
    const pixelEditorBlock = addedBlocks.find(b => b.type === 'pixel-editor');

    if (canvasDrawBlock && canvasDrawRef.current) {
      canvasDrawRef.current.exportPng();
      return;
    }
    if (pixelEditorBlock) {
      const cfg = blockConfigs[pixelEditorBlock.id] || {};
      const frames = cfg.frames || [];
      const gridSize = cfg.gridSize || 16;
      exportPixelGridAsPng(frames, gridSize, 'pixelkonst.png', 4);
    }
  }

  async function handleExportGif() {
    const animBlock = addedBlocks.find(b => b.type === 'animation-timeline');
    if (!animBlock) return;
    const cfg = blockConfigs[animBlock.id] || {};
    const objects = cfg.objects || [];
    const duration = cfg.duration ?? 5000;
    const hasKeyframes = objects.some(o => o.keyframes && o.keyframes.length > 0);
    if (!hasKeyframes) { showToast('Lagg till animationer forst!'); return; }

    setGifExporting(true);
    showToast('Skapar GIF...');
    try {
      const PREVIEW_SIZE = 200;
      const fps = 12;
      const renderFn = (timeMs, _canvas, ctx) => {
        ctx.fillStyle = '#1a2332';
        ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
        for (const obj of objects) {
          if (!obj.visible || !obj.keyframes || obj.keyframes.length === 0) continue;
          const state = getAnimStateAtTime(obj.keyframes, timeMs);
          const cx = PREVIEW_SIZE / 2 + (state.x ?? 0);
          const cy = PREVIEW_SIZE / 2 + (state.y ?? 0);
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity ?? 1));
          ctx.translate(cx, cy);
          ctx.rotate(((state.rotation ?? 0) * Math.PI) / 180);
          ctx.scale(state.scaleX ?? 1, state.scaleY ?? 1);
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fillStyle = '#58a6ff';
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obj.emoji || '?', 0, 0);
          ctx.restore();
        }
      };
      const frames = captureAnimationFrames(renderFn, duration, fps, PREVIEW_SIZE, PREVIEW_SIZE);
      await exportAnimationAsGif(frames, PREVIEW_SIZE, PREVIEW_SIZE, 'animation.gif', fps);
      showToast('GIF nedladdat!');
    } catch (err) {
      console.error('GIF export error:', err);
      showToast('Kunde inte exportera GIF');
    } finally {
      setGifExporting(false);
    }
  }

  function handleSpela() {
    const project = handleSave();
    if (project) navigate('play', { projectId: project.id });
  }

  function handleBlockChipClick(block) {
    if (!addedBlocks.find(b => b.id === block.id)) {
      setAddedBlocks(prev => [...prev, block]);
    }
    setSelectedBlock(block);
  }

  function handleRemoveBlock(blockId) {
    setAddedBlocks(prev => prev.filter(b => b.id !== blockId));
    setSelectedBlock(prev => (prev?.id === blockId ? null : prev));
    setBlockConfigs(prev => {
      const next = { ...prev };
      delete next[blockId];
      return next;
    });
  }

  function handleConfigChange(blockId, config) {
    setBlockConfigs(prev => ({ ...prev, [blockId]: { ...(prev[blockId] || {}), ...config } }));
  }

  const topBar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      height: 56,
      background: '#161b22',
      borderBottom: '1px solid #30363d',
      flexShrink: 0,
      gap: 12,
    }}>
      <button
        onClick={() => navigate('home')}
        style={{
          background: 'none',
          border: 'none',
          color: '#c9d1d9',
          fontSize: '1.4rem',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: 8,
          minWidth: 48,
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ←
      </button>
      <span
        ref={nameRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => setProjectName(e.currentTarget.innerText.trim())}
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#e6edf3',
          outline: 'none',
          borderBottom: '1px dashed #444',
          padding: '2px 4px',
          cursor: 'text',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {projectName}
      </span>
      <button
        onClick={handleSave}
        style={{
          background: '#238636',
          border: 'none',
          color: '#fff',
          fontSize: '0.9rem',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: 8,
          minHeight: 40,
          whiteSpace: 'nowrap',
        }}
      >
        💾 Spara
      </button>
    </div>
  );

  const colorPickerBlock = addedBlocks.find(b => b.type === 'color-picker');
  const colorPickerConfig = colorPickerBlock ? (blockConfigs[colorPickerBlock.id] || { color: '#6c3bbd' }) : null;
  const currentBgColor = colorPickerConfig ? colorPickerConfig.color : undefined;

  const drumsBlock = addedBlocks.find(b => b.type === 'drums');
  const drumsBpm = drumsBlock ? (blockConfigs[drumsBlock.id]?.bpm || 120) : 120;

  const backgroundPickerBlock = addedBlocks.find(b => b.type === 'background-picker');
  const selectedTheme = backgroundPickerBlock ? (blockConfigs[backgroundPickerBlock.id]?.backgroundId || 'default') : 'default';

  const previewArea = (
    <div style={{
      flex: 1,
      background: '#0d1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      minHeight: 0,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <Playground category={cat} theme={selectedTheme} color={currentBgColor} bpm={drumsBpm} addedBlocks={addedBlocks} isPlaying={false} celebrate={celebrate} />
      {colorPickerConfig && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ColorPickerPreview config={colorPickerConfig} />
        </div>
      )}
    </div>
  );

  const sidePanel = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#161b22',
      borderLeft: isLandscape ? '1px solid #30363d' : 'none',
      borderTop: isLandscape ? 'none' : '1px solid #30363d',
      overflow: 'hidden',
      flexShrink: 0,
      width: isLandscape ? '40%' : '100%',
      height: isLandscape ? '100%' : '55%',
    }}>
      {/* Block tray */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #30363d',
        flexShrink: 0,
      }}>
        <div style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
          Lägg till block +
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          {AVAILABLE_BLOCKS.map(block => (
            <button
              key={block.id}
              onClick={() => handleBlockChipClick(block)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                border: selectedBlock?.id === block.id ? '2px solid #58a6ff' : '2px solid #30363d',
                background: selectedBlock?.id === block.id ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: 40,
              }}
            >
              <span>{block.emoji}</span>
              <span>{block.name}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Added blocks list */}
      {addedBlocks.length > 0 && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid #30363d',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {addedBlocks.map(block => (
            <div
              key={block.id}
              onClick={() => setSelectedBlock(block)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: selectedBlock?.id === block.id ? '#0d2744' : '#21262d',
                border: selectedBlock?.id === block.id ? '1px solid #58a6ff' : '1px solid #30363d',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{block.emoji}</span>
              <span style={{ flex: 1, color: '#e6edf3', fontSize: '0.9rem', fontWeight: 600 }}>{block.name}</span>
              <button
                onClick={e => { e.stopPropagation(); handleRemoveBlock(block.id); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8b949e',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 4,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Config panel */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {selectedBlock ? (
          selectedBlock.type === 'color-picker' ? (
            <ColorPickerBlock
              config={blockConfigs[selectedBlock.id] || { color: '#6c3bbd' }}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'drums' ? (
            <DrumsBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'synth' ? (
            <SynthBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'voice' ? (
            <VoiceBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'mixer' ? (
            <MixerBlock
              addedBlocks={addedBlocks}
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'arranger' ? (
            <ArrangerBlock
              addedBlocks={addedBlocks}
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'waveform' ? (
            <WaveformBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'canvas-draw' ? (
            <CanvasDrawBlock
              ref={canvasDrawRef}
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
              projectName={projectName}
            />
          ) : selectedBlock.type === 'pixel-editor' ? (
            <PixelEditorBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'sprite-picker' ? (
            <SpritePickerBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'background-picker' ? (
            <BackgroundPickerBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'particle-fx' ? (
            <ParticleFxBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'character-builder' ? (
            <CharacterBuilderBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'animation-timeline' ? (
            <AnimationTimelineBlock
              addedBlocks={addedBlocks}
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'visual-effects' ? (
            <VisualEffectsBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'background-scroller' ? (
            <BackgroundScrollerBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'game-loop' ? (
            <GameLoopBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'input-handler' ? (
            <InputHandlerBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'platformer-ctrl' ? (
            <PlatformerCtrlBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'topdown-ctrl' ? (
            <TopdownCtrlBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'tilemap' ? (
            <TilemapBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'enemy-ai' ? (
            <EnemyAIBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'score' ? (
            <ScoreBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'health' ? (
            <HealthBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'timer' ? (
            <TimerBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'powerup' ? (
            <PowerupBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'trigger-zone' ? (
            <TriggerZoneBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'typewriter' ? (
            <TypewriterBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'speech-bubble' ? (
            <SpeechBubbleBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'narration-box' ? (
            <NarrationBoxBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'choice-button' ? (
            <ChoiceButtonBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'variable' ? (
            <VariableBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'scene-system' ? (
            <SceneSystemBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'font-picker' ? (
            <FontPickerBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : selectedBlock.type === 'text-fx' ? (
            <TextFxBlock
              config={blockConfigs[selectedBlock.id] || {}}
              onConfigChange={cfg => handleConfigChange(selectedBlock.id, cfg)}
            />
          ) : (
            <>
              <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
                {selectedBlock.emoji} {selectedBlock.name}
              </div>
              <div style={{ color: '#8b949e', fontSize: '0.85rem' }}>
                Inget att konfigurera ännu
              </div>
            </>
          )
        ) : (
          <div style={{ color: '#8b949e', fontSize: '0.9rem', marginTop: 8 }}>
            Välj ett block
          </div>
        )}
      </div>
    </div>
  );

  const bottomBar = (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: '12px 16px',
      background: '#161b22',
      borderTop: '1px solid #30363d',
      flexShrink: 0,
    }}>
      <button
        onClick={handleSpela}
        style={{
          flex: 1,
          padding: '14px',
          fontSize: '1rem',
          fontWeight: 700,
          borderRadius: 12,
          border: 'none',
          background: '#1f6feb',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        ▶ Spela
      </button>
      <button
        onClick={handleDela}
        style={{
          flex: 1,
          padding: '14px',
          fontSize: '1rem',
          fontWeight: 700,
          borderRadius: 12,
          border: 'none',
          background: currentProjectId ? '#388bfd' : '#30363d',
          color: currentProjectId ? '#fff' : '#6e7681',
          cursor: 'pointer',
        }}
      >
        📤 Dela
      </button>
      <button
        onClick={handleExportWav}
        style={{
          flex: 1,
          padding: '14px',
          fontSize: '1rem',
          fontWeight: 700,
          borderRadius: 12,
          border: 'none',
          background: '#6e40c9',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        ⬇ WAV
      </button>
      {cat === 'ritprogram' && (addedBlocks.some(b => b.type === 'canvas-draw') || addedBlocks.some(b => b.type === 'pixel-editor')) && (
        <button
          onClick={handleExportPng}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: 12,
            border: 'none',
            background: '#1a3a2a',
            color: '#7bff7b',
            cursor: 'pointer',
          }}
        >
          PNG
        </button>
      )}
      {cat === 'animation' && addedBlocks.some(b => b.type === 'animation-timeline') && (
        <button
          onClick={handleExportGif}
          disabled={gifExporting}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: 12,
            border: 'none',
            background: gifExporting ? '#21262d' : '#4a1d96',
            color: gifExporting ? '#6e7681' : '#e9d5ff',
            cursor: gifExporting ? 'not-allowed' : 'pointer',
          }}
        >
          {gifExporting ? '...' : '🎬 GIF'}
        </button>
      )}
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#0d1117',
      position: 'relative',
    }}>
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#238636',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: 24,
          fontWeight: 700,
          fontSize: '1rem',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}
      {topBar}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isLandscape ? 'row' : 'column',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: isLandscape ? '100%' : '45%',
          flexShrink: isLandscape ? 1 : 0,
        }}>
          {previewArea}
        </div>
        {sidePanel}
      </div>
      {bottomBar}
    </div>
  );
}
