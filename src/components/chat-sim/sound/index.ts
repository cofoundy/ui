// sound/ barrel — T-006's scope.write cell ([skin], file-ownership-matrix.md).

export type { Cue, CueLayer, CuePack, Wave } from './types';
export { renderCue, renderLayer, renderPack, pcmDigest, SAMPLE_RATE } from './synth';
export { DEFAULT_CUE_PACK } from './packs';
export { AudioSink } from './audio-sink';
export type {
  AudioContextLike,
  AudioNodeLike,
  AudioBufferLike,
  AudioBufferSourceNodeLike,
  AudioParamLike,
  GainNodeLike,
} from './audio-sink';
