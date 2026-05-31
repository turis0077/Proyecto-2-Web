class ChiptuneSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.melodyInterval = null;
    this.activeOscillators = [];
  }

  initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMelodyForState(stateKey) {
    this.initContext();
    this.stop();

    this.isPlaying = true;

    const melodies = {
      menu: {
        notes: [60, 62, 64, 67, 64, 67, 69, 72], // peaceful major pentatonic (C4-D4-E4-G4-E4-G4-A4-C5)
        durations: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.8],
        type: 'sine',
        tempo: 90
      },
      gameplay: {
        notes: [60, 64, 67, 60, 64, 67, 72, 67], // upbeat arpeggiator
        durations: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
        type: 'triangle',
        tempo: 120
      },
      tense: {
        notes: [58, 61, 64, 67, 58, 61, 64, 67], // diminished, tense cycle
        durations: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
        type: 'sawtooth',
        tempo: 155
      },
      gameover: {
        notes: [60, 59, 58, 55], // descending sad scale
        durations: [0.5, 0.5, 0.5, 1.0],
        type: 'sawtooth',
        tempo: 80
      }
    };

    const track = melodies[stateKey] || melodies.menu;
    let noteIndex = 0;

    const scheduleNextNote = () => {
      if (!this.isPlaying) return;

      const note = track.notes[noteIndex];
      const duration = track.durations[noteIndex];
      const secondsPerBeat = 60 / track.tempo;
      const noteDurationSeconds = duration * secondsPerBeat * 4;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = track.type;
      osc.frequency.setValueAtTime(440 * Math.pow(2, (note - 69) / 12), this.ctx.currentTime);

      gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.05); // volume control
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + noteDurationSeconds - 0.02);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + noteDurationSeconds);
      this.activeOscillators.push(osc);

      noteIndex = (noteIndex + 1) % track.notes.length;

      // schedule next note
      this.melodyInterval = setTimeout(scheduleNextNote, noteDurationSeconds * 1000);
    };

    scheduleNextNote();
  }

  stop() {
    this.isPlaying = false;
    if (this.melodyInterval) {
      clearTimeout(this.melodyInterval);
      this.melodyInterval = null;
    }
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // ignore if already stopped
      }
    });
    this.activeOscillators = [];
  }
}

class AudioManager {
  constructor() {
    this.synth = new ChiptuneSynth();
    this.current = null;
  }

  play(key) {
    if (this.current === key) return;
    this.current = key;
    this.synth.playMelodyForState(key);
  }

  stop() {
    this.synth.stop();
    this.current = null;
  }
}

export const audio = new AudioManager();
