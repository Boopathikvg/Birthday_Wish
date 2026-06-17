/* ==========================================================================
   1. FLOATING HEARTS CANVAS BACKGROUND
   ========================================================================== */
const canvas = document.getElementById('hearts-canvas');
const ctx = canvas.getContext('2d');

let hearts = [];
const heartColors = [
  'rgba(244, 63, 94, 0.25)',  /* Rose */
  'rgba(251, 113, 133, 0.2)',  /* Light Rose */
  'rgba(244, 63, 94, 0.15)',  /* Semi-transparent Rose */
  'rgba(255, 255, 255, 0.4)',  /* White-pink highlights */
  'rgba(253, 164, 175, 0.25)'  /* Soft pink */
];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class HeartParticle {
  constructor() {
    this.reset();
    // Start randomly distributed across the screen height initially
    this.y = Math.random() * canvas.height;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 50;
    this.size = Math.random() * 12 + 8; // Size in pixels
    this.speed = Math.random() * 0.8 + 0.4; // Upward speed
    
    // Position-based color distribution: left dark, right light, center mixed
    const darkPinks = [
      'rgba(136, 19, 55, 0.35)',   /* Rose 900 */
      'rgba(190, 18, 60, 0.35)',    /* Rose 700 */
      'rgba(219, 39, 119, 0.35)'    /* Pink 600 */
    ];
    const lightPinks = [
      'rgba(255, 241, 242, 0.5)',   /* Rose 50 */
      'rgba(254, 205, 211, 0.45)',  /* Rose 100 */
      'rgba(255, 255, 255, 0.5)'    /* Pure white */
    ];
    const mixedPinks = [
      ...darkPinks,
      ...lightPinks,
      'rgba(244, 63, 94, 0.35)',    /* Rose 500 */
      'rgba(251, 113, 133, 0.35)'   /* Rose 300 */
    ];

    if (this.x < canvas.width * 0.35) {
      this.color = darkPinks[Math.floor(Math.random() * darkPinks.length)];
    } else if (this.x > canvas.width * 0.65) {
      this.color = lightPinks[Math.floor(Math.random() * lightPinks.length)];
    } else {
      this.color = mixedPinks[Math.floor(Math.random() * mixedPinks.length)];
    }

    this.angle = Math.random() * Math.PI * 2;
    this.wobbleSpeed = Math.random() * 0.02 + 0.01;
    this.wobbleRange = Math.random() * 1.5 + 0.5;
  }

  update() {
    this.y -= this.speed;
    this.angle += this.wobbleSpeed;
    this.x += Math.sin(this.angle) * this.wobbleRange * 0.3;

    // Reset if it goes off screen
    if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    // Draw heart path
    const topCurveHeight = this.size * 0.3;
    ctx.translate(this.x, this.y);
    ctx.moveTo(0, topCurveHeight);
    
    // Left side of heart
    ctx.bezierCurveTo(
      -this.size / 2, -this.size / 2, 
      -this.size, topCurveHeight, 
      0, this.size
    );
    
    // Right side of heart
    ctx.bezierCurveTo(
      this.size, topCurveHeight, 
      this.size / 2, -this.size / 2, 
      0, topCurveHeight
    );
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Populate hearts
const heartCount = Math.min(80, Math.floor(window.innerWidth / 15));
for (let i = 0; i < heartCount; i++) {
  hearts.push(new HeartParticle());
}

function animateHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach(heart => {
    heart.update();
    heart.draw();
  });
  requestAnimationFrame(animateHearts);
}
animateHearts();


/* ==========================================================================
   2. SPA PAGE NAVIGATION SYSTEM
   ========================================================================== */
let currentPage = 1;

function goToPage(pageNum) {
  const activePage = document.querySelector('.page.active');
  const targetPage = document.getElementById(`page-${pageNum}`);
  
  if (!targetPage || pageNum === currentPage) return;
  
  // Transition out active page
  if (activePage) {
    activePage.classList.add('transition-out');
    
    // Wait for transition to complete
    setTimeout(() => {
      activePage.classList.remove('active', 'transition-out');
      targetPage.classList.add('active');
      currentPage = pageNum;
      
      // Page hooks
      onPageEnter(pageNum);
    }, 500); // matches CSS transition duration
  } else {
    targetPage.classList.add('active');
    currentPage = pageNum;
    onPageEnter(pageNum);
  }
}

function onPageEnter(pageNum) {
  // Page 3 hook: trigger the 4-second delay & roaming
  if (pageNum === 3) {
    startRoamingSequence();
  }
  
  // Page 4 hook: update needle and rotation if music is playing, start fireworks
  if (pageNum === 4) {
    updatePlayerUI();
    startFireworks();
  } else {
    stopFireworks();
  }
}

function restartJourney() {
  // Reset all elements
  document.getElementById('btn-to-page-3').disabled = true;
  document.getElementById('btn-to-page-4').disabled = true;
  
  // Reset envelopes
  const envSingle = document.getElementById('env-single');
  if (envSingle) {
    envSingle.classList.remove('open', 'zoomed-left', 'zoomed-right');
  }
  
  // Reset roaming
  const loader = document.getElementById('magic-loader');
  loader.style.opacity = '1';
  loader.style.display = 'flex';
  
  const card1 = document.getElementById('roaming-card-1');
  const card2 = document.getElementById('roaming-card-2');
  card1.style.opacity = '0';
  card2.style.opacity = '0';
  card1.style.transform = 'scale(0)';
  card2.style.transform = 'scale(0)';
  if (roamingInterval) {
    cancelAnimationFrame(roamingInterval);
    roamingInterval = null;
  }
  
  goToPage(1);
}


/* ==========================================================================
   3. PAGE 2: ENVELOPE SEALS & INTERACTION
   ========================================================================== */
function openSingleEnvelope() {
  const wrapper = document.getElementById('env-single');
  if (!wrapper) return;
  
  if (!wrapper.classList.contains('open')) {
    // Open the single envelope
    wrapper.classList.add('open');
    playChimeEffect(523.25, 0.15); // C note pop
    
    // Zoom click fanning listeners
    const letterLeft = wrapper.querySelector('.letter-left');
    const letterRight = wrapper.querySelector('.letter-right');
    
    letterLeft.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.remove('zoomed-right');
      wrapper.classList.toggle('zoomed-left');
    });
    
    letterRight.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.remove('zoomed-left');
      wrapper.classList.toggle('zoomed-right');
    });

    // Enable button to page 3
    setTimeout(() => {
      document.getElementById('btn-to-page-3').disabled = false;
      document.getElementById('btn-to-page-3').classList.add('animate-pulse');
    }, 1300);
  }
}


/* ==========================================================================
   4. PAGE 3: HIDDEN TIMED ROAMING ANIMATION
   ========================================================================== */
let roamingInterval = null;

function startRoamingSequence() {
  const loader = document.getElementById('magic-loader');
  const viewport = document.getElementById('roaming-viewport');
  const card1 = document.getElementById('roaming-card-1');
  const card2 = document.getElementById('roaming-card-2');
  const nextBtn = document.getElementById('btn-to-page-4');
  
  // Reset states
  loader.style.opacity = '1';
  loader.style.display = 'flex';
  card1.style.opacity = '0';
  card2.style.opacity = '0';
  card1.style.transform = 'scale(0)';
  card2.style.transform = 'scale(0)';
  nextBtn.disabled = true;
  nextBtn.classList.remove('animate-pulse');

  // Cancel any existing loop
  if (roamingInterval) {
    cancelAnimationFrame(roamingInterval);
    roamingInterval = null;
  }

  // Phase 1: 2 Seconds Hidden delay (reduced from 4s)
  setTimeout(() => {
    // Transition loader out
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      
      // Phase 2: Burst onto screen and begin roaming
      initRoamingPhysics(viewport, card1, card2, nextBtn);
    }, 500);
  }, 2000); // 2 Seconds
}

function initRoamingPhysics(viewport, card1, card2, nextBtn) {
  const cards = [
    { el: card1, x: 0, y: 0, vx: 0, vy: 0, width: 170, height: 230, targetRot: 0, rot: -1.5 },
    { el: card2, x: 0, y: 0, vx: 0, vy: 0, width: 170, height: 230, targetRot: 0, rot: 1.5 }
  ];

  const rect = viewport.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  // Set start positions at center of viewport
  cards.forEach((card, idx) => {
    card.el.style.opacity = '1';
    card.el.style.transform = 'scale(1)';
    card.x = (w - card.width) / 2 + (idx === 0 ? -40 : 40);
    card.y = (h - card.height) / 2;
    
    // Slower velocity burst (reduced speed)
    card.vx = (Math.random() * 2 + 1.25) * (Math.random() > 0.5 ? 1 : -1);
    card.vy = (Math.random() * 2 + 1.25) * (Math.random() > 0.5 ? 1 : -1);
  });

  const startTime = Date.now();
  const roamingDuration = 1800; // Reduced roaming duration (1.8s instead of 3.5s)

  function update() {
    const elapsed = Date.now() - startTime;
    
    if (elapsed < roamingDuration) {
      // Roaming Phase
      cards.forEach(card => {
        // Move card
        card.x += card.vx;
        card.y += card.vy;

        // Bounce Left/Right
        if (card.x <= 0) {
          card.x = 0;
          card.vx = -card.vx * (0.9 + Math.random() * 0.2); // slight random restitution
        } else if (card.x >= w - card.width) {
          card.x = w - card.width;
          card.vx = -card.vx * (0.9 + Math.random() * 0.2);
        }

        // Bounce Top/Bottom
        if (card.y <= 0) {
          card.y = 0;
          card.vy = -card.vy * (0.9 + Math.random() * 0.2);
        } else if (card.y >= h - card.height) {
          card.y = h - card.height;
          card.vy = -card.vy * (0.9 + Math.random() * 0.2);
        }

        // Rotate dynamically based on velocity
        card.rot = (card.vx * 1.5);

        // Apply styles
        card.el.style.left = `${card.x}px`;
        card.el.style.top = `${card.y}px`;
        card.el.style.transform = `rotate(${card.rot}deg)`;
      });

      roamingInterval = requestAnimationFrame(update);
    } else {
      // Decelerate & Settle Phase (gliding to layout grid)
      settleCards(cards, w, h, nextBtn);
    }
  }

  roamingInterval = requestAnimationFrame(update);
}

function settleCards(cards, w, h, nextBtn) {
  let progress = 0;
  const settleDuration = 700; // Reduced glide duration (0.7s instead of 1.0s)
  const startTime = Date.now();

  // Final settled positions:
  // Card 1 on left side, Card 2 on right side, vertically centered
  // Handle mobile width adjustments
  const isMobile = window.innerWidth <= 768;
  const finalCoords = isMobile ? [
    { x: (w - cards[0].width) / 2, y: 15, rot: -3 },
    { x: (w - cards[1].width) / 2, y: h - cards[1].height - 15, rot: 3 }
  ] : [
    { x: (w / 2) - cards[0].width - 25, y: (h - cards[0].height) / 2, rot: -4 },
    { x: (w / 2) + 25, y: (h - cards[1].height) / 2, rot: 4 }
  ];

  // Capture current positions
  const startCoords = cards.map(c => ({ x: c.x, y: c.y, rot: c.rot }));

  function glide() {
    const elapsed = Date.now() - startTime;
    progress = Math.min(1, elapsed / settleDuration);
    
    // Easing: easeOutCubic
    const ease = 1 - Math.pow(1 - progress, 3);

    cards.forEach((card, idx) => {
      const start = startCoords[idx];
      const end = finalCoords[idx];
      
      card.x = start.x + (end.x - start.x) * ease;
      card.y = start.y + (end.y - start.y) * ease;
      card.rot = start.rot + (end.rot - start.rot) * ease;

      card.el.style.left = `${card.x}px`;
      card.el.style.top = `${card.y}px`;
      card.el.style.transform = `rotate(${card.rot}deg)`;
    });

    if (progress < 1) {
      roamingInterval = requestAnimationFrame(glide);
    } else {
      // Settled! Enable cards for zooming
      cards.forEach(card => {
        card.el.addEventListener('click', () => {
          card.el.classList.toggle('zoomed-card-roaming');
          // Add inline scaling style for zoom
          if (card.el.classList.contains('zoomed-card-roaming')) {
            card.el.style.zIndex = '50';
            card.el.style.transform = 'scale(1.6) rotate(0deg)';
          } else {
            card.el.style.zIndex = '10';
            const index = cards.indexOf(card);
            card.el.style.transform = `rotate(${finalCoords[index].rot}deg)`;
          }
        });
      });

      // Enable navigation button
      nextBtn.disabled = false;
      nextBtn.classList.add('animate-pulse');
      
      // Little success chime
      playChimeEffect(587.33, 0.2); // Sweet D note
    }
  }

  roamingInterval = requestAnimationFrame(glide);
}


/* ==========================================================================
   5. WEB AUDIO SYNTHESIZER (MUSIC BOX FALLBACK)
   ========================================================================== */
let audioCtx = null;
let isSynthPlaying = false;
let synthTimeout = null;
let currentSynthNoteIdx = 0;
let synthStartTime = 0;
let noteSchedulers = [];

// Notes for "Happy Birthday to You"
// frequencies: C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, Bb4=466.16, C5=523.25
const melodyNotes = [
  { note: 'C4', freq: 261.63, duration: 0.5 },
  { note: 'C4', freq: 261.63, duration: 0.25 },
  { note: 'D4', freq: 293.66, duration: 0.75 },
  { note: 'C4', freq: 261.63, duration: 0.75 },
  { note: 'F4', freq: 349.23, duration: 0.75 },
  { note: 'E4', freq: 329.63, duration: 1.5 },
  
  // Pause
  { note: 'REST', freq: 0, duration: 0.25 },
  
  { note: 'C4', freq: 261.63, duration: 0.5 },
  { note: 'C4', freq: 261.63, duration: 0.25 },
  { note: 'D4', freq: 293.66, duration: 0.75 },
  { note: 'C4', freq: 261.63, duration: 0.75 },
  { note: 'G4', freq: 392.00, duration: 0.75 },
  { note: 'F4', freq: 349.23, duration: 1.5 },
  
  // Pause
  { note: 'REST', freq: 0, duration: 0.25 },
  
  { note: 'C4', freq: 261.63, duration: 0.5 },
  { note: 'C4', freq: 261.63, duration: 0.25 },
  { note: 'C5', freq: 523.25, duration: 0.75 },
  { note: 'A4', freq: 440.00, duration: 0.75 },
  { note: 'F4', freq: 349.23, duration: 0.75 },
  { note: 'E4', freq: 329.63, duration: 0.75 },
  { note: 'D4', freq: 293.66, duration: 1.5 },
  
  // Pause
  { note: 'REST', freq: 0, duration: 0.25 },
  
  { note: 'Bb4', freq: 466.16, duration: 0.5 },
  { note: 'Bb4', freq: 466.16, duration: 0.25 },
  { note: 'A4', freq: 440.00, duration: 0.75 },
  { note: 'F4', freq: 349.23, duration: 0.75 },
  { note: 'G4', freq: 392.00, duration: 0.75 },
  { note: 'F4', freq: 349.23, duration: 1.75 },
  
  // Loop buffer
  { note: 'REST', freq: 0, duration: 1.0 }
];

// Calculate cumulative timing offsets
let songDuration = 0;
melodyNotes.forEach(n => {
  n.timeOffset = songDuration;
  songDuration += n.duration * 1.1; // scale duration slightly for tempo
});

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Quick chime sound effect for interactions
function playChimeEffect(freq, duration) {
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore context blocked errors on start
  }
}

// Pluck Synth Note (Chimes/Music Box style)
function playSynthNote(freq, startTime, duration) {
  if (freq === 0) return; // Rest note

  const osc = audioCtx.createOscillator();
  const oscSub = audioCtx.createOscillator(); // Sub overtone for warmth
  const gainNode = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);
  
  // Subtle music box metallic chime overtone
  oscSub.type = 'triangle';
  oscSub.frequency.setValueAtTime(freq * 2, startTime); // One octave higher

  // Filter out harsh highs for cozy chimes
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, startTime);
  filter.Q.setValueAtTime(1, startTime);

  // Pluck Gain Envelope
  const volume = volumeLevel * 0.15; // bound volume
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02); // fast attack
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // smooth pluck decay

  osc.connect(filter);
  oscSub.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start(startTime);
  oscSub.start(startTime);
  
  osc.stop(startTime + duration + 0.1);
  oscSub.stop(startTime + duration + 0.1);

  // Keep track to stop if paused
  noteSchedulers.push(osc, oscSub);
}

function startSynthMelody() {
  initAudioContext();
  isSynthPlaying = true;
  synthStartTime = audioCtx.currentTime;
  
  // Reset index
  currentSynthNoteIdx = 0;
  scheduleNextSynthNotes();
}

function scheduleNextSynthNotes() {
  if (!isSynthPlaying) return;

  const lookAhead = 0.5; // Schedule 500ms in advance
  const now = audioCtx.currentTime;

  melodyNotes.forEach(note => {
    const scheduledTime = synthStartTime + note.timeOffset;
    
    // Schedule notes that fall into our forward window
    if (scheduledTime >= now && scheduledTime < now + lookAhead) {
      playSynthNote(note.freq, scheduledTime, note.duration * 1.0);
    }
  });

  // Check if we finished the loop
  const totalLength = songDuration;
  const elapsed = now - synthStartTime;

  if (elapsed >= totalLength) {
    // Loop
    synthStartTime = now;
  }

  // Update Progress Bar
  const percent = ((elapsed % totalLength) / totalLength) * 100;
  if (!isDraggingSlider) {
    seekBar.value = percent;
    updateTimeLabels(elapsed % totalLength, totalLength);
  }

  // Poll scheduler every 100ms
  synthTimeout = setTimeout(scheduleNextSynthNotes, 100);
}

function stopSynthMelody() {
  isSynthPlaying = false;
  clearTimeout(synthTimeout);
  
  // Stop all active nodes
  noteSchedulers.forEach(node => {
    try {
      node.stop();
    } catch(e) {}
  });
  noteSchedulers = [];
}


/* ==========================================================================
   6. DUAL-MODE AUDIO PLAYER INTERFACE
   ========================================================================== */
const bgAudio = document.getElementById('bg-music');
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const vinylDisc = document.getElementById('vinyl-disc');
const playerWrapper = document.querySelector('.player-wrapper');
const miniPlayer = document.getElementById('mini-player');
const miniPlayerIcon = document.getElementById('mini-player-icon');

const seekBar = document.getElementById('seek-bar');
const timeCurrentLabel = document.getElementById('time-current');
const timeTotalLabel = document.getElementById('time-total');
const volumeSlider = document.getElementById('volume-slider');

let isPlaying = false;
let isAudioFileLoaded = false;
let volumeLevel = 0.8;
let isDraggingSlider = false;

// Check if audio file exists and can load
bgAudio.addEventListener('canplaythrough', () => {
  isAudioFileLoaded = true;
  timeTotalLabel.textContent = formatTime(bgAudio.duration);
});

bgAudio.addEventListener('error', () => {
  // Gracefully handle missing file - synth is ready
  isAudioFileLoaded = false;
});

// Update progress slider for actual MP3 playing
bgAudio.addEventListener('timeupdate', () => {
  if (isPlaying && isAudioFileLoaded && !isDraggingSlider) {
    const pct = (bgAudio.currentTime / bgAudio.duration) * 100;
    seekBar.value = pct;
    updateTimeLabels(bgAudio.currentTime, bgAudio.duration);
  }
});

// Sync total duration once meta loads
bgAudio.addEventListener('durationchange', () => {
  if (isAudioFileLoaded) {
    timeTotalLabel.textContent = formatTime(bgAudio.duration);
  }
});

bgAudio.addEventListener('ended', () => {
  if (isAudioFileLoaded) {
    bgAudio.currentTime = 0;
    bgAudio.play();
  }
});

// SeekBar dragging listeners
seekBar.addEventListener('input', () => {
  isDraggingSlider = true;
});

seekBar.addEventListener('change', () => {
  isDraggingSlider = false;
  const pct = parseFloat(seekBar.value) / 100;
  
  if (isAudioFileLoaded) {
    bgAudio.currentTime = pct * bgAudio.duration;
  } else {
    // Synth seek is simulated by resetting start time offset
    if (isPlaying) {
      stopSynthMelody();
      initAudioContext();
      synthStartTime = audioCtx.currentTime - (pct * songDuration);
      isSynthPlaying = true;
      scheduleNextSynthNotes();
    }
  }
});

// Volume listener
volumeSlider.addEventListener('input', () => {
  volumeLevel = parseFloat(volumeSlider.value) / 100;
  bgAudio.volume = volumeLevel;
});

function formatTime(secs) {
  if (isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateTimeLabels(current, total) {
  timeCurrentLabel.textContent = formatTime(current);
  timeTotalLabel.textContent = formatTime(total);
}

// Toggle Audio Playback (Play/Pause button click)
function toggleAudioPlayback() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function playAudio() {
  isPlaying = true;
  
  // Try to play MP3 file
  if (isAudioFileLoaded) {
    bgAudio.play()
      .then(() => {
        updatePlayerUI();
      })
      .catch(err => {
        // Autoplay blocked or file load error, fallback to synth
        isAudioFileLoaded = false;
        playSynthFallback();
      });
  } else {
    playSynthFallback();
  }
}

function playSynthFallback() {
  try {
    startSynthMelody();
    updatePlayerUI();
  } catch (e) {
    // Audio Context might require click interaction
    isPlaying = false;
    updatePlayerUI();
  }
}

function pauseAudio() {
  isPlaying = false;
  bgAudio.pause();
  stopSynthMelody();
  updatePlayerUI();
}

function updatePlayerUI() {
  if (isPlaying) {
    // Change icon to pause
    playIcon.className = "ri-pause-fill";
    
    // Spin disc
    vinylDisc.classList.add('playing');
    playerWrapper.classList.add('playing');
    
    // Spin mini floating controller
    miniPlayer.classList.add('playing');
    miniPlayerIcon.className = "ri-music-2-fill";
  } else {
    // Change icon to play
    playIcon.className = "ri-play-fill";
    
    // Stop disc
    vinylDisc.classList.remove('playing');
    playerWrapper.classList.remove('playing');
    
    // Stop mini floating controller
    miniPlayer.classList.remove('playing');
    miniPlayerIcon.className = "ri-volume-mute-fill";
  }
}

// Audio skipping
function skipAudio(seconds) {
  if (isAudioFileLoaded) {
    let t = bgAudio.currentTime + seconds;
    if (t < 0) t = 0;
    if (t > bgAudio.duration) t = bgAudio.duration;
    bgAudio.currentTime = t;
  } else {
    if (isPlaying) {
      stopSynthMelody();
      initAudioContext();
      
      let elapsed = audioCtx.currentTime - synthStartTime + seconds;
      if (elapsed < 0) elapsed = 0;
      if (elapsed > songDuration) elapsed = songDuration;
      
      synthStartTime = audioCtx.currentTime - elapsed;
      isSynthPlaying = true;
      scheduleNextSynthNotes();
    }
  }
}

// Global top-right button toggle
function toggleGlobalAudio() {
  toggleAudioPlayback();
}

/* ==========================================================================
   7. CRACKER/FIREWORKS ANIMATION FOR THE LAST PAGE (HEARTS, CHOCOLATES, ETC)
   ========================================================================== */
const fwCanvas = document.getElementById('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');

let fwParticles = [];
let fwRockets = [];
let isFireworksActive = false;
let autoLaunchTimeout = null;

const blastEmojis = ['❤️', '💖', '🍫', '🍫', '🎂', '🎁', '🎈', '⭐', '✨', '🍬', '🍭', '🌸'];

function resizeFwCanvas() {
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeFwCanvas);
resizeFwCanvas();

class FwParticle {
  constructor(x, y, char, color) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.color = color || '#ff477e';
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 8 + 4; // Greater radial blast velocity (big blast)
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.gravity = 0.07; // Slow downward drift (cascading effect)
    this.drag = 0.965; // Retain velocity slightly longer (bigger range)
    this.opacity = 1;
    this.fade = Math.random() * 0.01 + 0.006; // Slower fade for long-lasting explosion
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.1;
    this.size = Math.random() * 10 + 20; // Larger font size for emoji
  }

  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.opacity -= this.fade;
    this.rotation += this.rotSpeed;
  }

  draw() {
    if (this.opacity <= 0) return;
    fwCtx.save();
    fwCtx.globalAlpha = this.opacity;
    fwCtx.translate(this.x, this.y);
    fwCtx.rotate(this.rotation);
    
    if (this.char) {
      // Render Emoji
      fwCtx.font = `${this.size}px sans-serif`;
      fwCtx.textAlign = 'center';
      fwCtx.textBaseline = 'middle';
      fwCtx.fillText(this.char, 0, 0);
    } else {
      // Render Sparkles
      fwCtx.fillStyle = this.color;
      fwCtx.beginPath();
      fwCtx.arc(0, 0, Math.random() * 2 + 1.5, 0, Math.PI * 2);
      fwCtx.fill();
    }
    
    fwCtx.restore();
  }
}


// Polaroid photo particle fanning out from the photo blast
class PhotoParticle {
  constructor(x, y, img) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 5 + 3.2; // Radial blast velocity
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.gravity = 0.06; // Drift downwards like paper
    this.drag = 0.97; // Slower air drag deceleration
    this.opacity = 1;
    this.fade = 0.0055; // Fade extremely slowly so she can view the photos!
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.05;
    this.width = 65; // Canvas width of polaroid card
    this.height = 82; // Canvas height of polaroid card
  }

  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.opacity -= this.fade;
    this.rotation += this.rotSpeed;
  }

  draw() {
    if (this.opacity <= 0 || !this.img || !this.img.complete) return;
    fwCtx.save();
    fwCtx.globalAlpha = this.opacity;
    fwCtx.translate(this.x, this.y);
    fwCtx.rotate(this.rotation);
    
    // Draw white polaroid frame
    fwCtx.fillStyle = '#ffffff';
    fwCtx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    fwCtx.shadowBlur = 5;
    fwCtx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    fwCtx.shadowBlur = 0; // reset
    
    // Draw internal photo content
    const border = 4.5;
    const imgW = this.width - border * 2;
    const imgH = this.height - border * 3 - 6;
    fwCtx.drawImage(
      this.img, 
      -this.width / 2 + border, 
      -this.height / 2 + border, 
      imgW, 
      imgH
    );
    
    // Tiny decorative heart
    fwCtx.fillStyle = '#f43f5e';
    fwCtx.font = '8px sans-serif';
    fwCtx.textAlign = 'center';
    fwCtx.fillText('❤', 0, this.height / 2 - 4);
    
    fwCtx.restore();
  }
}

class FireworkRocket {
  constructor(startX, startY, targetX, targetY, isSpecialLaunch = false, specialType = 'small') {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 9.5; // Synced fast rocket rise
    const angle = Math.atan2(targetY - startY, targetX - startX);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.exploded = false;
    this.color = `hsl(${Math.random() * 360}, 100%, 75%)`;
    
    this.isSpecialLaunch = isSpecialLaunch;
    this.specialType = specialType; // 'small', 'big', 'photo'

    // Synthesize synced launch whistle sound
    const distanceY = startY - targetY;
    const duration = Math.max(0.4, Math.min(1.4, distanceY / (this.speed * 60)));
    playRocketWhistleSound(duration);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Check if rocket reached height or is descending
    if (this.vy >= 0 || this.y <= this.targetY) {
      this.exploded = true;
      if (this.isSpecialLaunch) {
        triggerSpecialBlast(this.x, this.y, this.specialType);
      } else {
        createExplosion(this.x, this.y);
      }
    }
  }

  draw() {
    fwCtx.save();
    fwCtx.fillStyle = this.color;
    fwCtx.beginPath();
    fwCtx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
    fwCtx.fill();
    
    // Draw subtle trail
    fwCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    fwCtx.beginPath();
    fwCtx.arc(this.x - this.vx * 1.5, this.y - this.vy * 1.5, 2.5, 0, Math.PI * 2);
    fwCtx.fill();
    fwCtx.restore();
  }
}

// Synthesize rocket whistle whoosh glide
function playRocketWhistleSound(duration) {
  try {
    initAudioContext();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    // Glide pitch upwards
    osc.frequency.exponentialRampToValueAtTime(1100, now + duration);
    
    // Volume rise and sudden drop
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.05 * volumeLevel, now + duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch(e) {}
}

// Synthesizes a cracker explosion boom + noise sizzle
function playExplosionSound(intensity = 'normal') {
  try {
    initAudioContext();
    const now = audioCtx.currentTime;

    let boomFreq = 160;
    let boomVol = 0.5 * volumeLevel;
    let crackleVol = 0.22 * volumeLevel;
    let duration = 0.35;

    if (intensity === 'small') {
      boomFreq = 130;
      boomVol = 0.25 * volumeLevel;
      crackleVol = 0.09 * volumeLevel;
      duration = 0.26;
    } else if (intensity === 'big' || intensity === 'photo') {
      boomFreq = 175;
      boomVol = 0.85 * volumeLevel;
      crackleVol = 0.45 * volumeLevel;
      duration = 0.55;
    }

    // 1. Bass Boom
    const boomOsc = audioCtx.createOscillator();
    const boomGain = audioCtx.createGain();
    boomOsc.type = 'triangle';
    boomOsc.frequency.setValueAtTime(boomFreq, now);
    boomOsc.frequency.exponentialRampToValueAtTime(10, now + duration * 0.9);
    
    boomGain.gain.setValueAtTime(boomVol, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    boomOsc.connect(boomGain);
    boomGain.connect(audioCtx.destination);
    boomOsc.start(now);
    boomOsc.stop(now + duration + 0.05);

    // 2. White Noise Crackle/Hiss
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(intensity === 'small' ? 1400 : 1150, now);
    noiseFilter.Q.setValueAtTime(1.6, now);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(crackleVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.82);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + duration);
  } catch (e) {
    // Context suspended
  }
}

function createExplosion(x, y) {
  // Spawn emoji particles
  const emojiCount = Math.floor(Math.random() * 15) + 25; // 25 to 39 emojis
  for (let i = 0; i < emojiCount; i++) {
    const emoji = blastEmojis[Math.floor(Math.random() * blastEmojis.length)];
    fwParticles.push(new FwParticle(x, y, emoji));
  }

  // Spawn visual sparkle dots
  const sparkleCount = Math.floor(Math.random() * 25) + 30; // 30 to 54 sparkles
  const hue = Math.random() * 360;
  const color = `hsl(${hue}, 100%, 75%)`;
  for (let i = 0; i < sparkleCount; i++) {
    fwParticles.push(new FwParticle(x, y, null, color));
  }
  
  // Play synthesized deep cracker explosion sound
  playExplosionSound('normal');
}

// Launch 6-cracker choreographed show
let showTimeouts = [];

function startRocketShow() {
  showTimeouts.forEach(t => clearTimeout(t));
  showTimeouts = [];
  
  const launchInterval = 1450; // Delay between automatic launches
  
  // Launches 1-4: small
  launchRocket(launchInterval * 0, 'small');
  launchRocket(launchInterval * 1, 'small');
  launchRocket(launchInterval * 2, 'small');
  launchRocket(launchInterval * 3, 'small');
  
  // Launch 5: big
  launchRocket(launchInterval * 4, 'big');
  
  // Launch 6: grand finale photo blast!
  launchRocket(launchInterval * 5, 'photo');
}

function launchRocket(delay, type) {
  const t = setTimeout(() => {
    if (!isFireworksActive) return;
    
    // Choose start position at bottom, target heights
    const startX = Math.random() * (fwCanvas.width * 0.6) + (fwCanvas.width * 0.2);
    const startY = fwCanvas.height;
    const targetX = startX + (Math.random() - 0.5) * 80;
    
    let targetY;
    if (type === 'big' || type === 'photo') {
      targetY = Math.random() * (fwCanvas.height * 0.22) + (fwCanvas.height * 0.16); // explode higher up
    } else {
      targetY = Math.random() * (fwCanvas.height * 0.28) + (fwCanvas.height * 0.24); // explode mid-height
    }
    
    fwRockets.push(new FireworkRocket(startX, startY, targetX, targetY, true, type));
  }, delay);
  showTimeouts.push(t);
}

function triggerSpecialBlast(x, y, type) {
  // Play matched sound thud / sizzle
  playExplosionSound(type);

  if (type === 'small') {
    // 10 emojis
    const emojiCount = Math.floor(Math.random() * 4) + 8;
    for (let i = 0; i < emojiCount; i++) {
      const emoji = blastEmojis[Math.floor(Math.random() * blastEmojis.length)];
      const p = new FwParticle(x, y, emoji);
      p.speed = Math.random() * 4 + 2; // Slower velocity
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;
      fwParticles.push(p);
    }
    // 12 sparkles
    const sparkleCount = Math.floor(Math.random() * 5) + 10;
    const color = `hsl(${Math.random() * 360}, 100%, 75%)`;
    for (let i = 0; i < sparkleCount; i++) {
      const p = new FwParticle(x, y, null, color);
      p.speed = Math.random() * 4 + 2;
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;
      fwParticles.push(p);
    }
  } 
  else if (type === 'big') {
    // 35-42 emojis (huge blast)
    const emojiCount = Math.floor(Math.random() * 7) + 35;
    for (let i = 0; i < emojiCount; i++) {
      const emoji = blastEmojis[Math.floor(Math.random() * blastEmojis.length)];
      const p = new FwParticle(x, y, emoji);
      p.speed = Math.random() * 10 + 5; // Faster blast speed
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;
      fwParticles.push(p);
    }
    // 45-60 sparkles
    const sparkleCount = Math.floor(Math.random() * 15) + 45;
    const color = `hsl(${Math.random() * 360}, 100%, 75%)`;
    for (let i = 0; i < sparkleCount; i++) {
      const p = new FwParticle(x, y, null, color);
      p.speed = Math.random() * 10 + 5;
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;
      fwParticles.push(p);
    }
  } 
  else if (type === 'photo') {
    // Spawn 5 to 10 fanning photo card particles (the photo blast!)
    const photoCount = Math.floor(Math.random() * 3) + 7; // 7 to 9 photos
    for (let i = 0; i < photoCount; i++) {
      const img = preloadedImages[i % preloadedImages.length];
      fwParticles.push(new PhotoParticle(x, y, img));
    }
    
    // Visual emoji border
    const emojiCount = 22;
    for (let i = 0; i < emojiCount; i++) {
      const emoji = blastEmojis[Math.floor(Math.random() * blastEmojis.length)];
      const p = new FwParticle(x, y, emoji);
      p.speed = Math.random() * 6 + 3.2;
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;
      fwParticles.push(p);
    }
    
    // Visual sparkles (Gold spark halo for the photo blast)
    const sparkleCount = 35;
    const goldColor = '#ffd700';
    for (let i = 0; i < sparkleCount; i++) {
      const p = new FwParticle(x, y, null, goldColor);
      p.speed = Math.random() * 6 + 3.2;
      p.vx = Math.cos(p.angle) * p.speed;
      p.vy = Math.sin(p.angle) * p.speed;
      fwParticles.push(p);
    }
  }
}

// Pre-load photo arrays for Canvas Photo blasting (Grand Finale)
const imageUrls = [
  'images/friend_portrait.png',
  'images/birthday_cake.png',
  'images/birthday_balloons.png',
  'images/flower_bouquet.png',
  'images/gift_box.png'
];
const preloadedImages = [];
imageUrls.forEach(url => {
  const img = new Image();
  img.src = url;
  preloadedImages.push(img);
});

function animateFireworks() {
  if (!isFireworksActive) {
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
    return;
  }

  fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

  // Update & Draw Rockets
  for (let i = fwRockets.length - 1; i >= 0; i--) {
    fwRockets[i].update();
    if (fwRockets[i].exploded) {
      fwRockets.splice(i, 1);
    } else {
      fwRockets[i].draw();
    }
  }

  // Update & Draw Particles (supports FwParticle & PhotoParticle polymorphically)
  for (let i = fwParticles.length - 1; i >= 0; i--) {
    fwParticles[i].update();
    if (fwParticles[i].opacity <= 0) {
      fwParticles.splice(i, 1);
    } else {
      fwParticles[i].draw();
    }
  }

  requestAnimationFrame(animateFireworks);
}

function startFireworks() {
  isFireworksActive = true;
  fwParticles = [];
  fwRockets = [];
  animateFireworks();
  startRocketShow(); // Starts 6 choreographed sequenced launches
  
  // Add listeners for tap-to-blast anywhere
  window.addEventListener('click', handlePage4Tap);
  window.addEventListener('touchstart', handlePage4Tap);
}

function stopFireworks() {
  isFireworksActive = false;
  showTimeouts.forEach(t => clearTimeout(t));
  showTimeouts = [];
  fwParticles = [];
  fwRockets = [];
  
  window.removeEventListener('click', handlePage4Tap);
  window.removeEventListener('touchstart', handlePage4Tap);
}

function handlePage4Tap(e) {
  if (currentPage !== 4) return;
  
  // Ignore taps on buttons, player interface
  if (e.target.closest('.audio-player-container') || e.target.closest('.navigation-row') || e.target.closest('.music-mini-control')) {
    return;
  }
  
  let clientX = e.clientX;
  let clientY = e.clientY;
  
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }
  
  createExplosion(clientX, clientY);
}
