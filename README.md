# Serenity Zangetsu Sources

Experimental native JavaScript ports of three Yuzono anime providers and Keiyoushi's Manganato provider.

## Install in Zangetsu

Paste this **manifest URL** into Zangetsu's native JavaScript provider-repository field:

```
https://raw.githubusercontent.com/Serenity-MIST/zangetsu-sources/main/index.json
```

Refresh the repository, then install the providers you want. This is a Zangetsu manifest, not an Aniyomi APK index. Manganato is marked as mixed/adult-capable content, matching its upstream content warning; it may be hidden by the app's content filter.

| Provider | Upstream variant | Initial domain |
|---|---|---|
| Anikoto | Yuzono AnikotoTheme | anikototv.to |
| AnimeKai (Unoriginal) | Yuzono KotoKai | animekaitv.to |
| AniWave (Unoriginal) | Yuzono AniWave | animewave.to |
| Manganato | Keiyoushi MangaBox | www.natomanga.com |

The “Unoriginal” labels come from Yuzono. They distinguish these variants from other sites with similar names.

## What is implemented

- Native manifest and four standalone provider files, with no APK dependency.
- Popular/latest lists, text search, details and episode/chapter lists.
- Anime server discovery, direct HLS/MP4 URLs, nested player pages, plain and AES-CBC encrypted getSources responses, and caption tracks.
- Manganato chapter API and ordered image-page lists, with image Referer headers.
- Explicit HTTP/parser errors, bounded server attempts and separate stable provider IDs.

## Limits — read before testing

This is a **0.1.2 experimental port**, not a claim of verified in-app playback. Automated fixture tests check the native contracts and selected parsing/extraction cases. Website availability is a separate check. Phone/TV playback and reading require testing in Zangetsu.

Yuzono uses an Android local proxy for Kiwi-Stream, VidPlay, mewcdn, and getSourcesNew paths that can require removing leading bytes from video segments. Zangetsu's native JavaScript contract does not expose that proxy. These paths are not advertised as playable by this port. A repository alone cannot add a missing native player capability. Direct supported servers are attempted instead; if none work, the provider reports an error.

The supplementary mapper API, source preference UI, automatic domain rotation, manga image merging and alternate image-CDN retry are not included in this version. Manganato's old entries may require adding the title again under its current domain. Never assume an old domain is equivalent just because it has the same branding.

## Verify on your devices

For each provider: install, load Popular, search, open details, load episodes/chapters, and play/read. For anime, test sub and dub separately, seeking, subtitles and switching servers. Repeat on Android TV. Record app version, provider version, source, episode/chapter, selected server and exact error. Do not include account credentials in reports.

## Development

Node.js is needed only to build/test locally; the app downloads plain JavaScript.

```
node build.js
node tests.js
```

Edit common.js and anime-core.js or manga-core.js; regenerate the four serenity-*.js files. Bump the version in build.js when publishing a change. Commit both editable and generated files. No package installation, secret keys or service account is required.

See NOTICE.md and LICENSE for attribution and licensing. Source websites remain external services; their availability and markup can change.



## 0.1.2 playback fix and verification

MegaPlay requires two steps: decrypt its `enc` response, then sign the playlist URL. Version 0.1.1 handled only the first step and its unsigned master playlists returned HTTP 403. Version 0.1.2 generates the same 90-second HMAC-SHA256 URL token as the public web player. Existing signed URLs are preserved, and other hosts are not signed.

Verified on 2026-09-15:
- Black Summoner episodes 1 and 2, sub and dub: Anikoto, AnimeKai and AniWave returned HTTP 200 master playlists, variant playlists and actual MPEG-TS video segments. FFmpeg successfully decoded the first three seconds of each tested stream, including audio and video.
- Solo Leveling episode 1, sub and dub on Anikoto: the same checks passed.
- Cryptography regression tests compare AES-CBC decoding and HMAC-SHA256 signing against Node's independent crypto implementation.

The official Zangetsu app passes provider headers into `Media(playUrl, httpHeaders: s.headers)` and configures `extension_picky=0,allowed_extensions=ALL`, which permits the CDN's video segments with `.jpg`, `.html` and `.js` suffixes. Those sampled segments contain real MPEG-TS bytes; no segment-stripping proxy was needed for these tests. Source files examined: `lib/core/provider/provider_manager.dart`, `lib/core/models/video_source.g.dart`, and `lib/features/player/player_controller.dart` in https://github.com/Spyou/Zangetsu.

Refresh the repository and update the installed providers to 0.1.2. Reopen the episode to obtain a fresh signed URL. Tokens expire after 90 seconds, so old resolved links must not be reused. These are live network/decoder checks, not a claim that the user's installed Zangetsu build has been tested directly.
- Additional playback checks: seeking to 90 seconds and decoding three seconds succeeded for Black Summoner episode 1 sub/dub; both subtitle requests returned HTTP 200 and valid WebVTT.
