# StreamPlay timeout fix — 0.2.9

Zangetsu's Auto Resolve gives a source eight seconds for title search, episode mapping and stream extraction together. Version 0.2.8 waited for both backends, serial groups of video checks and optional HLS audio metadata. The resulting wait could exceed that budget even when a backend supplied a working video. PC decoding tests in 0.2.8 did not exercise this application deadline.

Version 0.2.9 returns the first backend with available streams. The existing saved `all` setting now appears as **Fastest available**. Vidlink and VaPlayer can still be selected explicitly. Successful title metadata is reused for five minutes; failed requests are not cached. Requests share a seven-second search/resolve deadline, and availability checks run in parallel with a maximum of 600 milliseconds. A HEAD timeout is inconclusive and preserves the stream for Zangetsu's own playback probe. Explicit HTTP failures such as 429 are filtered. Audio language overrides still work, with no extra playlist fetch during resolution.

## Verification on 9 October 2026

The user reported the South African series **The Four of Us**, episode 8. The generated provider searched for the title, selected IMDb `tt43635088` / TMDB `327273`, loaded the show's episode metadata, and selected **season 1 episode 8**. This complete source sequence returned Vidlink 1080p and 480p streams with three subtitle tracks in **3,937 milliseconds**. FFmpeg then decoded a two-second video sample from the 1080p stream successfully on this PC.

The live test used the actual fetch timeout options in the generated bundle. No phone was connected through ADB, so playback on the user's device remains unconfirmed. Network and server delays can vary; the measured result is not a guarantee for every request or title.

All existing regression suites passed. New checks verify that a fast backend completes while another is still pending, a HEAD timeout does not discard a potentially playable URL, metadata is reused, request deadlines shrink as the budget is consumed, and exhausted requests stop before starting another network hop.

All five sources have version 0.2.9 so installed devices can discover the update. Only StreamPlay's runtime logic changed.
