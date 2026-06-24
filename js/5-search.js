/* ============================================================
   SEARCH — Search Input, Autocomplete & Suggestions
   ============================================================ */

const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const clearBtn = document.getElementById('clearBtn');
let suggestIndex = -1;

/* ── Fetch Suggestions (debounced) ── */
async function fetchSuggestions(query) {
  if (!query || query.length < 1) { closeSuggestions(); return; }
  try {
    const [stations, countries, tags] = await Promise.all([
      api(`/stations/search?limit=5&name=${encodeURIComponent(query)}&hidebroken=true`).catch(() => []),
      api(`/countries`).catch(() => []),
      api(`/tags?order=stationcount&reverse=true&limit=5`).catch(() => []),
    ]);
    const matched = [];
    for (const s of stations.slice(0, 5)) {
      matched.push({
        type: 'station', label: s.name,
        sub: `${s.country || ''} ${s.bitrate ? '• ' + s.bitrate + 'kbps' : ''}`,
        uuid: s.stationuuid, favicon: s.favicon, url: s.url_resolved || s.url,
      });
    }
    for (const c of countries) {
      if (c.name.toLowerCase().includes(query.toLowerCase()) && matched.length < 8) {
        matched.push({ type: 'country', label: c.name, sub: `${c.stationcount} stasiun` });
      }
    }
    for (const t of tags) {
      if (t.name.toLowerCase().includes(query.toLowerCase()) && matched.length < 8) {
        matched.push({ type: 'tag', label: t.name, sub: `${t.stationcount} stasiun` });
      }
    }
    showSuggestions(matched, query);
  } catch { closeSuggestions(); }
}

const doSuggest = debounce(fetchSuggestions, 280);

/* ── Render Suggestions Dropdown ── */
function showSuggestions(items, query) {
  suggestIndex = -1;
  if (!items.length) {
    suggestions.innerHTML = `<div class="suggestion-empty">Tidak ada hasil untuk "<strong>${escape(query)}</strong>"</div>`;
    suggestions.classList.add('open');
    return;
  }
  suggestions.innerHTML = items.map((item, i) => {
    const icon = item.type === 'station'
      ? (item.favicon ? `<img src="${item.favicon}" alt="" onerror="this.outerHTML='📻'">` : '📻')
      : item.type === 'country' ? '🌍' : '🎵';
    const tag = item.type === 'station'
      ? '<span class="suggestion-tag">Stasiun</span>'
      : `<span class="suggestion-type">${item.type === 'country' ? 'Negara' : 'Genre'}</span>`;
    return `<div class="suggestion-item" data-index="${i}" onclick="selectSuggestion(${i})">
      <div class="suggestion-icon">${icon}</div>
      <div class="suggestion-body">
        <div class="suggestion-name">${escape(item.label)}</div>
        <div class="suggestion-meta">${item.sub || ''}</div>
      </div>
      ${tag}
    </div>`;
  }).join('');
  suggestions.classList.add('open');
}

function closeSuggestions() {
  suggestions.classList.remove('open');
  suggestIndex = -1;
}

/* ── Select a Suggestion (click or keyboard) ── */
async function selectSuggestion(i) {
  const items = suggestions.querySelectorAll('.suggestion-item');
  const item = items[i];
  if (!item) return;
  const name = item.querySelector('.suggestion-name').textContent;
  const tag = item.querySelector('.suggestion-tag, .suggestion-type')?.textContent;
  searchInput.value = name;
  closeSuggestions();
  if (tag === 'Stasiun') {
    const station = state.stations.find(s => s.name === name);
    if (station) { play(station.stationuuid); return; }
    const data = await api(`/stations/search?limit=1&name=${encodeURIComponent(name)}&hidebroken=true`);
    if (data.length) {
      state.stations = [data[0], ...state.stations];
      renderList(state.stations, resultLabel.textContent);
      play(data[0].stationuuid);
    }
  } else if (tag === 'Negara') {
    countryFilter.value = name;
    searchStations(searchInput.value.trim(), countryFilter.value, tagFilter.value);
  } else if (tag === 'Genre') {
    tagFilter.value = name;
    searchStations(searchInput.value.trim(), countryFilter.value, tagFilter.value);
  }
}

/* ── Trigger Search ── */
function doSearch() {
  const q = searchInput.value.trim();
  const c = countryFilter.value;
  const t = tagFilter.value;
  searchStations(q, c, t);
  setTab('search');
  closeSuggestions();
}

/* ── Search Input Events ── */
searchInput.addEventListener('input', () => {
  const val = searchInput.value.trim();
  clearBtn.classList.toggle('hidden', !val);
  if (val.length >= 1) doSuggest(val);
  else closeSuggestions();
});

searchInput.addEventListener('keydown', e => {
  const items = suggestions.querySelectorAll('.suggestion-item');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    suggestIndex = Math.min(suggestIndex + 1, items.length - 1);
    items.forEach((el, i) => el.classList.toggle('highlight', i === suggestIndex));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    suggestIndex = Math.max(suggestIndex - 1, -1);
    items.forEach((el, i) => el.classList.toggle('highlight', i === suggestIndex));
  } else if (e.key === 'Enter') {
    if (suggestIndex > -1 && items[suggestIndex]) {
      selectSuggestion(suggestIndex);
    } else {
      doSearch();
    }
  } else if (e.key === 'Escape') {
    closeSuggestions();
  }
});

searchInput.addEventListener('blur', () => setTimeout(closeSuggestions, 180));
searchInput.addEventListener('focus', () => {
  if (searchInput.value.trim().length >= 1) doSuggest(searchInput.value.trim());
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  closeSuggestions();
  searchInput.focus();
});
