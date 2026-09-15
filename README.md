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

This is a **0.1.1 experimental port**, not a claim of verified in-app playback. Automated fixture tests check the native contracts and selected parsing/extraction cases. Website availability is a separate check. Phone/TV playback and reading require testing in Zangetsu.

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


## 0.1.1 playback investigation

Compared the official Zangetsu `provider_manager.dart` getVideoSources call, `video_source.g.dart` deserialization and `player_controller.dart` Media(httpHeaders) handoff. The port matches these interfaces. MegaPlay now returns `enc` instead of `sources`; this release decodes that response and also accepts string, object and array source formats. The CBC decoder is checked against Node's independent crypto implementation.

Live testing on 2026-09-15 resolved Black Summoner episodes 1 and 2 into sub/dub stream URLs. However, the returned CDN master playlists responded HTTP 403 from the test connection. **Playback remains unresolved**; successful extraction is not proof of successful playback. No application modification is included in this provider repository.
