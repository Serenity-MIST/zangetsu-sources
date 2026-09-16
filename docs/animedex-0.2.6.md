# AnimeDex 0.2.6 server checks

Tested 16 September 2026 using Black Summoner (AniList 145260) episode 1 and Solo Leveling (AniList 151807) episode 1. Each of the 27 website servers was requested for sub and dub. Only the 10 entries with successful playback are included in the released settings. Returned native candidates were sampled with FFmpeg for two seconds of decoding. These are PC checks, not phone/TV verification or guarantees for other episodes.

## Settings

**Enable all servers** is on by default. It overrides the custom server selection. Turn it off to use the numbered multi-select list; its 10 verified entries follow the supplied AnimeDex screenshots. Results retain that order even when requests finish out of order. Sub/dub and subtitle preferences still apply. A failing route does not discard another route's results.

“Enabled” means the adapter attempts the route. It cannot make an unavailable upstream service work. Failed manifests, HTML/ad responses, broken internal playlist URLs and empty MP4 files are filtered. Quasar and Pulsar dub are excluded for the reasons below.

## Results of all 27 checked routes

Only entries marked Pass in at least one audio mode are included. The 17 unsuccessful entries are omitted from the released adapter.

| # | Website entry | Black Summoner sub / dub | Solo Leveling sub / dub |
|---|---|---|---|
| 1 | VidNest Embed | Pass / Pass | Pass / Pass |
| 2 | VidNest Pahe Embed | Pass via fallback / Pass via fallback | Pass via fallback / Pass via fallback |
| 3 | MegaPlay Embed | Pass / Pass | Pass / Pass |
| 4 | Anikoto Embed | No episodes / No episodes | No episodes / No episodes |
| 5 | Mega MF | Upstream error / Upstream error | Upstream error / Upstream error |
| 6 | AniWaves MF | Pass / Pass | Pass / Pass |
| 7 | Kuro MF | Non-JSON upstream error / same | Non-JSON upstream error / same |
| 8 | Rika MF | Non-JSON upstream error / same | Non-JSON upstream error / same |
| 9 | Mimi Kiwi | Non-JSON upstream error / same | Non-JSON upstream error / same |
| 10 | Mochi Kiwi | Non-JSON upstream error / same | Non-JSON upstream error / same |
| 11 | Beep Kiwi | Non-JSON upstream error / same | Non-JSON upstream error / same |
| 12 | AniPahe Kiwi | Non-JSON upstream error / same | Non-JSON upstream error / same |
| 13 | Neko AVX | Non-JSON upstream error / same | Non-JSON upstream error / same |
| 14 | Hina AVX | Pass after URL signing / Pass | Pass after URL signing / Pass |
| 15 | Miku AVX | No streams / No streams | No streams / No streams |
| 16 | Yuki AVX | No streams / No streams | No streams / No streams |
| 17 | Rem AVX | 6 playable MP4s / No streams | 4 playable MP4s / 1 playable MP4 |
| 18 | Zero AVX | Non-JSON upstream error / same | Non-JSON upstream error / same |
| 19 | Quasar Luna | Pass / Wrong sub link returned | Pass / Wrong sub link returned |
| 20 | Pulsar Luna | Pass / Broken playlist | Pass / Broken playlist |
| 21 | Nova Luna | Pass / Pass | Pass / Pass |
| 22 | Orion Luna | Upstream 500 / Upstream 500 | Upstream 500 / Upstream 500 |
| 23 | Draco Luna | Pass after proxy correction / Pass | Pass after proxy correction / Pass |
| 24 | Atlas Luna | Upstream 500 / Upstream 500 | Upstream 500 / Upstream 500 |
| 25 | Zenith Luna | Video 403 / Video 403 | Video 403 / Video 403 |
| 26 | Cygnus Luna | No streams / No streams | No streams / No streams |
| 27 | Nebula Luna | No streams / No streams | No streams / No streams |

## Corrections and limits

- MegaPlay: decrypt its public source response locally and sign the short-lived playback URL.
- Hina: sign the otherwise forbidden URL; retrieve matching MegaPlay caption tracks when Hina omits them.
- Draco: its proxy playlist failed decoding; the original video URL supplied inside the response decodes with the appropriate playback Referer.
- VidNest: decode its public response format. The Pahe page currently tries Anitaku, AniWave, then MegaPlay; its first route had no decodable streams. The adapter uses the page's working AniWave fallback. These two VidNest entries share infrastructure, not independent backups.
- Pulsar: discard broken relative internal URLs. Only its sub path passed; dub is not advertised.
- Quasar: upstream dub requests returned the same sub video; never label that as English dub.
- Rem: one Black Summoner MP4 was zero bytes despite HTTP 200. A HEAD check filters it without downloading a movie during source resolution.
- After filtering, an enable-all check returned 22 streams across 10 entries for Black Summoner and 21 across 10 entries for Solo Leveling, in approximately 7–9 seconds before the additional Hina caption lookup. A final caption-aware check returned 16 streams / 9 entries for Black Summoner and 21 streams / 10 entries for Solo Leveling in roughly 6–8 seconds; Hina English captions fetched successfully using the playback headers. Counts and latency change with upstream availability.
- Ads: the provider does not execute site scripts, load ad iframes or open pop-ups. Only catalog, resolution, caption and media requests are used. HTML cannot be returned as a native playback stream.
- Selecting all services cannot guarantee uptime. Several labels use the same underlying hosts. Refresh an episode to obtain fresh signed URLs.

## Repository layout

- Root: `index.json`, generated installable bundles, build/package files, README and licenses. Existing install URLs stay unchanged.
- `src/`: editable source modules.
- `tests/`: offline contract and regression tests.
- `docs/`: this report.

Downloaded website scripts, signed video URLs, local captures and temporary probes are not published.
