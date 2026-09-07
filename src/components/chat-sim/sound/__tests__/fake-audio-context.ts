// A minimal, structural fake of `AudioContextLike` — no jsdom polyfill for Web Audio exists (or
// is installed here), so AudioSink's tests inject this instead of a real `AudioContext`. It only
// implements what AudioSink actually calls, and records every start()/stop() so tests can assert
// on scheduling and cancellation without needing real audio hardware or a browser.

import type {
  AudioBufferLike,
  AudioBufferSourceNodeLike,
  AudioContextLike,
  AudioNodeLike,
  GainNodeLike,
} from '../audio-sink';

export class FakeAudioContext implements AudioContextLike {
  currentTime = 0;
  readonly destination: AudioNodeLike = { connect: () => {} };
  readonly startedSources: FakeBufferSource[] = [];

  createGain(): GainNodeLike {
    return { gain: { value: 1 }, connect: () => {} };
  }

  createBuffer(numberOfChannels: number, length: number, sampleRate: number): AudioBufferLike {
    const channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
    void sampleRate;
    return {
      copyToChannel: (source, channel) => channels[channel].set(source),
      getChannelData: (channel) => channels[channel],
    };
  }

  createBufferSource(): AudioBufferSourceNodeLike {
    const node = new FakeBufferSource();
    this.startedSources.push(node);
    return node;
  }
}

class FakeBufferSource implements AudioBufferSourceNodeLike {
  buffer: AudioBufferLike | null = null;
  #endedListeners: (() => void)[] = [];
  started = false;
  stopped = false;

  connect(): AudioNodeLike {
    return this;
  }

  addEventListener(type: 'ended', listener: () => void): void {
    void type;
    this.#endedListeners.push(listener);
  }

  start(): void {
    this.started = true;
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.#endedListeners.forEach((l) => l());
  }
}
