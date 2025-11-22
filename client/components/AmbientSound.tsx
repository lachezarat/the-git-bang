import { useEffect, useRef, useState } from "react";

export default function AmbientSound() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize audio context on first user interaction
    const initAudio = () => {
      if (audioContextRef.current) return;

      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.08; // Very subtle volume

      startAmbience();
      setIsPlaying(true);
    };

    // Start on any user interaction
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      stopAmbience();
    };
  }, []);

  const startAmbience = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const masterGain = gainNodeRef.current;

    // Create ambient drone (deep space hum)
    const createDrone = (frequency: number, detune: number = 0) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.detune.value = detune;

      oscGain.gain.value = 0.15;

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();

      return osc;
    };

    // Deep ambient drones
    oscillatorsRef.current.push(createDrone(55, -5)); // Low A
    oscillatorsRef.current.push(createDrone(82.5, 3)); // Low E
    oscillatorsRef.current.push(createDrone(110, -2)); // A

    // Start electronic pulses
    startPulses();
  };

  const startPulses = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const masterGain = gainNodeRef.current;

    const createPulse = () => {
      const now = ctx.currentTime;

      // Create pulse oscillator
      const pulseOsc = ctx.createOscillator();
      const pulseGain = ctx.createGain();
      const pulseFilter = ctx.createBiquadFilter();

      pulseOsc.type = "sine";
      pulseOsc.frequency.value = 220 + Math.random() * 440; // Random frequency between 220-660 Hz

      pulseFilter.type = "lowpass";
      pulseFilter.frequency.value = 800;

      pulseGain.gain.setValueAtTime(0, now);
      pulseGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      pulseOsc.connect(pulseFilter);
      pulseFilter.connect(pulseGain);
      pulseGain.connect(masterGain);

      pulseOsc.start(now);
      pulseOsc.stop(now + 1.5);
    };

    // Create pulses at random intervals
    const scheduleNextPulse = () => {
      const delay = 3000 + Math.random() * 7000; // 3-10 seconds between pulses
      intervalRef.current = window.setTimeout(() => {
        createPulse();
        scheduleNextPulse();
      }, delay);
    };

    scheduleNextPulse();
  };

  const stopAmbience = () => {
    // Stop all oscillators
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    oscillatorsRef.current = [];

    // Clear pulse interval
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopAmbience();
      setIsPlaying(false);
    } else {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.08;
      startAmbience();
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="hud-element fixed bottom-6 right-6 w-12 h-12 liquid-glass diamond-clip group hover:scale-105 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,110,0.4)] pointer-events-auto z-50"
      style={{ animationDelay: "1.2s" }}
      title={isPlaying ? "Mute Ambient Sound" : "Play Ambient Sound"}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isPlaying ? (
          <svg
            className="w-5 h-5 text-space-magenta group-hover:text-white transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-space-cyan/50 group-hover:text-white transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        )}
      </div>
    </button>
  );
}
