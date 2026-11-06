# Nightjar

🎬 Find your next favorite film. **Nightjar** is a cinematic movie discovery website for exploring curated picks, checking film details, and keeping a personal watchlist.

## Features

- 🎞️ Browse curated movie collections and filter by genre
- 🔎 Search for films and view details, ratings, cast, and plot summaries
- ▶️ Find trailers on YouTube
- ❤️ Save favourites and add films to your watchlist
- 🌙 Switch between dark and light themes
- 📱 Responsive layout for desktop and mobile

## Getting started

Nightjar is a static website built with HTML, CSS, and vanilla JavaScript. It does not require a package manager or build step.

1. Get an API key from [OMDb API](https://www.omdbapi.com/apikey.aspx).
2. Set `API_KEY` in `js/api.js` to your OMDb API key.
3. Serve the project from its root directory. For example, with Python:

   ```bash
   python3 -m http.server 8000
   ```

4. Open [http://localhost:8000](http://localhost:8000).

The browser fetches movie data from OMDb. Since a key used in frontend code is visible to visitors, use a server-side proxy if you need to keep an API key private.

## Saved data

Favourites, watchlist entries, theme preference, and the demo profile are stored in the browser's `localStorage`. They are specific to the browser and device; the profile form does not provide real authentication or account syncing.

## Project structure

```text
.
├── index.html          # Movie discovery page
├── favourites.html     # Saved favourites
├── watchlist.html      # Films to watch later
├── css/
│   └── style.css       # Shared styles and responsive layouts
└── js/
    ├── api.js          # OMDb requests and curated movie IDs
    ├── app.js          # Homepage search, filters, and rendering
    ├── sidebar.js      # Navigation, theme, and demo profile
    └── ui.js           # Movie cards, dialogs, and saved lists
```
