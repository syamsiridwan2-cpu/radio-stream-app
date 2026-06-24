/* ============================================================
   INIT — Bootstrap: Wire DOM, Restore State, Load Initial Data
   ============================================================ */

const themeToggle = document.getElementById('themeToggle');
const favCount = document.getElementById('favCount');

/* ── Restore Theme ── */
if (state.theme === 'light') applyTheme('light');

/* ── Restore Favorites Badge ── */
updateFavCount();

/* ── Init Player ── */
updatePlayer();
audio.volume = +document.getElementById('volumeSlider').value;

/* ── Load Filter Options ── */
loadCountries();
loadTags();

/* ── Theme Toggle ── */
themeToggle.addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));

/* ── Load Initial Data (Popular) ── */
spinner.classList.remove('hidden');
api('/stations/topclick/50').then(data => {
  data = data.filter(s => s.url_resolved || s.url);
  renderList(data, `🔥 ${data.length} stasiun paling populer`);
  spinner.classList.add('hidden');
}).catch(() => {
  grid.innerHTML = `<div class="empty">
    <div class="empty-icon">📻</div>
    <h3>Selamat datang!</h3>
    <p>Gunakan pencarian untuk menemukan radio favoritmu</p>
  </div>`;
  resultLabel.textContent = 'Gagal memuat data awal';
  spinner.classList.add('hidden');
});
