// Singleton AudioService for managing audio playback and preventing memory leaks
import { decodeAudioData } from './geminiService';

class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private activeSource: AudioBufferSourceNode | null = null;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private getContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }
    return this.audioContext;
  }

  async playAudio(audioBytes: Uint8Array): Promise<void> {
    // Stop any currently playing audio
    this.stopCurrentAudio();

    const ctx = this.getContext();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const buffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      this.activeSource = null;
    };

    this.activeSource = source;
    source.start();
  }

  stopCurrentAudio(): void {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.activeSource = null;
    }
  }

  cleanup(): void {
    this.stopCurrentAudio();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const audioService = AudioService.getInstance();
