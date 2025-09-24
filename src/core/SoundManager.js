// --- COMPLETE AND UNABRIDGED FILE ---

export class SoundManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = new Map();
    this.masterVolume = 0.5;
    this.bgmSource = null;
    this.bgmGainNode = this.audioContext.createGain();
    this.bgmGainNode.connect(this.audioContext.destination);
  }

  async loadSound(name, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound: ${name} from ${url}`, error);
    }
  }

  async loadSounds(soundMap) {
    const promises = [];
    for (const [name, url] of Object.entries(soundMap)) {
      promises.push(this.loadSound(name, url));
    }
    await Promise.all(promises);
    console.log('All sounds loaded successfully!');
  }

  play(name, volume = 1.0) {
    const soundBuffer = this.sounds.get(name);
    if (!soundBuffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = soundBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }

  playBGM(name, volume = 0.3) {
    if (this.bgmSource) {
      this.bgmSource.stop();
    }
    const soundBuffer = this.sounds.get(name);
    if (!soundBuffer) return;

    this.bgmSource = this.audioContext.createBufferSource();
    this.bgmSource.buffer = soundBuffer;
    this.bgmSource.loop = true;

    this.bgmGainNode.gain.value = volume * this.masterVolume;

    this.bgmSource.connect(this.bgmGainNode);
    this.bgmSource.start(0);
  }
}
