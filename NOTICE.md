# Attribution and changes

This is an independent, experimental port, not an official Zangetsu, Yuzono, Keiyoushi, or CSX repository.

Anime parsing, VRF transformation, site definitions and direct-stream extraction are adapted from [Yuzono anime-extensions](https://github.com/yuzono/anime-extensions), notably AnikotoTheme.kt, AnikotoExtractor.kt, Anikoto.kt, AniWave.kt and KotoKai.kt, inspected 15 September 2026. Upstream README copyright: **Copyright 2015 Javier Tomás**. Credit also belongs to the Yuzono contributors, including the authors recorded in each source file's Git history.

Yuzono licenses this code under Apache License 2.0. See LICENSE.

Changes: translated Kotlin logic into standalone JavaScript for Zangetsu; replaced Jsoup with a small HTML tree parser; replaced Android networking and model objects with Zangetsu's fetch and JSON contracts; bundled shared logic per provider; bounded requests; omitted Android-only binary segment proxies, supplementary mapper sources, image merging, tracker integration and tracker-specific preference screens. Preserved explicit errors when a direct stream cannot be produced.

Zangetsu's public provider contract and JSON models were consulted for interoperability. No Zangetsu application code is bundled. Zangetsu is separately licensed under GPL-3.0.

The MegaPlay response decoding and URL-signing compatibility code follows the public web player's protocol observed at https://megaplay.buzz/lib/newclient.min.js and https://megaplay.buzz/lib/e1-player.min.js. The provider contains locally implemented cryptographic routines and does not download or execute those scripts at runtime.

## CineStream

`cine-core.js` is adapted from [SaurabhKaperwan/CSX](https://github.com/SaurabhKaperwan/CSX), commit `3bd036dee10fc4f7cf364ed3d50e6cf71563b4c0`, specifically CineStreamProvider.kt and the VaPlayer routine in CineStreamExtractors.kt, with API URLs from ApiConstants.kt. Credit: SaurabhKaperwan, Megix and CSX contributors. The upstream README licenses the extensions under GPL version 3 or later.

The modified `cine-core.js` and generated `serenity-cinestream.js` are distributed under **GPL-3.0-or-later**; see LICENSE-GPL-3.0. Shared Apache-2.0 helpers retain their license and notices within this combined provider. The three anime source bundles and their helpers remain Apache-2.0 (LICENSE).

Changes made 15 September 2026: translated Cinemeta catalog/search/detail/episodes and VaPlayer extraction into native JavaScript; preserved playback Referer and captions; added season-prefixed episode titles, settings, validation and bounded requests. This port includes movies and series using VaPlayer, not the entire upstream provider registry, anime mappings, torrent/debrid integrations or Android plugin UI. All corresponding editable source and build files are included in this repository.

## 0.2.4 backup providers

AnimeGG parsing and extraction are adapted from Yuzono AnimeGG.kt. Videasy's session/seed request and response protocol are adapted from Yuzono CinebyExtractor.kt and CinebyDto.kt, inspected at commit bcc555edec1d9e7cf416f681e1049f56a882c9d9. Upstream: https://github.com/yuzono/anime-extensions (Apache-2.0; Copyright 2015 Javier Tomás and contributors).

Changes: native JavaScript ports, English alias matching, ascending episodes, isolated settings, fresh session handling and a playback-header correction. Only the tested Yoru/CDN backend is included. AnimeGG remains Apache-2.0. The Videasy bundle combines Apache-2.0-derived extraction with the GPL-3.0-or-later CSX catalog helpers and is distributed under GPL-3.0-or-later. All editable sources and build files are supplied.

## AnimeDex 0.2.5

`animedex-core.js` is an original Apache-2.0 native adapter implementing the public catalog and player request/response protocol observed on https://animedex.fun in Chrome on 16 September 2026. No AnimeDex website application code is bundled or executed. AnimeDex and Luna remain third-party services. The provider preserves Luna proxy URLs and does not include the website's accounts, social features, ads, torrents, manga or embedded players.

## AnimeDex 0.2.6

The original adapter in `src/animedex-core.js` now implements the public MF, Kiwi, AVX, Luna, MegaPlay and VidNest response protocols observed on AnimeDex and VidNest on 16 September 2026. Website ordering and server names are retained for interoperability. No downloaded website scripts or advertising code are bundled or executed. Native extraction, validation and settings are locally implemented. The earlier statement that Luna proxy URLs are always preserved is superseded for Draco: its response supplies a directly playable original URL. See `docs/animedex-0.2.6.md`. Editable modules have moved to `src/`; their licenses are unchanged.

## 0.2.7

AnimeGG and AnimeDex code and bundles were removed at the repository owner's request. Their earlier credit entries and reports describe historical releases. The remaining anime adapter now preserves per-site alternate titles and performs season-aware result ranking. No application matching code is bundled. CineStream and Videasy runtime logic is unchanged.

