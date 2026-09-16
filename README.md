# Serenity Zangetsu Sources

Native video sources for Zangetsu. Current release: **0.2.5**.

## Install or update

```
https://raw.githubusercontent.com/Serenity-MIST/zangetsu-sources/main/index.json
```

Refresh the repository and update the installed sources to 0.2.5. Open the settings icon beside a source to change its preferences.

## 0.2.5: AnimeDex

Adds **AnimeDex** from https://animedex.fun. Refresh the repository, update existing providers, and install AnimeDex from the repository list. The previous six providers retain their 0.2.4 runtime code with only version numbers updated.

Includes search, home rows, paginated popular titles, details, ordered episodes, subtitles and two tested Luna routes: **Quasar (sub only)** and **Nova (sub/dub)**. Source settings select audio, servers, captions and request timeout. A failed server does not discard results from another. Quasar is never labeled as dub because its upstream dub request returned the sub link during testing. Other website embed, torrent and unverified server routes are not included. Anime only; no manga provider is added.

AnimeDex supplies its catalog and stream resolution; playback uses Luna's proxy URLs unchanged so playlist segments, headers and captions retain their upstream handling. Nova shares MegaPlay infrastructure with some existing anime providers, so this is not an entirely independent fallback.

## 0.2.4: working baseline plus backups

The original Anikoto, AnimeKai, AniWave and CineStream bundles retain the exact 0.2.2 runtime code; only their version is raised so devices on 0.2.3 can update. The reverted Japanese-sub labeling change is not included.

After refreshing the repository, update the existing four sources and install **AnimeGG** and **Videasy** from the repository list. New sources are separate installs; an update does not automatically install them.

- **AnimeGG**: independent anime catalog and direct MP4 hosting, adapted from Yuzono AnimeGG. Sub/dub selection is available when the site offers it. Subbed videos can have captions embedded in the picture; there is no extra subtitle track to turn off. English alternate-title matching is supported.
- **Videasy**: movies/series with the Yoru/CDN streaming backend, adapted from Yuzono's Cineby extractor. Uses Cinemeta for catalog data and a fresh Videasy seed plus enc-dec.app for resolution. Cineby's website announces closure; this provider uses the independently responding Videasy backend, not its website player. Other unverified servers are not included.

Live checks on 15 September 2026: the generated AnimeGG provider decoded Black Summoner episodes 1 (1080p) and 2 (720p); the generated Videasy provider decoded Inception and The Mentalist S1E1 (1080p), three seconds of audio/video each. These are PC decoding checks, not phone/TV verification or a guarantee of uninterrupted availability. Both new backends differ from the existing MegaPlay/VaPlayer playback paths. CineStream and Videasy still share Cinemeta catalog availability.

## Sources

- **Anikoto**, **AnimeKai (Unoriginal)** and **AniWave (Unoriginal)**: anime search, details, episodes and supported direct sub/dub streams.
- **CineStream**: Cinemeta movies/series and VaPlayer playback, adapted from Megix/CSX.

Manganato and manga support have been removed from this repository at the owner's request. An already-installed manga source must be uninstalled in the app; removing it from a manifest cannot uninstall it remotely.

## 0.2.2 fixes

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

Edit shared helpers, `anime-core.js` or `cine-core.js`, then regenerate the seven standalone `serenity-*.js` files and manifest. No package installation is required.

Anime bundles and shared helpers: Apache-2.0. CineStream adapted core and generated bundle: GPL-3.0-or-later. See [NOTICE.md](NOTICE.md), [LICENSE](LICENSE) and [LICENSE-GPL-3.0](LICENSE-GPL-3.0).

### Season-zero compatibility
The native source excludes season-zero specials because Zangetsu pairs source episodes with catalogue episodes by list position. Regular episodes start at S1E1, preventing specials from taking their playback slots. A regression fixture checks that a leading special cannot shift seasons 1 and 2.


AnimeDex verification on 16 September 2026: generated provider search/home/pagination and Black Summoner episodes 1–2 passed; Quasar sub, Nova sub and Nova dub each decoded three seconds of audio/video per episode. Caption files were fetched and cue content checked. These were PC decoding checks; phone/TV playback has not yet been verified.

