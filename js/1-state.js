/* ============================================================
   STATE — Constants, Global State, Utilities
   ============================================================ */

const API = 'https://de1.api.radio-browser.info/json';

const state = {
  stations: [],
  current: null,
  playing: false,
  favorites: JSON.parse(localStorage.getItem('radioFavs') || '[]'),
  theme: localStorage.getItem('radioTheme') || 'dark',
  tab: 'popular',
};

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function escape(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function find(uuid) {
  return state.stations.find(s => s.stationuuid === uuid);
}
