// capture/'s own local barrel — NOT the chat-sim subpath barrel (../index.ts is [core]'s W cell,
// api-contract.md §"Árbol"; file-ownership-matrix.md gives capture only `A` there). Imported by
// this family's tests and by scripts/capture-chat.mjs's TS entry (cli.ts) via a relative path.

export {
  captureFrame,
  closeCaptureSession,
  openCaptureSession,
  type CaptureFrameOptions,
} from './captureFrame';
export { tickToStep } from './tickToStep';
export { buildSettleScript, type CaptureRecipe, type SettleScriptOptions } from './settleScript';
export { listSessions } from './agentBrowser';
