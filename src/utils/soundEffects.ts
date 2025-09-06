// Simple sound effects using Web Audio API for pixel-style sounds

class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square') {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Correct answer sound - happy bling
  correctAnswer() {
    if (!this.audioContext) return;
    
    // Play ascending notes
    this.playTone(523.25, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 0.15), 50); // E5
    setTimeout(() => this.playTone(783.99, 0.2), 100); // G5
  }

  // Wrong answer sound - descending beep
  wrongAnswer() {
    if (!this.audioContext) return;
    
    // Play descending harsh notes
    this.playTone(440, 0.2, 'sawtooth'); // A4
    setTimeout(() => this.playTone(349.23, 0.2, 'sawtooth'), 100); // F4
    setTimeout(() => this.playTone(293.66, 0.3, 'sawtooth'), 200); // D4
  }

  // Combo achievement sound
  comboAchievement() {
    if (!this.audioContext) return;
    
    // Rapid ascending scale
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00]; // C-A scale
    notes.forEach((freq, index) => {
      setTimeout(() => this.playTone(freq, 0.1), index * 50);
    });
  }

  // Life gained sound
  lifeGained() {
    if (!this.audioContext) return;
    
    // Magical ascending arpeggio
    this.playTone(523.25, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 0.1), 80); // E5
    setTimeout(() => this.playTone(783.99, 0.1), 160); // G5
    setTimeout(() => this.playTone(1046.50, 0.2), 240); // C6
  }

  // Game over sound
  gameOver() {
    if (!this.audioContext) return;
    
    // Dramatic descending sequence
    this.playTone(440, 0.4, 'sawtooth'); // A4
    setTimeout(() => this.playTone(415.30, 0.4, 'sawtooth'), 200); // G#4
    setTimeout(() => this.playTone(392.00, 0.4, 'sawtooth'), 400); // G4
    setTimeout(() => this.playTone(349.23, 0.8, 'sawtooth'), 600); // F4
  }

  // Victory sound
  victory() {
    if (!this.audioContext) return;
    
    // Triumphant fanfare
    const melody = [
      { freq: 523.25, duration: 0.2 }, // C5
      { freq: 523.25, duration: 0.2 }, // C5
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 783.99, duration: 0.4 }, // G5
      { freq: 1046.50, duration: 0.6 } // C6
    ];
    
    let time = 0;
    melody.forEach(note => {
      setTimeout(() => this.playTone(note.freq, note.duration), time);
      time += note.duration * 300;
    });
  }

  // Button click sound
  buttonClick() {
    if (!this.audioContext) return;
    this.playTone(800, 0.05);
  }

  // Resume audio context if suspended (required by some browsers)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const soundEffects = new SoundEffects();