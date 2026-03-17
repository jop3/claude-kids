import * as Tone from 'tone';

const channels = new Map();
let masterChannel = null;
let reverbNode = null;

function getMasterChannel() {
  if (!masterChannel) {
    masterChannel = new Tone.Channel(0, 0).toDestination();
    reverbNode = new Tone.Reverb({ decay: 2, wet: 0.2 }).connect(masterChannel);
  }
  return masterChannel;
}

function getChannel(trackId) {
  if (!channels.has(trackId)) {
    const ch = new Tone.Channel(0, 0).connect(getMasterChannel());
    channels.set(trackId, ch);
  }
  return channels.get(trackId);
}

// Map 0–100 to -40dB–0dB
function volToDb(val) {
  if (val <= 0) return -Infinity;
  return ((val / 100) * 40) - 40;
}

function setVolume(trackId, val) {
  getChannel(trackId).volume.value = volToDb(val);
}

function setMasterVolume(val) {
  getMasterChannel().volume.value = volToDb(val);
}

function setPan(trackId, val) {
  // val: -50 to +50 → -1 to 1
  getChannel(trackId).pan.value = val / 50;
}

function setMute(trackId, bool) {
  getChannel(trackId).mute = bool;
}

function setSolo(trackId, bool) {
  if (bool) {
    // Mute all others, unmute this one
    channels.forEach((ch, id) => {
      ch.mute = id !== trackId;
    });
  } else {
    // Unmute all
    channels.forEach((ch) => {
      ch.mute = false;
    });
  }
}

function setMasterReverb(val) {
  getMasterChannel(); // ensure created
  if (reverbNode) {
    reverbNode.wet.value = val / 100;
  }
}

function removeChannel(trackId) {
  if (channels.has(trackId)) {
    try { channels.get(trackId).dispose(); } catch (_) {}
    channels.delete(trackId);
  }
}

export {
  getChannel,
  getMasterChannel,
  setVolume,
  setMasterVolume,
  setPan,
  setMute,
  setSolo,
  setMasterReverb,
  removeChannel,
};
