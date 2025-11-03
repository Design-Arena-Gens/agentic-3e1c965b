"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

const VOICE_LINES = [
  'Ab design karega AI vs AI!??',
  'Kaunsa model banayega best look?',
  'Tum decide karoge ? vote do aur dekho kaun jeetega DesignArena mein!'
];

function useVoiceOver(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    let cancelled = false;

    const speakLine = (text: string, delay: number, rate = 1.05) => {
      window.setTimeout(() => {
        if (cancelled) return;
        const utter = new SpeechSynthesisUtterance(text);
        // Attempt to choose a vibrant voice
        const voices = synth.getVoices();
        const pref = voices.find(v => /hi|en-IN|Google.*Hindi|Microsoft.*Neural/i.test(v.name + ' ' + v.lang));
        if (pref) utter.voice = pref;
        utter.rate = rate;
        utter.pitch = 1.05;
        utter.volume = 1;
        synth.speak(utter);
      }, delay);
    };

    let accumulated = 600; // start slightly after visuals
    VOICE_LINES.forEach((line, i) => {
      const rate = i === 0 ? 1.07 : i === 1 ? 1.02 : 1.05;
      speakLine(line, accumulated, rate);
      accumulated += 2600;
    });

    return () => {
      cancelled = true;
      try { synth.cancel(); } catch {}
    };
  }, [enabled]);
}

function useMusic(enabled: boolean) {
  const audioRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioRef.current = ctx;

    // Simple energetic electronic loop using WebAudio
    const tempo = 128; // BPM
    const eighth = 60 / tempo / 2;

    const master = ctx.createGain();
    master.gain.value = 0.15;
    master.connect(ctx.destination);

    const createKick = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
      osc.connect(gain).connect(master);
      osc.start(time);
      osc.stop(time + 0.15);
    };

    const createHat = (time: number) => {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = buffer;

      const bp = ctx.createBiquadFilter();
      bp.type = 'highpass';
      bp.frequency.value = 8000;
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      noise.connect(bp).connect(gain).connect(master);
      noise.start(time);
      noise.stop(time + 0.03);
    };

    const createBass = (time: number, note: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = note;
      gain.gain.value = 0.06;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 600;
      osc.connect(lp).connect(gain).connect(master);
      osc.start(time);
      osc.stop(time + 0.25);
    };

    const start = ctx.currentTime + 0.05;
    const bars = 8; // ~7.5s loop
    for (let bar = 0; bar < bars; bar++) {
      for (let step = 0; step < 8; step++) {
        const t = start + (bar * 8 + step) * eighth;
        if (step % 2 === 0) createKick(t);
        createHat(t + 0.01);
        const pattern = [55, 55, 50, 55, 58, 58, 50, 53]; // simple minor vibe
        createBass(t, 2 ** ((pattern[step] - 69) / 12) * 440);
      }
    }

    return () => {
      try { ctx.close(); } catch {}
    };
  }, [enabled]);
}

function NeonGrid() {
  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(0,234,255,0.08),transparent)] animate-[spin_12s_linear_infinite]" />
      </div>
    </div>
  );
}

function GlowingText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`glitch text-center select-none ${className}`} data-text={text}>
      {text}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-1 rounded-full border border-white/10 bg-white/5 shadow-glow text-xs tracking-wider uppercase">
      {children}
    </div>
  );
}

function BattleCard({ title, subtitle, imageLabel, accent }: { title: string; subtitle: string; imageLabel: string; accent: string }) {
  return (
    <div className="neon-border rounded-2xl p-4 w-full max-w-sm">
      <div className="flex items-center justify-between">
        <Pill>AI Model</Pill>
        <div className={`w-2 h-2 rounded-full animate-pulse-fast`} style={{ background: accent }} />
      </div>
      <div className="mt-4 aspect-[4/3] rounded-xl bg-black/40 grid place-items-center border border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
        <div className="text-white/70 tracking-wider text-sm">{imageLabel}</div>
      </div>
      <div className="mt-4">
        <div className="text-white/80 text-lg font-semibold">{title}</div>
        <div className="text-white/50 text-sm">{subtitle}</div>
      </div>
      <div className="mt-4">
        <div className="h-2 rounded bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-blue to-neon-pink" style={{ width: `${Math.floor(50 + Math.random()*50)}%` }} />
        </div>
      </div>
    </div>
  );
}

function RatingBattle() {
  const accents = useMemo(() => ['#00eaff', '#ff1cf7'], []);
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <Pill>Design Battle</Pill>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        <BattleCard title="Poster: Neon Festival" subtitle="Bold gradients, sci-fi glyphs" imageLabel="Model A ? Poster" accent={accents[0]} />
        <BattleCard title="Website: Cyber Portfolio" subtitle="Glassmorphism, grid glow" imageLabel="Model B ? Website" accent={accents[1]} />
      </div>
      <div className="flex items-center gap-3 text-white/70">
        <span>Vote Now</span>
        <div className="h-1 w-40 bg-white/10 rounded">
          <div className="h-full w-24 bg-gradient-to-r from-neon-lime to-neon-blue rounded" />
        </div>
      </div>
    </div>
  );
}

function Leaderboard() {
  const entries = [
    { name: 'NovaStyle-X', score: 982 },
    { name: 'PixelForge Pro', score: 961 },
    { name: 'SynthDesign-XL', score: 944 },
    { name: 'ArtPilot v3', score: 919 },
  ];
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Pill>Leaderboard</Pill>
      <div className="mt-4 space-y-3">
        {entries.map((e, i) => (
          <motion.div key={e.name} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.12 }} className="neon-border rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-7 text-center text-sm text-white/70">#{i + 1}</div>
              <div className="flex-1">
                <div className="text-white/90 font-medium">{e.name}</div>
                <div className="h-2 mt-2 bg-white/10 rounded">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(e.score - 880)}%` }} transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 80 }} className="h-full rounded bg-gradient-to-r from-neon-purple to-neon-pink" />
                </div>
              </div>
              <div className="text-neon-blue font-semibold">{e.score}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LogoReveal() {
  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} className="relative">
        <div className="absolute -inset-10 bg-[conic-gradient(from_0deg,rgba(0,234,255,0.4),rgba(255,28,247,0.4),transparent,rgba(199,255,61,0.35))] blur-3xl opacity-40" />
        <div className="text-5xl md:text-7xl font-black tracking-tight">
          <span className="glitch" data-text="Design"><span className="text-neon-blue">Design</span></span>
          <span className="ml-2 glitch" data-text="Arena"><span className="text-neon-pink">Arena</span></span>
          <span className="text-white/60">.ai</span>
        </div>
      </motion.div>
      <div className="text-white/80 text-lg">Where AIs Compete, Creativity Wins.</div>
    </div>
  );
}

export default function HomePage() {
  const [scene, setScene] = useState(0);

  useVoiceOver(true);
  useMusic(true);

  useEffect(() => {
    const schedule = [0, 2000, 4300, 6800, 9800, 12800];
    const timers = schedule.map((ms, idx) => window.setTimeout(() => setScene(idx), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden scanlines">
      <NeonGrid />

      {/* HUD */}
      <div className="absolute top-6 left-6 flex items-center gap-3 text-xs text-white/60">
        <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse-fast" /> LIVE
        <div className="hidden md:block">/ Design Arena ? AI vs AI Battle</div>
      </div>

      <div className="container mx-auto px-6 py-20">
        <AnimatePresence mode="popLayout">{/* title + intro */}
          {scene === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }} className="flex flex-col items-center gap-8">
              <GlowingText text="AI vs AI" className="text-6xl md:text-8xl font-black tracking-tight" />
              <div className="text-center text-white/70 max-w-2xl">
                Fast neon transitions. Glitch overlays. Electric energy.
              </div>
              <div className="flex gap-3">
                <Pill>Posters</Pill>
                <Pill>Websites</Pill>
                <Pill>Logos</Pill>
                <Pill>3D Art</Pill>
              </div>
            </motion.div>
          )}

          {/* battle */}
          {scene === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.6 }}>
              <RatingBattle />
            </motion.div>
          )}

          {/* compare */}
          {scene === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.6 }} className="flex flex-col items-center gap-6">
              <GlowingText text="Compare. Rate. Rise." className="text-5xl font-black" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
                {['Poster', 'Website', 'Logo'].map((t, i) => (
                  <div key={t} className="neon-border p-5 rounded-2xl">
                    <div className="text-white/70">{t}</div>
                    <div className="mt-3 h-24 bg-black/40 rounded-xl border border-white/10 grid place-items-center">Preview</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* leaderboard */}
          {scene === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
              <Leaderboard />
            </motion.div>
          )}

          {/* CTA */}
          {scene === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.6 }} className="flex flex-col items-center gap-6">
              <GlowingText text="Vote. Compare. Discover." className="text-5xl md:text-6xl font-black" />
              <div className="flex gap-4">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink shadow-glow font-semibold">Enter DesignArena</button>
                <button className="px-6 py-3 rounded-xl neon-border">Watch Battles</button>
              </div>
            </motion.div>
          )}

          {/* logo end */}
          {scene >= 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
              <LogoReveal />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom ticker */}
      <div className="absolute bottom-0 left-0 right-0 h-12 border-t border-white/10 backdrop-blur bg-black/20">
        <div className="h-px w-full bg-gradient-to-r from-neon-pink via-neon-blue to-neon-lime opacity-30" />
        <div className="h-full flex items-center gap-8 px-6 text-xs text-white/60">
          <span>DesignArena.ai</span>
          <span>Live Battles ? Real-time Votes ? Creative Rankings</span>
        </div>
      </div>
    </main>
  );
}
