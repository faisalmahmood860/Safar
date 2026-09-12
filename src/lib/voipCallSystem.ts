export type CallStatus = 'idle' | 'dialing' | 'ringing' | 'connected' | 'ended' | 'declined';

export interface CallParticipant {
  id: string;
  name: string;
  phone: string;
  truck?: string;
  role: 'driver' | 'fleet_owner' | 'shipper';
  avatarUrl?: string;
}

export interface CallSession {
  callId: string;
  status: CallStatus;
  direction: 'outgoing' | 'incoming';
  peer: CallParticipant;
  durationSeconds: number;
  isMuted: boolean;
  isSpeaker: boolean;
  startTime?: number;
}

// Global active call session state
let currentCallSession: CallSession | null = null;
let timerInterval: NodeJS.Timeout | null = null;

// Audio Context for synthesizing phone ringtones, ringbacks, and chimes without external assets
let audioCtx: AudioContext | null = null;
let activeToneOscillators: OscillatorNode[] = [];
let ringtoneLoopTimer: NodeJS.Timeout | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAllCallTones() {
  if (ringtoneLoopTimer) {
    clearInterval(ringtoneLoopTimer);
    ringtoneLoopTimer = null;
  }
  activeToneOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // ignore
    }
  });
  activeToneOscillators = [];
}

// Play outgoing ringback tone (soft dual beep: 440Hz + 480Hz)
export function playRingbackTone() {
  stopAllCallTones();
  const ctx = getAudioContext();
  if (!ctx) return;

  const playBeep = () => {
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.8);
      osc2.stop(ctx.currentTime + 1.8);

      activeToneOscillators.push(osc1, osc2);
    } catch (e) {
      console.error('Ringback error', e);
    }
  };

  playBeep();
  ringtoneLoopTimer = setInterval(playBeep, 3500);
}

// Play incoming ringtone (rhythmic Pakistani phone chime: 750Hz - 950Hz)
export function playIncomingRingtone() {
  stopAllCallTones();
  const ctx = getAudioContext();
  if (!ctx) return;

  const playRing = () => {
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
      activeToneOscillators.push(osc);
    } catch (e) {
      console.error('Incoming ringtone error', e);
    }
  };

  playRing();
  ringtoneLoopTimer = setInterval(playRing, 1200);
}

// Play call connected chime (bright harmonic chord)
export function playCallConnectedChime() {
  stopAllCallTones();
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.6);
    });
  } catch (e) {
    console.error(e);
  }
}

// Play call ended tone (falling dual tone)
export function playCallEndedTone() {
  stopAllCallTones();
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch (e) {
    console.error(e);
  }
}

// Helper to broadcast state changes to React listeners across the app
function notifyCallStateChange(session: CallSession | null) {
  currentCallSession = session;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('safarload_voip_call_change', { detail: session }));
  }
}

export function getCurrentCallSession(): CallSession | null {
  return currentCallSession;
}

// Initiate an outgoing call from Fleet Owner to Driver
export function initiateVoIPCall(peer: CallParticipant): CallSession {
  stopAllCallTones();
  if (timerInterval) clearInterval(timerInterval);

  const session: CallSession = {
    callId: `CALL-${Date.now().toString().slice(-6)}`,
    status: 'dialing',
    direction: 'outgoing',
    peer,
    durationSeconds: 0,
    isMuted: false,
    isSpeaker: true,
  };

  notifyCallStateChange(session);
  playRingbackTone();

  // Simulate ringing after 1.5 seconds, then auto-connecting call after 4 seconds
  setTimeout(() => {
    if (currentCallSession && currentCallSession.callId === session.callId && currentCallSession.status === 'dialing') {
      currentCallSession.status = 'ringing';
      notifyCallStateChange({ ...currentCallSession });
    }
  }, 1500);

  setTimeout(() => {
    if (currentCallSession && currentCallSession.callId === session.callId && (currentCallSession.status === 'dialing' || currentCallSession.status === 'ringing')) {
      connectVoIPCall();
    }
  }, 4000);

  return session;
}

// Simulate an incoming call from Driver to Fleet Owner
export function triggerIncomingDriverCall(driver: CallParticipant): CallSession {
  stopAllCallTones();
  if (timerInterval) clearInterval(timerInterval);

  const session: CallSession = {
    callId: `CALL-${Date.now().toString().slice(-6)}`,
    status: 'ringing',
    direction: 'incoming',
    peer: driver,
    durationSeconds: 0,
    isMuted: false,
    isSpeaker: true,
  };

  notifyCallStateChange(session);
  playIncomingRingtone();

  return session;
}

// Accept an incoming call
export function acceptVoIPCall() {
  if (!currentCallSession) return;
  connectVoIPCall();
}

// Internal connect logic
function connectVoIPCall() {
  if (!currentCallSession) return;

  stopAllCallTones();
  playCallConnectedChime();

  currentCallSession.status = 'connected';
  currentCallSession.startTime = Date.now();
  notifyCallStateChange({ ...currentCallSession });

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (currentCallSession && currentCallSession.status === 'connected') {
      currentCallSession.durationSeconds += 1;
      notifyCallStateChange({ ...currentCallSession });
    }
  }, 1000);
}

// Mute/Unmute microphone
export function toggleCallMute(): boolean {
  if (!currentCallSession) return false;
  currentCallSession.isMuted = !currentCallSession.isMuted;
  notifyCallStateChange({ ...currentCallSession });
  return currentCallSession.isMuted;
}

// Toggle speaker/earpiece
export function toggleCallSpeaker(): boolean {
  if (!currentCallSession) return false;
  currentCallSession.isSpeaker = !currentCallSession.isSpeaker;
  notifyCallStateChange({ ...currentCallSession });
  return currentCallSession.isSpeaker;
}

// Decline incoming call
export function declineVoIPCall() {
  if (!currentCallSession) return;
  stopAllCallTones();
  playCallEndedTone();

  currentCallSession.status = 'declined';
  notifyCallStateChange({ ...currentCallSession });

  setTimeout(() => {
    notifyCallStateChange(null);
  }, 1800);
}

// End current call
export function endVoIPCall() {
  if (!currentCallSession) return;
  stopAllCallTones();
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  playCallEndedTone();
  currentCallSession.status = 'ended';
  notifyCallStateChange({ ...currentCallSession });

  setTimeout(() => {
    notifyCallStateChange(null);
  }, 1800);
}

// Utility to format call timer: e.g. 75 -> "01:15"
export function formatCallTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(mins)}:${pad(secs)}`;
}
