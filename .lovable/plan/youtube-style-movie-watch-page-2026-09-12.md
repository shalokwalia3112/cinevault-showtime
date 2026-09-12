# YouTube-style movie watch page

## Goal
Replace the full-screen playback popup with a dedicated, scrollable movie page that keeps CineVault’s dark cinematic styling.

## Changes
- Add a movie watch page at `/movie/:movieId` with a large 16:9 VidLink player near the top.
- Fetch the selected movie’s full TMDB details and credits so the page shows its title, overview, rating, release year, genres, runtime, and cast beneath the player.
- Update Play buttons and poster selections across Home and Browse to open the selected movie page instead of a modal.
- Remove modal playback from the active page flow.
- Make the watch page fluid on mobile and desktop, with natural vertical scrolling and room for future sections below the details.
- Add unique movie-page metadata while preserving existing metadata on Home and Browse.

## Technical details
- Extend the existing TMDB helper with movie-detail and credits response types/functions.
- Use a TanStack dynamic route and React Query for the selected movie data.
- Keep the existing dynamic VidLink URL format so each page embeds the current movie’s real TMDB ID.
- Verify navigation, player sizing, content rendering, scrolling, and responsive layout in the running preview.
