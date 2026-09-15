# Restructure CineVault homepage catalog

## Goal

Replace the current generic homepage rows with six curated regional movie and TV rows in the exact requested order, while keeping the full TMDB catalog available through search.

## Changes

- Generalize TMDB catalog items so movie and television results share consistent titles, dates, artwork, ratings, and media types.
- Load the homepage with these rows, in order:
  1. Top Rated Hollywood Series
  2. Popular Bollywood Blockbusters
  3. Trending Indian Web Series
  4. Top Rated Korean Cinema
  5. Trending Korean Dramas
  6. Popular Anime Series
- Use TMDB discovery filters for language, region, genre, popularity, vote count, and rating. Rank strong titles first while retaining lower-rated results later within each row.
- Replace the existing homepage hero’s global trending dependency with a featured title drawn from the curated homepage catalog.
- Keep each row horizontally scrollable with touch scrolling on mobile and arrow controls on desktop.
- Expand search to return both movies and TV series, without loading the wider catalog on the homepage.
- Add a dedicated TV watch/details route with cast and series metadata; movie cards continue to use the existing movie route.
- Use VidLink’s movie URL for films and its season/episode URL for TV. Rely on VidLink’s built-in source and language controls, per the selected single-provider approach.

## Technical details

- Use TanStack Query route loaders to prefetch the six homepage lists and search results for SSR-friendly initial rendering.
- Add media normalization helpers and separate movie/TV detail fetchers in the TMDB data module.
- Route cards by media type to `/movie/$movieId` or `/tv/$tvId`.
- Add route-specific metadata, loading, error, and not-found states for the new TV page.
- Preserve the dark cinematic visual system and existing ad placeholders on the movie page.
- Verify row order, horizontal scrolling, search results, movie/TV navigation, player sizing, and mobile overflow in the live preview.
