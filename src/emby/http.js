// src/emby/http.js

const CREDENTIALS_GIST_RAW_URL = "https://gist.githubusercontent.com/lielayt/01e8aec73350f3d7b35469d69eb15dc6/raw";
const CREDENTIALS_OWNER_LABEL = "Liel";

let cachedCredentialsPromise = null;

function readJson(res) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function readText(res) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
}

function toNumberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

// Fetch credentials from your Gist (cached)
function getCredentials() {
    if (!cachedCredentialsPromise) {
        cachedCredentialsPromise = fetch(CREDENTIALS_GIST_RAW_URL)
            .then(readText)
            .then(parseCredentialsFromGistText);
    }
    return cachedCredentialsPromise;
}

function parseCredentialsFromGistText(text) {
    const cleaned = String(text || "").replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "");
    const lines = cleaned
        .split(/\r?\n/)
        .map(line => String(line || "").trim())
        .filter(Boolean);

    const ownerIndex = lines.findIndex(line => line.toLowerCase() === CREDENTIALS_OWNER_LABEL.toLowerCase());
    if (ownerIndex === -1 || !lines[ownerIndex + 1] || !lines[ownerIndex + 2]) {
        throw new Error(`Credentials for "${CREDENTIALS_OWNER_LABEL}" not found in gist`);
    }

    return {
        username: lines[ownerIndex + 1],
        password: lines[ownerIndex + 2]
    };
}

// Login to Emby and get access token & userId
async function login(credentials) {
    const EMBY_SERVER = "https://play.embyil.tv:443";
    const headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Amazon) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "X-Emby-Authorization": 'MediaBrowser Client="Emby for Android TV", Device="Amazon Fire TV", DeviceId="f47ac10b-58cc-4372-a567-0e02b2c3d479", Version="2.0.1"'
    };

    const res = await fetch(`${EMBY_SERVER}/Users/AuthenticateByName`, {
        method: "POST",
        headers,
        body: JSON.stringify({ Username: credentials.username, Pw: credentials.password })
    });

    const data = await readJson(res);

    if (!data.AccessToken) throw new Error("No AccessToken returned");
    const userId = (data.User && data.User.Id) || data.UserId || (data.SessionInfo && data.SessionInfo.UserId);
    if (!userId) throw new Error("No UserId returned");

    return { accessToken: data.AccessToken, userId };
}

export { getCredentials, login, readJson, readText, toNumberOrNull };