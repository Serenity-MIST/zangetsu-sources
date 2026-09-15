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
