const EMBY_SERVER = "https://play.embyil.tv:443";
const USERNAME = "s851pmcm";
const PASSWORD = "Aa10203040!!";
const USER_ID = "3ee5327c07d44fed9e44b65958f990f1";

function getStreams(tmdbId, mediaType, season, episode) {

    return login().then(token => {

        return searchItem(token, tmdbId, season, episode).then(item => {

            if (!item) return [];

            let streamUrl = `${EMBY_SERVER}/Videos/${item.Id}/stream?static=true&api_key=${token}`;

            // For TV shows, append season/episode if needed
            if (mediaType === "tv" && season != null && episode != null) {
                const ep = item.Seasons?.find(s => s.IndexNumber === season)?.Episodes?.find(e => e.IndexNumber === episode);
                if (ep) streamUrl = `${EMBY_SERVER}/Videos/${ep.Id}/stream?static=true&api_key=${token}`;
            }

            return [{
                name: "Emby",
                title: item.Name,
                url: streamUrl,
                quality: "Auto",
                provider: "emby"
            }];

        });

    }).catch(() => []);
}

function login() {
    const headers = {
        "Content-Type": "application/json",
        "X-Emby-Authorization": 'Emby Client="EmbyWeb", Device="Android TV", DeviceId="androidtv-1234", Version="1.0.0"'
    };

    return fetch(`${EMBY_SERVER}/Users/AuthenticateByName`, {
        method: "POST",
        headers,
        body: JSON.stringify({ Username: USERNAME, Pw: PASSWORD })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.AccessToken) throw new Error("No AccessToken returned");
        return data.AccessToken;
    });
}

function searchItem(token, tmdbId, season, episode) {

    const url = `${EMBY_SERVER}/Users/${USER_ID}/Items?AnyProviderIdEquals=Tmdb.${tmdbId}&api_key=${token}`;
    return fetch(url)
        .then(res => res.json())
        .then(data => data.Items && data.Items[0]);
}

// Export for Nuvio
if (typeof module !== "undefined") module.exports = { getStreams };