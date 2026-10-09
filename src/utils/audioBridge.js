// Shared event bridge for audio playback synchronization across components
class AudioBridge {
  constructor() {
    this.isPlaying = false;
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.isPlaying);
    return () => this.listeners.delete(callback);
  }

  setPlaying(state) {
    this.isPlaying = state;
    this.listeners.forEach(cb => cb(this.isPlaying));
  }

  toggle() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('focus-audio-toggle'));
    }
  }
}

export const audioBridge = new AudioBridge();
