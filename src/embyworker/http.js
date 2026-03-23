// src/embyworker/http.js

const CREDENTIALS_GIST_RAW_URL = "https://gist.githubusercontent.com/lielayt/01e8aec73350f3d7b35469d69eb15dc6/raw";
const CREDENTIALS_OWNER_LABEL = "Liel";
const WORKER_URL = "https://emby.lielayt.workers.dev";

let cachedCredentialsPromise = null;

function readText(res) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
}

function toNumberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

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

async function workerFetch(path, credentials, options = {}) {
    const url = `${WORKER_URL}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-Emby-Username": credentials.username,
            "X-Emby-Password": credentials.password,
            ...(options.headers || {})
        }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export { getCredentials, workerFetch, toNumberOrNull, WORKER_URL };