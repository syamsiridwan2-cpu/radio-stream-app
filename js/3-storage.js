/* ============================================================
   STORAGE — Favorites Persistence (localStorage)
   ============================================================ */

function saveFavs() {
  localStorage.setItem('radioFavs', JSON.stringify(state.favorites));
}

function isFav(uuid) {
  return state.favorites.some(f => f.stationuuid === uuid);
}

function toggleFav(station) {
  const i = state.favorites.findIndex(f => f.stationuuid === station.stationuuid);
  i > -1 ? state.favorites.splice(i, 1) : state.favorites.push(station);
  saveFavs();
  updateFavCount();
  updateCard(station);
  updateFavBtn();
}

function updateFavCount() {
  favCount.textContent = state.favorites.length || '';
}
