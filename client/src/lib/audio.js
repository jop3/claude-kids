import * as Tone from 'tone';

let audioReady = false;

export async function startAudio() {
  await Tone.start();
  audioReady = true;
}

export function isAudioReady() {
  return audioReady;
}

export function getTransport() {
  return Tone.getTransport();
}

export function setBpm(bpm) {
  Tone.getTransport().bpm.value = bpm;
}

export function startTransport() {
  Tone.getTransport().start();
}

export function stopTransport() {
  Tone.getTransport().stop();
  Tone.getTransport().position = 0;
}

export { Tone };
