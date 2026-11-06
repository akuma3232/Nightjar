let allMovies = { trending:[], classics:[], action:[], scifi:[], horror:[], animation:[] };
let searchTimer = null;

// ─── Section definitions ────────────────────────────────────
const SECTIONS = [
  { key:'trending',  grid:'trendingGrid',  section:'trendingSection'  },
  { key:'classics',  grid:'classicsGrid',  section:'classicsSection'  },
  { key:'action',    grid:'actionGrid',    section:'actionSection'    },
  { key:'scifi',     grid:'scifiGrid',     section:'scifiSection'     },
  { key:'horror',    grid:'horrorGrid',    section:'horrorSection'    },
  { key:'animation', grid:'animationGrid', section:'animationSection' },
];

// ─── Helpers ────────────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function randomPage() {
  return Math.floor(Math.random() * 3) + 1; // small variation
}

// ─── Init ────────────────────────────────────────────────────
async function init() {
  updateFavCount();
  updateWatchlistCount();

  // Skeletons
  SECTIONS.forEach(s => renderSkeletons(s.grid, 12));

  // 🔥 RANDOMIZED FETCHING (KEY FIX)
  const [trending, classics, action, scifi, horror, animation] = await Promise.all([
    getMultipleMovies(shuffle(CURATED.trending)),
    getMultipleMovies(shuffle(CURATED.classics)),
    getMultipleMovies(shuffle(CURATED.action)),
    getMultipleMovies(shuffle(CURATED.scifi)),
    getMultipleMovies(shuffle(CURATED.horror)),
    getMultipleMovies(shuffle(CURATED.animation)),
  ]);

  allMovies = { trending, classics, action, scifi, horror, animation };

  // Hero also changes every refresh
  if (trending.length) {
    const randomHero = trending[Math.floor(Math.random() * trending.length)];
    renderHero(randomHero);
  }

  // Render all sections
  SECTIONS.forEach(s => renderGrid(s.grid, allMovies[s.key]));
}

// ─── SEARCH (unchanged but safe) ─────────────────────────────
const searchInput = document.getElementById('searchInput');
const searchResultsBox = document.getElementById('searchResults');

searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = searchInput.value.trim();
  if (!q) {
    searchResultsBox.classList.remove('open');
    showHomeSections();
    return;
  }
  searchTimer = setTimeout(() => liveSearch(q), 380);
});

async function liveSearch(q) {
  searchResultsBox.innerHTML = '<div class="search-loading">Searching…</div>';
  searchResultsBox.classList.add('open');

  const data = await searchMovies(q);

  if (!data.Search) {
    searchResultsBox.innerHTML = '<div class="search-loading">No results.</div>';
    return;
  }

  searchResultsBox.innerHTML = data.Search.slice(0, 6).map(m => `
    <div class="search-result-item" onclick="selectSearchResult('${m.imdbID}')">
      <img class="search-result-img" src="${m.Poster !== 'N/A' ? m.Poster : ''}" onerror="this.style.display='none'">
      <div class="search-result-info">
        <div class="search-result-title">${m.Title}</div>
        <div class="search-result-year">${m.Year}</div>
      </div>
    </div>
  `).join('');
}

async function selectSearchResult(id) {
  searchResultsBox.classList.remove('open');
  await openModal(id);
}

// ─── SEARCH PAGE ─────────────────────────────────────────────
async function showSearchSection(q) {
  SECTIONS.forEach(s => document.getElementById(s.section)?.classList.add('hidden'));

  document.getElementById('searchSection').classList.remove('hidden');
  document.getElementById('searchSubtitle').textContent = `Showing results for "${q}"`;

  renderSkeletons('searchGrid', 8);

  const data = await searchMovies(q);

  if (!data.Search) {
    renderGrid('searchGrid', []);
    return;
  }

  const full = await Promise.all(data.Search.map(m => getMovieById(m.imdbID)));
  renderGrid('searchGrid', full.filter(m => m.Response === 'True'));
}

// ─── HOME RESET ──────────────────────────────────────────────
function showHomeSections() {
  SECTIONS.forEach(s => {
    document.getElementById(s.section)?.classList.remove('hidden');
    renderGrid(s.grid, allMovies[s.key]);
  });

  document.getElementById('searchSection')?.classList.add('hidden');
  document.getElementById('hero')?.classList.remove('hidden');
}

// ─── GENRE FILTER (slightly improved) ────────────────────────
document.querySelectorAll('.genre-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    filterByGenre(pill.dataset.genre);
  });
});

function filterByGenre(genre) {
  SECTIONS.forEach(s => {
    document.getElementById(s.section)?.classList.add('hidden');
  });

  const section = document.getElementById('trendingSection');
  section.classList.remove('hidden');

  let all = Object.values(allMovies).flat();

  if (genre !== 'all') {
    all = all.filter(m =>
      (m.Genre || "").toLowerCase().includes(genre.toLowerCase())
    );
  }

  document.getElementById('hero')?.classList.toggle('hidden', genre !== 'all');

  renderGrid('trendingGrid', shuffle(all)); // 🔥 extra randomness here
}

// ─── MODAL + EVENTS (unchanged) ──────────────────────────────
document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modalOverlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('click', e => {
  if (!e.target.closest('.nav-search')) searchResultsBox?.classList.remove('open');
});

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
});

// ─── START ───────────────────────────────────────────────────
init();