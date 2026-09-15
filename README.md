# Serenity Zangetsu Sources

Native video sources for Zangetsu. Current release: **0.2.1**.

## Install or update

```
https://raw.githubusercontent.com/Serenity-MIST/zangetsu-sources/main/index.json
```

Refresh the repository and update the installed sources to 0.2.1. Open the settings icon beside a source to change its preferences.

## Sources

- **Anikoto**, **AnimeKai (Unoriginal)** and **AniWave (Unoriginal)**: anime search, details, episodes and supported direct sub/dub streams.
- **CineStream**: Cinemeta movies/series and VaPlayer playback, adapted from Megix/CSX.

Manganato and manga support have been removed from this repository at the owner's request. An already-installed manga source must be uninstalled in the app; removing it from a manifest cannot uninstall it remotely.

## 0.2.1 fixes

### The Mentalist and same-named movies/series

The old search interleaved movies before series. Searching The Mentalist put the 2011 short film before the 2008–2015 series. Zangetsu accepts the first matching title, so it resolved the wrong entry, produced only one movie item, and could not play the expected episodes.

Exact search matches now come first, and a movie/series title collision prefers the series by default. **When a movie and series share a title** can be set to prefer movies. **Browse and search** can also limit results to movies or series. Results carry IMDb IDs, available TMDB IDs and the app's TV-series flag.

If Zangetsu previously cached the wrong title, reopen its **Wrong title?** picker and select The Mentalist TV series (2008–2015, IMDb tt1196946). Updating a provider cannot erase the app's saved title match. The corrected search order prevents a new automatic match from choosing the short film first.

### Audio language

Streams now supply Zangetsu's `audioLang` field when known. HLS audio-track language tags are normalized to codes such as `en`, `ja` and `zh`. English-dub anime servers have an English fallback; subbed audio is not assumed to be Japanese. Subtitle languages are normalized separately.

If a playlist declares several audio languages, the stream label lists them and the player can choose its audio track. If the upstream stream omits language metadata, it remains **Audio: unspecified**. **Audio language (when missing or incorrect)** provides a per-source manual override. This affects reporting, not the sound of the video. A source's catalog language (`lang: en`) describes its interface/search language, not every video's spoken language.

## Settings

All sources: audio-language detection/override and request timeout.

Anime: sub/dub/both, subtitle tracks, popular/latest home order.

CineStream: movies/series/both, same-title preference, all VaPlayer servers or server 1/2/3, subtitle tracks.

## Verification

On 15 September 2026:

- The Mentalist search selected the series first, loaded 153 episodes/specials, and returned three VaPlayer links each for S1E1 and S1E2. The first stream for each episode successfully decoded three seconds of audio/video in FFmpeg.
- Automated tests cover source contracts, search collisions, settings, episode mapping, headers, captions, language normalization and existing anime cryptography.
- Earlier checks passed Inception and Breaking Bad S1E1 through VaPlayer; Black Summoner episode 1 sub/dub passed seeking and subtitle checks after source settings were added. The user confirmed anime playback on Zangetsu 2.1.1.

These are sampled checks, not a guarantee for all titles and servers. CineStream currently ports **VaPlayer**, not the full upstream extractor registry. Tested Videasy routes failed upstream and are not advertised. No torrent/debrid integration is included.

## Anime compatibility

The MegaPlay encrypted response decoder and short-lived playlist signing remain included. Reopen an episode for fresh links. Android-only binary segment proxy routes (Kiwi-Stream, VidPlay, mewcdn/getSourcesNew) remain unsupported by these JavaScript sources.

## Development and licensing

```
node build.js
node tests.js
node settings-tests.js
```

Edit shared helpers, `anime-core.js` or `cine-core.js`, then regenerate the four standalone `serenity-*.js` files and manifest. No package installation is required.

Anime bundles and shared helpers: Apache-2.0. CineStream adapted core and generated bundle: GPL-3.0-or-later. See [NOTICE.md](NOTICE.md), [LICENSE](LICENSE) and [LICENSE-GPL-3.0](LICENSE-GPL-3.0).
