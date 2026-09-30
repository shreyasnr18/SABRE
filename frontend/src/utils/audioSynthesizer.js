class AudioSynthesizer {
  constructor() {
    this.muted = false;
    this.lastPlayed = {};
    this.chimeContext = null;
  }

  initAudio() {
    if (!this.chimeContext && (window.AudioContext || window.webkitAudioContext)) {
      this.chimeContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return this.muted;
  }
  
  playChime() {
    if (this.muted || !this.chimeContext) return;
    
    if (this.chimeContext.state === 'suspended') {
      this.chimeContext.resume();
    }

    const osc = this.chimeContext.createOscillator();
    const gainNode = this.chimeContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.chimeContext.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, this.chimeContext.currentTime + 0.1); // A6
    
    gainNode.gain.setValueAtTime(0, this.chimeContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.chimeContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.chimeContext.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(this.chimeContext.destination);
    
    osc.start();
    osc.stop(this.chimeContext.currentTime + 0.5);
  }

  speak(id, text) {
    if (this.muted || !('speechSynthesis' in window)) return;
    
    // Rate limit: don't play same alert within 15 seconds
    const now = Date.now();
    if (this.lastPlayed[id] && (now - this.lastPlayed[id] < 15000)) {
      return;
    }
    this.lastPlayed[id] = now;

    this.initAudio();
    this.playChime();

    setTimeout(() => {
      if (this.muted) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US');
      if (preferred) utterance.voice = preferred;
      
      window.speechSynthesis.speak(utterance);
    }, 400); // Wait for chime
  }
}

export const audioSynth = new AudioSynthesizer();

export const ALERTS = {
  LANE_DRIFT: "Warning: Lane 1 drift detected. Return to the extreme left freight corridor.",
  CURVE_APPROACH: "Caution: Sharp interchange curve ahead. Decelerate to dynamic limit.",
  STEEP_DESCENT: "Alert: Severe downhill gradient detected. Engage engine retarder braking.",
  DOCK_CLEARANCE: "Notice: Industrial loading bay cleared. Proceed directly to assigned gate.",
  EMERGENCY_BYPASS: "Critical: Cold-chain emergency bypass active. Immediate yard entry authorized."
};
