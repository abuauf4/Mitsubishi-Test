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
  const [isVisible, setIsVisible] = useState(true);
  const [hasSpace, setHasSpace] = useState(true);

  useEffect(() => {
    // Cycle visibility: show for 6s, hide for 2s
    // When hidden, section collapses creating continuous scroll movement
    const showDuration = 6000; // type + pause time
    const hideDuration = 2000; // collapsed time

    const cycle = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          cycle();
        }, hideDuration);
      }, showDuration);
    };

    // Start after initial animation completes
    const startTimer = setTimeout(cycle, 6000);
    return () => clearTimeout(startTimer);
  }, []);

  return (
    <section className="relative w-full bg-white overflow-hidden">
      <div
        className="transition-all duration-700 ease-in-out"
        style={{
          maxHeight: isVisible ? '200px' : '0px',
          opacity: isVisible ? 1 : 0,
          paddingTop: isVisible ? '24px' : '0px',
          paddingBottom: isVisible ? '24px' : '0px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-mitsu-dark leading-none tracking-wider uppercase font-serif">
            <TypewriterText text="Drive Your " speed={70} startDelay={300} eraseSpeed={35} pauseDuration={3000} />
            <span className="text-mitsu-red">
              <TypewriterText text="Ambition" speed={90} startDelay={300 + 11 * 70} eraseSpeed={35} pauseDuration={3000} />
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
