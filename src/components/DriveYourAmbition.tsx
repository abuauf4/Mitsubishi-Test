'use client';

import { useState, useEffect, useCallback } from 'react';

function TypewriterText({ text, speed = 70, startDelay = 300, eraseSpeed = 40, pauseDuration = 3000 }: {
  text: string;
  speed?: number;
  startDelay?: number;
  eraseSpeed?: number;
  pauseDuration?: number;
}) {
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'waiting' | 'typing' | 'pausing' | 'erasing' | 'idle'>('waiting');

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
        const timer = setTimeout(() => setPhase('pausing'), 0);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }

    if (phase === 'pausing') {
      const timer = setTimeout(() => setPhase('erasing'), pauseDuration);
      return () => clearTimeout(timer);
    }

    if (phase === 'erasing') {
      if (displayed.length <= 0) {
        const timer = setTimeout(() => {
          setPhase('idle');
          const idleTimer = setTimeout(() => restart(), 800);
          return () => clearTimeout(idleTimer);
        }, 100);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length - 1));
      }, eraseSpeed);
      return () => clearTimeout(timer);
    }
  }, [phase, displayed, text, speed, eraseSpeed, pauseDuration, restart]);

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
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-mitsu-dark leading-none tracking-wider uppercase font-serif min-h-[1.2em]">
          <TypewriterText text="Drive Your " speed={70} startDelay={300} eraseSpeed={35} pauseDuration={3000} />
          <span className="text-mitsu-red">
            <TypewriterText text="Ambition" speed={90} startDelay={300 + 11 * 70} eraseSpeed={35} pauseDuration={3000} />
          </span>
        </h1>
      </div>
    </section>
  );
}
