import { fetchText } from './http.js';

export async function extractStreams(season, episode) {
    const url = `https://onepace.co/episode/one-pace-english-sub-${season}x${episode}/`;

    const html = await fetchText(url);

    const match = html.match(
        /anidek\.src\s*=\s*decodeURIComponent\("([^"]+)"/
    );

    if (!match) {
        console.log('[OnePace] Router URL not found');
        return [];
    }

    const routerUrl = decodeURIComponent(match[1]);

    console.log(`[OnePace] Router URL: ${routerUrl}`);

    const routerHtml = await fetchText(routerUrl);

    const embedMatch = routerHtml.match(
        /https:\/\/animedekho\.app\/embed\/video\.php\?id=([a-f0-9]+)/
    );

    if (!embedMatch) {
        console.log('[OnePace] AnimeDekho embed not found');
        return [];
    }

    const videoId = embedMatch[1];

    console.log(`[OnePace] Video ID: ${videoId}`);

    const playerUrl =
        `https://as-cdn26.top/player/index.php?data=${videoId}&do=getVideo`;

    const response = await fetch(playerUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://as-cdn26.top'
        },
        body:
            `hash=${encodeURIComponent(videoId)}` +
            `&r=${encodeURIComponent('https://animedekho.app/')}`
    });

    const result = await response.json();

    if (!result.videoSource) {
        console.log('[OnePace] No video source found');
        return [];
    }

    const masterUrl = result.videoSource;

    const playlistResponse = await fetch(masterUrl, {
        headers: {
            Referer: 'https://animedekho.app/'
        }
    });

    if (!playlistResponse.ok) {
        console.log(
            `[OnePace] Failed to fetch playlist: ${playlistResponse.status}`
        );
        return [];
    }

    const playlist = await playlistResponse.text();

    const lines = playlist.split(/\r?\n/);
    const streams = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!line.startsWith('#EXT-X-STREAM-INF:')) {
            continue;
        }

        const qualityMatch = line.match(/NAME="([^"]+)"/);
        const resolutionMatch = line.match(/RESOLUTION=(\d+)x(\d+)/);

        const streamUrl = lines[i + 1];

        if (!streamUrl || streamUrl.startsWith('#')) {
            continue;
        }

        const quality = qualityMatch
            ? qualityMatch[1]
            : resolutionMatch
                ? `${resolutionMatch[2]}p`
                : 'Unknown';

        const url = new URL(streamUrl, masterUrl).href;

        streams.push({
            name: 'OnePace',
            title: quality,
            url,
            quality,
            headers: {
                Referer: 'https://animedekho.app/'
            }
        });
    }

    console.log(`[OnePace] Found ${streams.length} quality streams`);

    return streams;
}