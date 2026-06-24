/* ============================================================
   PLAYER — Audio Engine & Playback Controls
   ============================================================ */

const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const favBtn = document.getElementById('favBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeBtn = document.getElementById('volumeBtn');
const playerTitle = document.getElementById('playerTitle');
const playerSub = document.getElementById('playerSub');
const playerThumb = document.getElementById('playerThumb');

function play(uuid) {
  const station = find(uuid);
  if (!station) return;

  if (state.current?.stationuuid === uuid && state.playing) {
    audio.pause();
    state.playing = false;
    updatePlayer();
    renderAll();
    return;
  }

  if (state.current?.stationuuid !== uuid) {
    audio.src = station.url_resolved || station.url;
    state.current = station;
  }

  audio.play()
    .then(() => { state.playing = true; updatePlayer(); renderAll(); })
    .catch(() => { alert('Gagal memutar stream. Mungkin tautan tidak tersedia.'); });
}

function updatePlayer() {
  if (state.current && state.playing) {
    playerTitle.textContent = state.current.name || 'Unknown';
    playerSub.textContent = '🔊 Sedang diputar';
    playBtn.textContent = '⏸';
    playBtn.classList.add('playing');
    if (state.current.favicon) {
      playerThumb.innerHTML = `<img src="${state.current.favicon}" alt="" onerror="this.outerHTML='📻'">`;
    } else {
      playerThumb.textContent = '📻';
    }
  } else if (state.current) {
    playerTitle.textContent = state.current.name || 'Unknown';
    playerSub.textContent = '⏹ Berhenti';
    playBtn.textContent = '▶';
    playBtn.classList.remove('playing');
  } else {
    playerTitle.textContent = 'Pilih stasiun radio';
    playerSub.textContent = '⏹ Berhenti';
    playBtn.textContent = '▶';
    playBtn.classList.remove('playing');
    playerThumb.textContent = '📻';
  }
  updateFavBtn();
}

function updateFavBtn() {
  favBtn.classList.toggle('saved', state.current && isFav(state.current.stationuuid));
  favBtn.textContent = state.current && isFav(state.current.stationuuid) ? '★' : '☆';
}

/* ── Audio Events ── */
audio.addEventListener('ended', () => { state.playing = false; updatePlayer(); renderAll(); });
audio.addEventListener('error', () => { state.playing = false; updatePlayer(); renderAll(); });

/* ── Play / Favorite Buttons ── */
playBtn.addEventListener('click', () => state.current && play(state.current.stationuuid));
favBtn.addEventListener('click', () => state.current && toggleFav(state.current));

/* ── Prev / Next (navigate current playlist) ── */
prevBtn.addEventListener('click', () => {
  const idx = state.stations.findIndex(s => s.stationuuid === state.current?.stationuuid);
  if (idx > 0) play(state.stations[idx - 1].stationuuid);
});

nextBtn.addEventListener('click', () => {
  const idx = state.stations.findIndex(s => s.stationuuid === state.current?.stationuuid);
  if (idx < state.stations.length - 1) play(state.stations[idx + 1].stationuuid);
});

/* ── Volume Controls ── */
volumeSlider.addEventListener('input', () => {
  audio.volume = +volumeSlider.value;
  volumeBtn.textContent = audio.volume === 0 ? '🔇' : audio.volume < 0.5 ? '🔉' : '🔊';
});

volumeBtn.addEventListener('click', () => {
  if (audio.volume > 0) {
    audio.dataset.v = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
  } else {
    audio.volume = +(audio.dataset.v || 0.7);
    volumeSlider.value = audio.volume;
  }
  volumeBtn.textContent = audio.volume === 0 ? '🔇' : audio.volume < 0.5 ? '🔉' : '🔊';
});
