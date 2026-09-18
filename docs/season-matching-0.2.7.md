# 0.2.7: correct season selection

## Cause

The inspected Zangetsu matching code (`lib/core/models/media_item.dart`, `bestTitleMatch` / `titleMatches`) removes season and part markers before comparing names, then accepts the first match. The former providers kept website result ordering and discarded `data-jp` aliases. The live Anikoto and AnimeKai searches put Tanya season 2 ahead of the original.

The adapter now reads each source's own alternate title, ranks exact season-aware identities first, and removes conflicting season/part entries in the same title family. It accepts equivalent labels such as “2nd Season”, “Season 2” and “II”, while preserving part numbers. It handles the leading article difference between “Saga of Tanya the Evil” and “The Saga of Tanya the Evil”. Broad partial searches continue to return broader results.

Each site is queried independently. No URLs, series IDs or episode lists are copied from another source. The shared parser is retained because the inspected sites use the same relevant markup and API contract; source-specific URLs and results remain separate.

## Live verification, 18 September 2026

| Source | Tanya original, episode 1 | Solo Leveling original, episode 1 | Tanya sequel search |
|---|---|---|---|
| Anikoto | 12 episodes; sub and dub decoded | 12 episodes; two sub links and one dub link decoded | `/watch/youjo-senki-ii` |
| AnimeKai | 12 episodes; sub and dub decoded | 12 episodes; sub and dub decoded | `/watch/youjo-senki-ii-goyvj` |
| AniWave | 12 episodes; sub and dub decoded | 12 episodes; sub and dub decoded | `/watch/youjo-senki-ii` |

Paths are relative to each source's own host. English and Romaji original-title searches selected the original season on all three sites. Playback checks decoded two seconds from every returned sample link using its required headers. The sequel checks verify selection only, not sequel playback. No signed media URLs are published.

Offline tests cover the three domains separately, original versus sequel order, English/Romaji aliases, part numbers, season-number formats, no substitution when only the wrong season is available, partial searches, and the five-source manifest. Existing extraction, cryptography, subtitles, settings and movie/series regressions passed.

## Removal and limits

AnimeGG and AnimeDex are removed from the manifest, generated bundles, editable source and active tests. Historical reports are retained as history. CineStream and Videasy runtime behavior is unchanged.

Zangetsu can reuse a saved source/season mapping without calling search. Such a mapping must be corrected once using the app's “Wrong title?” picker. This repository cannot remotely clear app mappings or uninstall removed sources. PC tests do not confirm playback on the user's phone or TV, and upstream availability can change.
