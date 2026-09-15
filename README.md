# Serenity Zangetsu Sources

Native JavaScript sources for Zangetsu. Current release: **0.2.0**.

## Install or update

Use this repository URL in Zangetsu:

```
https://raw.githubusercontent.com/Serenity-MIST/zangetsu-sources/main/index.json
```

Refresh the repository and update the installed sources to **0.2.0**. Install **CineStream** from the same repository. Open the settings icon beside an installed source to change its preferences. Reopen the title/episode or refresh its home page to apply the relevant change to newly loaded content.

| Source | Features | Source settings |
| --- | --- | --- |
| Anikoto | Anime catalog and direct sub/dub streams | Audio: both/sub/dub; subtitle tracks; popular/latest home order; request timeout |
| AnimeKai (Unoriginal) | Yuzono's KotoKai variant | Same anime settings |
| AniWave (Unoriginal) | Yuzono's AnikotoTheme variant | Same anime settings |
| Manganato | Manga catalog, chapters and image pages | Primary/backup image server; popular/latest home order; request timeout |
| CineStream | Cinemeta movies/series and VaPlayer playback | Movies/series/both; all servers or server 1/2/3; subtitle tracks; request timeout |

Settings are independent for each installed source and use Zangetsu's native settings system, present in 2.1.1. Defaults preserve the previous anime and manga behavior. Backup manga images use the second CDN supplied by the chapter, falling back to the primary when there is no second CDN. Manganato is marked as mixed/adult-capable content, matching its upstream flag, and may be hidden by the app's content filter.

## Manga compatibility in Zangetsu 2.1.1

The app's Manga tab and metadata title matching accept **Mihon sources only** (IDs beginning with `mihon:`). Installing our JavaScript Manganato source does not make it eligible for that flow, even with the adult-source filter enabled. The source type in the manifest cannot override this app restriction.

For manga reading in 2.1.1, add the official [Keiyoushi repository](https://keiyoushi.github.io/docs/guides/getting-started) under **Providers → Mihon**, install **Manganato**, and select that source. The upstream index is `https://github.com/keiyoushi/extensions/raw/repo/index.pb`. The installed Mihon Manganato was detected on the user's phone on 15 September 2026. Cloudflare checks remain a separate website requirement.

The JavaScript Manganato bundle is retained for compatible direct-source flows and development; it is not the supported route for 2.1.1's Manga catalog. Earlier instructions suggesting it would appear there were incorrect.

## CineStream scope

Adapted from [Megix/CSX CineStream](https://github.com/SaurabhKaperwan/CSX/tree/master/CineStream). This first native port includes **Cinemeta movie and series catalogs, search, details, seasons/episodes, and VaPlayer direct playback**. It does not include every Cloudstream extractor. Upstream is currently on hiatus.

Two Videasy routes tested during development failed upstream (Downloader HTTP 404 and Neon HTTP 500). They are excluded from the published source. The native port does not include torrent/debrid support, the Kitsu anime catalog, Cloudstream's Android settings UI or binary networking features. Use the existing anime sources for anime.

A catalog entry does not guarantee a stream is available. Selecting a single VaPlayer server narrows the returned list; use **All available** if that server is missing. Subtitle tracks appear only when supplied by the playback API. New/unreleased series episodes are omitted when their release date is known.

## Verification

Checked on 15 September 2026:

- CineStream: home lists, search, movie detail and series episodes loaded. Inception and Breaking Bad S1E1 returned HLS playlists; the first VaPlayer stream for each decoded three seconds of video/audio successfully in FFmpeg. CineStream playback on the phone/TV still needs a user test.
- After adding settings: Black Summoner episode 1 sub and dub on Anikoto returned HTTP 200 playlists and video segments; seeking to 90 seconds and decoding succeeded; subtitle responses were valid WebVTT.
- Automated fixtures verify all five provider contracts, per-source setting IDs, changing settings without reloading, audio filtering, subtitles, timeouts, home ordering, manga backup CDN selection, CineStream search/paging, season ordering, future episode filtering, movie playback payloads and server selection.
- Existing AES-CBC and HMAC-SHA256 implementations still match independent Node crypto tests.
- The user confirmed anime playback on their phone running Zangetsu 2.1.1 after the 0.1.2 fix. Earlier network checks also passed Black Summoner episodes 1–2 sub/dub on all three anime sources and Solo Leveling episode 1 on Anikoto. These are sampled checks, not verification of every title or server.

## Anime playback compatibility

Version 0.1.2 fixed MegaPlay playback by decrypting the `enc` response and signing the playlist URL with a short-lived token. This remains included in 0.2.0. Reopen an episode to obtain fresh links; old resolved links expire.

Kiwi-Stream, VidPlay, mewcdn and getSourcesNew routes requiring Android binary segment rewriting remain unsupported by this native JS port. Supported direct servers are attempted instead. Mapper APIs, automatic domain rotation and manga image merging are not implemented.

## Development and licensing

No package installation is required. Build and test using Node:

```
node build.js
node tests.js
node settings-tests.js
```

Edit `settings.js`, `common.js` and the appropriate `anime-core.js`, `manga-core.js` or `cine-core.js`; then regenerate all `serenity-*.js` files and `index.json`. Commit editable and generated files together. `player-crypto.js` supports the anime players.

The existing anime/manga sources and shared helpers are Apache-2.0. CineStream's adapted core and generated bundle are GPL-3.0-or-later. See [NOTICE.md](NOTICE.md), [LICENSE](LICENSE) and [LICENSE-GPL-3.0](LICENSE-GPL-3.0) for attribution and complete license texts. This is an independent port, not an official Zangetsu, Yuzono, Keiyoushi or CSX release.
