'use client';

import { useState, useEffect, useCallback } from 'react';

function TypewriterText({ text, speed = 70, startDelay = 300, pauseDuration = 2000 }: {
  text: string;
  speed?: number;
  startDelay?: number;
  pauseDuration?: number;
}) {
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'waiting' | 'typing' | 'done' | 'pausing'>('waiting');

  useEffect(() => {
    const timer = setTimeout(() => setPhase('typing'), startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  const restart = useCallback(() => {
    setDisplayed('');
    setPhase('typing');
  }, []);

  useEffect(() => {
    if (phase === 'typing') {
      if (displayed.length >= text.length) {
        const timer = setTimeout(() => setPhase('done'), 0);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }

    if (phase === 'done') {
      const timer = setTimeout(() => {
        setPhase('pausing');
      }, pauseDuration);
      return () => clearTimeout(timer);
    }

    if (phase === 'pausing') {
      // Erase quickly then restart
      const timer = setTimeout(() => {
        restart();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, displayed, text, speed, pauseDuration, restart]);

  return (
    <span>
      {displayed}
      {(phase === 'typing' || phase === 'waiting') && (
        <span className="typewriter-cursor">|</span>
      )}
    </span>
  );
}

export default function DriveYourAmbition() {
  return (
    <section className="relative w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-mitsu-dark leading-tight tracking-tight font-serif">
          <TypewriterText text="Drive Your " speed={70} startDelay={300} pauseDuration={2500} />
          <span className="text-mitsu-red italic">
            <TypewriterText text="Ambition" speed={90} startDelay={300 + 11 * 70} pauseDuration={2500} />
          </span>
        </h1>
      </div>
    </section>
  );
}
