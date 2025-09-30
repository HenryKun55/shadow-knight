// --- COMPLETE AND UNABRIDGED FILE ---

export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.masterVolume = 0.5;
    this.bgmVolume = 0.3;
    this.sfxVolume = 1.0;
    this.bgmSource = null;
    this.bgmGainNode = null;
    this.initialized = false;
  }
  
  async initAudioContext() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if suspended (required for modern browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.connect(this.audioContext.destination);
      this.initialized = true;
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async loadSound(name, url) {
    try {
      await this.initAudioContext();
      if (!this.audioContext) return;
      
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

  async play(name, volume = 1.0) {
    try {
      await this.initAudioContext();
      if (!this.audioContext || !this.initialized) return;
      
      const soundBuffer = this.sounds.get(name);
      if (!soundBuffer) return;

      const source = this.audioContext.createBufferSource();
      source.buffer = soundBuffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error(`Failed to play sound: ${name}`, error);
    }
  }

  async playBGM(name, volume = 0.3) {
    try {
      await this.initAudioContext();
      if (!this.audioContext || !this.initialized) return;
      
      if (this.bgmSource) {
        this.bgmSource.stop();
      }
      const soundBuffer = this.sounds.get(name);
      if (!soundBuffer) return;

      this.bgmSource = this.audioContext.createBufferSource();
      this.bgmSource.buffer = soundBuffer;
      this.bgmSource.loop = true;

      this.bgmGainNode.gain.value = volume * this.bgmVolume * this.masterVolume;

      this.bgmSource.connect(this.bgmGainNode);
      this.bgmSource.start(0);
    } catch (error) {
      console.error(`Failed to play BGM: ${name}`, error);
    }
  }

  setMasterVolume(value) {
    this.masterVolume = parseFloat(value);
    // Update current BGM volume if playing
    if (this.bgmSource) {
      this.bgmGainNode.gain.value = this.bgmVolume * this.masterVolume;
    }
  }

  setBGMVolume(value) {
    this.bgmVolume = parseFloat(value);
    // Update current BGM volume if playing
    if (this.bgmSource) {
      this.bgmGainNode.gain.value = this.bgmVolume * this.masterVolume;
    }
  }

  setSFXVolume(value) {
    this.sfxVolume = parseFloat(value);
  }
}
