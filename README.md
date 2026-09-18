# Serenity Zangetsu Sources

Native anime, movie and series sources for Zangetsu. Current version: **0.2.7**.

## Install or update

```
https://raw.githubusercontent.com/Serenity-MIST/zangetsu-sources/main/index.json
```

Refresh the repository and update installed sources to 0.2.7.

**AnimeGG and AnimeDex have been removed**, including their bundles and editable code. If already installed in Zangetsu, uninstall those two sources in the app: changing this manifest cannot remotely uninstall them.

## Season matching fix

Anikoto, AnimeKai and AniWave now retain each site's English/Romaji names, prioritize the requested title and season, and exclude conflicting seasons/parts of that same title. Each source still searches its own site and uses its own result URLs. This fixes cases where the website lists season 2 first and Zangetsu ignores season markers when selecting a match.

**Previously remembered wrong matches:** open the affected anime's **Wrong title?** picker and select its correct season once for each affected source. The app stores that mapping locally; a source update cannot erase it. The source fix protects new searches, not already saved mappings that skip search entirely.

## Available sources

| Source | Content |
|---|---|
| Anikoto | Anime, available sub/dub direct streams |
| AnimeKai (Unoriginal) | Anime, available sub/dub direct streams |
| AniWave (Unoriginal) | Anime, available sub/dub direct streams |
| CineStream | Movies and series, VaPlayer routes |
| Videasy | Movies and series, Yoru/CDN routes |

No manga sources are included. Anime stream extraction is unchanged from 0.2.6; CineStream and Videasy change only their version number.

## Verification

On 18 September 2026, each of the three anime providers separately selected the original **The Saga of Tanya the Evil / Youjo Senki** and **Solo Leveling**, loaded 12 episodes for each, and decoded short sub and dub samples from episode 1. Tanya season 2 searches selected each website's distinct sequel URL. All offline regression checks passed.

These are PC decoding checks, not a new phone/TV playback confirmation or an uptime guarantee. See [the 0.2.7 report](docs/season-matching-0.2.7.md) for details.

## Settings

Anime sources offer sub/dub selection, subtitle tracks, request timeout, home ordering and audio-language override. CineStream offers movies/series filtering, same-title preference and server selection. Videasy uses the tested Yoru/CDN backend.

## Development

Editable modules are in `src/`, regression checks in `tests/`, reports in `docs/`. Root `serenity-*.js` files are generated installable bundles; their existing URLs remain stable.

```
node build.js
node tests/tests.js
node tests/settings-tests.js
node tests/backup-tests.js
node tests/season-tests.js
```

No package installation is required. Anime code and shared helpers retain Apache-2.0 licensing. CineStream and Videasy bundles combine the relevant Apache-2.0 helpers with GPL-3.0-or-later catalog code. See [NOTICE.md](NOTICE.md), [LICENSE](LICENSE) and [LICENSE-GPL-3.0](LICENSE-GPL-3.0).
