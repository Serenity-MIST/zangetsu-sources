# Attribution and changes

This is an independent, experimental port, not an official Zangetsu, Yuzono, or Keiyoushi repository.

Anime parsing, VRF transformation, site definitions and direct-stream extraction are adapted from [Yuzono anime-extensions](https://github.com/yuzono/anime-extensions), notably AnikotoTheme.kt, AnikotoExtractor.kt, Anikoto.kt, AniWave.kt and KotoKai.kt, inspected 15 September 2026. Upstream README copyright: **Copyright 2015 Javier Tomás**. Credit also belongs to the Yuzono contributors, including the authors recorded in each source file's Git history.

Manga catalogue, chapter and page parsing is adapted from [Keiyoushi extensions-source](https://github.com/keiyoushi/extensions-source), notably MangaBox.kt and Manganato.kt plus the manganelo build configuration, inspected 15 September 2026. Upstream README copyright: **Copyright 2015 Javier Tomás**. Credit also belongs to the Keiyoushi contributors recorded in Git history.

Both upstreams license this code under Apache License 2.0. See LICENSE.

Changes: translated Kotlin logic into standalone JavaScript for Zangetsu; replaced Jsoup with a small HTML tree parser; replaced Android networking and model objects with Zangetsu's fetch and JSON contracts; bundled shared logic per provider; bounded requests; omitted Android-only binary segment proxies, supplementary mapper sources, image merging, tracker integration and source-specific preference screens. Preserved explicit errors when a direct stream cannot be produced.

Zangetsu's public provider contract and JSON models were consulted for interoperability. No Zangetsu application code is bundled. Zangetsu is separately licensed under GPL-3.0.

The MegaPlay response decoding and URL-signing compatibility code follows the public web player's protocol observed at https://megaplay.buzz/lib/newclient.min.js and https://megaplay.buzz/lib/e1-player.min.js. The provider contains locally implemented cryptographic routines and does not download or execute those scripts at runtime.
