# Popular Indian Web Series and Continue Watching

## Changes
- Change the Indian web-series feed from rating-first curation to popularity-first discovery.
- Keep the existing OTT-network allowlist and serial/talk/game-show exclusions, so broadcast Indian serials stay out.
- Rename the row to reflect its popularity focus.
- Add a “Continue Watching” carousel immediately above “Top Rated Hollywood Series,” populated from the strongest currently featured titles so every card remains playable and routes to its watch page.

## Technical details
- Add a popularity-focused TV catalog fetcher that combines current trending TV results with popularity-ranked discovery results, deduplicates them, and preserves popularity ordering rather than re-sorting by rating.
- Extend the shared media shape with TMDB popularity data.
- Keep the existing homepage query caching, card layout, horizontal scrolling, and movie/TV navigation behavior.
- Verify the row order, OTT filtering, desktop/mobile scrolling, navigation, and a clean preview build.
