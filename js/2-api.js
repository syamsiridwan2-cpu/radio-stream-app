/* ============================================================
   API — Radio Browser API Functions
   ============================================================ */

function api(path) {
  return fetch(`${API}${path}`).then(r => r.json());
}

async function searchStations(query = '', country = '', tag = '') {
  spinner.classList.remove('hidden');
  resultLabel.textContent = '⏳ Mencari...';
  try {
    let data;
    if (query) {
      data = await api(`/stations/search?limit=50&name=${encodeURIComponent(query)}&hidebroken=true`);
    } else if (tag) {
      data = await api(`/stations/bytag/${encodeURIComponent(tag)}?limit=50&hidebroken=true`);
    } else if (country) {
      data = await api(`/stations/bycountry/${encodeURIComponent(country)}?limit=50&hidebroken=true`);
    } else {
      data = await api('/stations/topclick/50');
    }
    if (country) data = data.filter(s => s.country?.toLowerCase() === country.toLowerCase());
    if (tag) data = data.filter(s => s.tags?.toLowerCase().includes(tag.toLowerCase()));
    data = data.filter(s => s.url_resolved || s.url);
    renderList(data, `Menampilkan ${data.length} stasiun`);
  } catch {
    grid.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><h3>Gagal memuat</h3><p>Periksa koneksi internet</p></div>`;
    resultLabel.textContent = 'Gagal memuat';
  }
  spinner.classList.add('hidden');
}

async function loadCountries() {
  api('/countries').then(list => {
    const sorted = list.filter(c => c.stationcount > 30).sort((a, b) => b.stationcount - a.stationcount);
    countryFilter.innerHTML = '<option value="">🌍 Semua Negara</option>' +
      sorted.map(c => `<option value="${escape(c.name)}">${escape(c.name)} (${c.stationcount})</option>`).join('');
  }).catch(() => {});
}

async function loadTags() {
  api('/tags?order=stationcount&reverse=true').then(list => {
    const sorted = list.filter(t => t.stationcount > 10).slice(0, 50);
    tagFilter.innerHTML = '<option value="">🎵 Semua Genre</option>' +
      sorted.map(t => `<option value="${escape(t.name)}">${escape(t.name)} (${t.stationcount})</option>`).join('');
  }).catch(() => {});
}
