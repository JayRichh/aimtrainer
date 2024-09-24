class AudioManager {
  private context: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer | null } = {};
  private volume: number = 1;
  private maxRetries: number = 3;

  constructor() {
    this.loadSounds();
  }

  private async loadSounds() {
    // const soundFiles = {
    //   gunshot: '/sounds/gunshot.mp3',
    //   hit: '/sounds/hit.wav',
    //   // backgroundMusic: '/sounds/itstime.mp3'
    // };

    // for (const [name, path] of Object.entries(soundFiles)) {
    //   await this.loadSound(name, path);
    // }
  }

  // private async loadSound(name: string, path: string, retryCount: number = 0) {
  //   try {
  //     const response = await fetch(path);
  //     const arrayBuffer = await response.arrayBuffer();
  //     this.sounds[name] = await this.decodeAudioData(arrayBuffer);
  //     console.log(`Sound ${name} loaded successfully`);
  //   } catch (error) {
  //     console.error(`Error loading sound ${name}:`, error);
  //     if (retryCount < this.maxRetries) {
  //       console.log(`Retrying to load sound ${name}. Attempt ${retryCount + 1} of ${this.maxRetries}`);
  //       await this.loadSound(name, path, retryCount + 1);
  //     } else {
  //       console.warn(`Failed to load sound ${name} after ${this.maxRetries} attempts. Using null as fallback.`);
  //       this.sounds[name] = null;
  //     }
  //   }
  // }

  private getAudioContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  private async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.getAudioContext().decodeAudioData(
        arrayBuffer,
        (buffer) => resolve(buffer),
        (error) => reject(error)
      );
    });
  }

  async playSound(soundName: string) {
    if (this.sounds[soundName]) {
      try {
        const source = this.getAudioContext().createBufferSource();
        source.buffer = this.sounds[soundName]!;
        const gainNode = this.getAudioContext().createGain();
        gainNode.gain.setValueAtTime(this.volume, this.getAudioContext().currentTime);
        source.connect(gainNode);
        gainNode.connect(this.getAudioContext().destination);
        source.start();
      } catch (error) {
        console.error(`Error playing sound ${soundName}:`, error);
      }
    } else {
      console.warn(`Sound ${soundName} not found or failed to load. Skipping playback.`);
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
  }

  resumeAudioContext() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume().then(() => {
        console.log('AudioContext resumed successfully');
      }).catch(error => {
        console.error('Failed to resume AudioContext:', error);
      });
    }
  }
}

export const audioManager = new AudioManager();