// ─── Favourites ───────────────────────────────────────────
function getFavs() { return JSON.parse(localStorage.getItem('filmvault_favs') || '[]'); }
function saveFavs(f) { localStorage.setItem('filmvault_favs', JSON.stringify(f)); }
function isFav(id) { return getFavs().includes(id); }
function toggleFav(id, title) {
  let f = getFavs();
  if (f.includes(id)) { f = f.filter(x => x !== id); showToast(`Removed "${title}" from favourites`); }
  else { f.push(id); showToast(`Saved "${title}" to favourites.`); }
  saveFavs(f);
  updateFavCount();
  document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(b => b.classList.toggle('active', f.includes(id)));
}
function updateFavCount() {
  const el = document.getElementById('favCount');
  if (el) el.textContent = getFavs().length;
}

// ─── Watchlist ────────────────────────────────────────────
function getWatchlist() { return JSON.parse(localStorage.getItem('filmvault_watchlist') || '[]'); }
function saveWatchlist(w) { localStorage.setItem('filmvault_watchlist', JSON.stringify(w)); }
function isInWatchlist(id) { return getWatchlist().includes(id); }
function toggleWatchlist(id, title) {
  let w = getWatchlist();
  if (w.includes(id)) { w = w.filter(x => x !== id); showToast(`Removed "${title}" from watchlist`); }
  else { w.push(id); showToast(`Added "${title}" to your watchlist.`); }
  saveWatchlist(w);
  updateWatchlistCount();
  document.querySelectorAll(`.wl-btn[data-id="${id}"]`).forEach(b => b.classList.toggle('active', w.includes(id)));
}
function updateWatchlistCount() {
  const el = document.getElementById('wlCount');
  if (el) el.textContent = getWatchlist().length;
}

// ─── Toast ────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── Hero ─────────────────────────────────────────────────
function renderHero(m) {
  const poster = m.Poster !== 'N/A' ? m.Poster : '';
  document.getElementById('heroBackdrop').style.backgroundImage = `url('${poster}')`;
  document.getElementById('heroContent').innerHTML = `
    <div class="hero-badge">NIGHTJAR PICK</div>
    <h1 class="hero-title">${m.Title}</h1>
    <div class="hero-meta">
      <span class="hero-rating">IMDb ${m.imdbRating}</span>
      <span class="hero-dot">•</span>
      <span class="hero-year">${m.Year}</span>
      <span class="hero-dot">•</span>
      <span class="hero-genre">${m.Genre?.split(',')[0]}</span>
      <span class="hero-dot">•</span>
      <span class="hero-runtime">${m.Runtime}</span>
    </div>
    <p class="hero-plot">${m.Plot}</p>
    <div class="hero-actions">
      <button class="btn btn-primary" onclick="openTrailer('${m.Title}','${m.Year}')">Play trailer</button>
      <button class="btn btn-secondary" onclick="openModal('${m.imdbID}')">Film details</button>
      <button class="btn btn-secondary fav-btn ${isFav(m.imdbID)?'active':''}" data-id="${m.imdbID}"
        onclick="toggleFav('${m.imdbID}','${m.Title.replace(/'/g,"\\'")}')">
        ${isFav(m.imdbID)?'Saved':'Save film'}
      </button>
      <button class="btn btn-secondary wl-btn ${isInWatchlist(m.imdbID)?'wl-active':''}" data-id="${m.imdbID}"
        onclick="toggleWatchlist('${m.imdbID}','${m.Title.replace(/'/g,"\\'")}')">
        ${isInWatchlist(m.imdbID)?'On your list':'Add to watchlist'}
      </button>
    </div>`;
}

// ─── Movie Card ───────────────────────────────────────────
function createCard(m) {
  const poster = m.Poster !== 'N/A'
    ? `<img src="${m.Poster}" alt="${m.Title}" loading="lazy">`
    : `<div class="card-poster-fallback"><span>${m.Title}</span></div>`;
  const fav = isFav(m.imdbID);
  const wl  = isInWatchlist(m.imdbID);
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.dataset.genre = m.Genre || '';
  card.innerHTML = `
    <div class="card-poster">
      ${poster}
      <div class="card-overlay">
        <button class="overlay-btn trailer-btn" onclick="event.stopPropagation();openTrailer('${m.Title.replace(/'/g,"\\'")}','${m.Year}')">Play trailer</button>
        <div class="overlay-icon-btns">
          <button class="icon-btn fav-btn ${fav?'active':''}" data-id="${m.imdbID}" title="Favourite"
            onclick="event.stopPropagation();toggleFav('${m.imdbID}','${m.Title.replace(/'/g,"\\'")}')">
            ${fav?'♥':'♡'}
          </button>
          <button class="icon-btn wl-btn ${wl?'wl-active':''}" data-id="${m.imdbID}" title="Add to Watchlist"
            onclick="event.stopPropagation();toggleWatchlist('${m.imdbID}','${m.Title.replace(/'/g,"\\'")}')">
            ${wl?'◷':'+'}
          </button>
        </div>
      </div>
      ${m.imdbRating && m.imdbRating!=='N/A'?`<div class="rating-badge">IMDb ${m.imdbRating}</div>`:''}
    </div>
    <div class="card-body">
      <h3 class="card-title">${m.Title}</h3>
      <div class="card-meta"><span>${m.Year}</span><span class="card-genre">${m.Genre?.split(',')[0]||''}</span></div>
    </div>`;
  card.addEventListener('click', () => openModal(m.imdbID));
  return card;
}

function renderGrid(gridId, movies) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = '';
  if (!movies.length) { grid.innerHTML = '<p class="no-results">No movies found.</p>'; return; }
  movies.forEach(m => grid.appendChild(createCard(m)));
}

// ─── Skeleton Loaders ─────────────────────────────────────
function renderSkeletons(gridId, count = 8) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = Array(count).fill(`<div class="skeleton-card"><div class="skeleton-poster"></div><div class="skeleton-body"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>`).join('');
}

// ─── Modal ────────────────────────────────────────────────
async function openModal(id) {
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  overlay.classList.add('open');
  content.innerHTML = `<div class="modal-loading">Loading...</div>`;
  document.body.style.overflow = 'hidden';
  const m = await getMovieById(id);
  if (m.Response !== 'True') { content.innerHTML = '<p>Could not load movie.</p>'; return; }
  const fav = isFav(m.imdbID);
  const wl  = isInWatchlist(m.imdbID);
  const poster = m.Poster !== 'N/A' ? `<img src="${m.Poster}" alt="${m.Title}" class="modal-poster">` : `<div class="modal-poster-fallback" aria-hidden="true"></div>`;
  content.innerHTML = `
    <div class="modal-layout">
      <div class="modal-left">${poster}</div>
      <div class="modal-right">
        <h2 class="modal-title">${m.Title}</h2>
        <div class="modal-meta">
          <span class="modal-rating">IMDb ${m.imdbRating}</span>
          <span>${m.Year}</span><span>${m.Runtime}</span><span>${m.Rated}</span>
        </div>
        <div class="modal-genres">${(m.Genre||'').split(',').map(g=>`<span class="genre-tag">${g.trim()}</span>`).join('')}</div>
        <p class="modal-plot">${m.Plot}</p>
        <div class="modal-details">
          <div class="detail-row"><span class="detail-label">Director</span><span>${m.Director}</span></div>
          <div class="detail-row"><span class="detail-label">Cast</span><span>${m.Actors}</span></div>
          <div class="detail-row"><span class="detail-label">Awards</span><span>${m.Awards}</span></div>
          <div class="detail-row"><span class="detail-label">Box Office</span><span>${m.BoxOffice||'N/A'}</span></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="openTrailer('${m.Title.replace(/'/g,"\\'")}','${m.Year}')">Play trailer</button>
          <button class="btn btn-secondary fav-btn ${fav?'active':''}" data-id="${m.imdbID}"
            onclick="toggleFav('${m.imdbID}','${m.Title.replace(/'/g,"\\'")}');this.innerHTML=isFav('${m.imdbID}')?'Saved':'Save film';this.classList.toggle('active',isFav('${m.imdbID}'))">
            ${fav?'Saved':'Save film'}
          </button>
          <button class="btn btn-secondary wl-btn ${wl?'wl-active':''}" data-id="${m.imdbID}"
            onclick="toggleWatchlist('${m.imdbID}','${m.Title.replace(/'/g,"\\'")}');this.innerHTML=isInWatchlist('${m.imdbID}')?'On your list':'Add to watchlist';this.classList.toggle('wl-active',isInWatchlist('${m.imdbID}'))">
            ${wl?'On your list':'Add to watchlist'}
          </button>
        </div>
      </div>
    </div>`;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Trailer ──────────────────────────────────────────────
function openTrailer(title, year) {
  const q = encodeURIComponent(`${title} ${year} official trailer`);
  window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank');
}
