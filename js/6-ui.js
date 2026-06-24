/* ============================================================
   UI — Rendering, Tabs, Theme
   ============================================================ */

const grid = document.getElementById('grid');
const resultLabel = document.getElementById('resultLabel');
const spinner = document.getElementById('spinner');
const countryFilter = document.getElementById('countryFilter');
const tagFilter = document.getElementById('tagFilter');

/* ── Render Station List ── */
function renderList(stations, label) {
  state.stations = stations;
  resultLabel.textContent = label;

  if (!stations || !stations.length) {
    grid.innerHTML = `<div class="empty">
      <div class="empty-icon">📻</div>
      <h3>Tidak ada stasiun</h3>
      <p>Coba kata kunci atau filter yang berbeda</p>
    </div>`;
    return;
  }

  grid.innerHTML = stations.map(s => {
    const now = state.current?.stationuuid === s.stationuuid && state.playing;
    return `<div class="card${now ? ' playing' : ''}" data-uuid="${s.stationuuid}">
      <div class="card-top">
        <div class="card-favicon">
          ${s.favicon
            ? `<img src="${s.favicon}" alt="" loading="lazy" onerror="this.closest('.card-favicon').textContent='📻'">`
            : '📻'}
        </div>
        <div class="card-info">
          <div class="card-name" title="${escape(s.name || '')}">${escape(s.name || 'Unknown')}</div>
          <div class="card-meta">
            ${s.country ? `<span>${escape(s.country)}</span>` : ''}
            ${s.bitrate ? `<span>${s.bitrate}kbps</span>` : ''}
            ${s.language ? `<span>${escape(s.language)}</span>` : ''}
          </div>
        </div>
      </div>
      ${s.tags
        ? `<div class="card-tags">${s.tags.split(',').slice(0, 4).map(t => `<span class="card-tag">${escape(t.trim())}</span>`).join('')}</div>`
        : ''}
      <div class="card-actions">
        <button class="card-btn card-btn--play${now ? ' playing' : ''}" onclick="play('${s.stationuuid}')">${now ? '⏹' : '▶'} ${now ? 'Stop' : 'Putar'}</button>
        <button class="card-btn card-btn--fav${isFav(s.stationuuid) ? ' saved' : ''}" onclick="toggleFav(find('${s.stationuuid}'))">${isFav(s.stationuuid) ? '★' : '☆'}</button>
      </div>
    </div>`;
  }).join('');
}

/* ── Update Single Card State ── */
function updateCard(station) {
  const card = document.querySelector(`[data-uuid="${station.stationuuid}"]`);
  if (!card) return;
  const now = state.current?.stationuuid === station.stationuuid && state.playing;
  card.classList.toggle('playing', now);
  const p = card.querySelector('.card-btn--play');
  p.textContent = `${now ? '⏹' : '▶'} ${now ? 'Stop' : 'Putar'}`;
  p.classList.toggle('playing', now);
  const f = card.querySelector('.card-btn--fav');
  f.textContent = isFav(station.stationuuid) ? '★' : '☆';
  f.classList.toggle('saved', isFav(station.stationuuid));
}

/* ── Update All Visible Cards ── */
function renderAll() {
  state.stations.forEach(updateCard);
}

/* ── Tab Switching ── */
function setTab(name) {
  state.tab = name;
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  closeSuggestions();
}

/* ── Apply Theme (Dark / Light) ── */
function applyTheme(t) {
  state.theme = t;
  localStorage.setItem('radioTheme', t);
  const root = document.documentElement;
  if (t === 'light') {
    root.style.setProperty('--bg', '#f2f2f8');
    root.style.setProperty('--surface', '#ffffff');
    root.style.setProperty('--surface2', '#eaeaef');
    root.style.setProperty('--surface3', '#d8d8e3');
    root.style.setProperty('--text', '#1a1a2e');
    root.style.setProperty('--text2', '#6a6a8a');
    root.style.setProperty('--text3', '#9a9ab0');
    root.style.setProperty('--border', '#d4d4e0');
    root.style.setProperty('--accent-dim', 'rgba(124,106,255,0.08)');
    themeToggle.textContent = '☀️';
  } else {
    root.style.setProperty('--bg', '#0d0d1a');
    root.style.setProperty('--surface', '#16162b');
    root.style.setProperty('--surface2', '#1e1e3a');
    root.style.setProperty('--surface3', '#2a2a4a');
    root.style.setProperty('--text', '#eeeef6');
    root.style.setProperty('--text2', '#9898b8');
    root.style.setProperty('--text3', '#6c6c8a');
    root.style.setProperty('--border', '#282845');
    root.style.setProperty('--accent-dim', 'rgba(124,106,255,0.12)');
    themeToggle.textContent = '🌙';
  }
}

/* ── Tab Click Events ── */
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    setTab(tab);
    switch (tab) {
      case 'search':
        doSearch();
        break;
      case 'popular':
        spinner.classList.remove('hidden');
        resultLabel.textContent = '⏳ Memuat...';
        api('/stations/topclick/50').then(data => {
          data = data.filter(s => s.url_resolved || s.url);
          renderList(data, `🔥 ${data.length} stasiun paling populer`);
          spinner.classList.add('hidden');
        }).catch(() => {
          grid.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><h3>Gagal memuat</h3></div>`;
          resultLabel.textContent = 'Gagal memuat';
          spinner.classList.add('hidden');
        });
        break;
      case 'favorites':
        if (!state.favorites.length) {
          renderList([], '⭐ Belum ada favorit');
          resultLabel.textContent = '⭐ Belum ada favorit';
        } else {
          renderList(state.favorites, `⭐ ${state.favorites.length} stasiun favorit`);
        }
        break;
    }
  });
});

/* ── Filter Change Events ── */
countryFilter.addEventListener('change', doSearch);
tagFilter.addEventListener('change', doSearch);
