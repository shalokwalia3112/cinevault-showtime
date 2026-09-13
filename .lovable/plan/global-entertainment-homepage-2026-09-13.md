# Global entertainment homepage

## Goal
Turn the CineVault homepage into a global browsing hub with the requested Hollywood, Indian, Korean, and Japanese movie and TV rows, all powered by live TMDB results.

## What will change
- Add grouped homepage sections for Global & Western, Indian Cinema, and East Asian entertainment.
- Include these rows:
  - Trending Global Movies
  - Latest Hollywood Releases
  - Popular Western TV Series
  - Trending Bollywood Movies
  - Popular South Indian Cinema
  - Hot Indian Web Series & TV Shows
  - Popular Korean Dramas
  - Trending Japanese Anime Series
- Query TMDB Discover endpoints using the requested language and region filters, combining Telugu, Tamil, and Malayalam results into one deduplicated South Indian row.
- Generalize poster cards so movie and TV titles, dates, ratings, and artwork display correctly.
- Keep each row touch-scrollable on mobile and wheel/button-scrollable on desktop.
- Route movie posters to the existing movie watch page and TV posters to a matching TV watch page.
- Add a TV details/watch page with the same dark player-first layout, VidLink’s dynamic TV URL, metadata, description, and cast.
- Preserve the existing cinematic theme and unique metadata for each content page.

## Technical details
- Extend the TMDB media model with a `mediaType` discriminator and normalize movie/TV responses into one poster-card shape.
- Use React Query options with homepage route preloading so the first visible rows are server-rendered and cached.
- Use `/movie/$movieId` for films and `/tv/$seriesId` for series; VidLink receives the real TMDB ID and a default season/episode for TV playback.
- Keep failed regional rows isolated so one TMDB request cannot blank the entire homepage.
- Verify desktop and mobile sideways scrolling, poster navigation, movie playback, TV playback, metadata, and page overflow in the live preview.
