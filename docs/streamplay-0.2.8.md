# StreamPlay 0.2.8 — 9 October 2026

StreamPlay is now a standalone Zangetsu source with movies and series. The port includes the upstream Vidlink and VaPlayer request protocols and reuses the existing Cinemeta catalogue helpers. It preserves TMDB season/episode identifiers, signed query parameters, playback headers, quality labels and available subtitle tracks.

Source settings offer **All available**, **Vidlink** and **VaPlayer**. Requests to the two backends run independently. A failed backend does not discard another backend's results. A bounded HEAD check removes known CDN errors before returning video links; servers that explicitly do not support HEAD remain eligible. The port does not include all of Cloudstream StreamPlay's backends, torrents, debrid, accounts or Android settings screens.

## Live verification

The final generated bundle was tested through home catalogue, search, exact title selection, detail, episode loading and stream extraction. FFmpeg decoded two-second video samples on this PC.

| Title | Selection | Playback result |
|---|---|---|
| Inception (2010) | IMDb tt1375666, TMDB 27205 | Vidlink 1080 and VaPlayer server 1 decoded successfully |
| The Mentalist | IMDb tt1196946, TMDB 5920, season 1 episode 1 | VaPlayer server 1 decoded successfully |

Inception returned 15 caption tracks through Vidlink. The Mentalist catalogue loaded 151 episodes. Vidlink's Mentalist CDN returned HTTP 429 during these tests and was filtered out by the final provider; the working VaPlayer fallback remained available. RiveStream candidates returned access failures or could not decode, so they are excluded.

These checks confirm short PC samples for the titles above. Phone/TV playback, every episode, every returned quality and ongoing service availability have not been independently confirmed in this release. Caption extraction was verified; every caption file was not downloaded or visually checked.

## Regression checks

All offline suites pass: existing anime extraction and cryptography, settings, season matching, and the new StreamPlay tests. The new tests cover exact TV episode requests, signed URL preservation, quality ordering, captions, playback headers, independent backend failures, backend selection, legacy playlists and HTTP 429 filtering.

## Removed source

Videasy was removed from the manifest, generated bundles, editable code and tests at the repository owner's request. If already installed, uninstall it in Zangetsu: repository changes do not remotely uninstall existing providers.

The repository now lists Anikoto, AnimeKai, AniWave, CineStream and StreamPlay, all version 0.2.8. Existing anime playback and season matching logic is unchanged.

See [NOTICE.md](../NOTICE.md) for upstream source references and licensing.
