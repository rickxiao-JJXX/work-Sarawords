import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'known' | 'fuzzy' | 'forgotten' | 'complete';

class AudioGenerator {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error('Failed to play sound:', e);
    }
  }

  playKnown(): void {
    this.playTone(523.25, 0.15, 'sine');
    setTimeout(() => this.playTone(659.25, 0.15, 'sine'), 100);
    setTimeout(() => this.playTone(783.99, 0.2, 'sine'), 200);
  }

  playFuzzy(): void {
    this.playTone(300, 0.2, 'triangle');
    setTimeout(() => this.playTone(250, 0.2, 'triangle'), 150);
  }

  playForgotten(): void {
    this.playTone(200, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(150, 0.4, 'sawtooth'), 200);
  }

  playComplete(): void {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'sine'), i * 150);
    });
  }

  play(type: SoundType): void {
    switch (type) {
      case 'known':
        this.playKnown();
        break;
      case 'fuzzy':
        this.playFuzzy();
        break;
      case 'forgotten':
        this.playForgotten();
        break;
      case 'complete':
        this.playComplete();
        break;
    }
  }

  resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

const audioGenerator = new AudioGenerator();

export function useSound(enabled: boolean = true) {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const play = useCallback((type: SoundType) => {
    if (!enabledRef.current) return;
    audioGenerator.resume();
    audioGenerator.play(type);
  }, []);

  const playKnown = useCallback(() => play('known'), [play]);
  const playFuzzy = useCallback(() => play('fuzzy'), [play]);
  const playForgotten = useCallback(() => play('forgotten'), [play]);
  const playComplete = useCallback(() => play('complete'), [play]);

  return {
    play,
    playKnown,
    playFuzzy,
    playForgotten,
    playComplete,
  };
}
