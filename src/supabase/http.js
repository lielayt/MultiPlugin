// src/supabase/http.js

const SUPABASE_URL = "https://myhuovhvodgvqilsyvwg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15aHVvdmh2b2RndnFpbHN5dndnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE4NDUwNywiZXhwIjoyMDc3NzYwNTA3fQ.xI773iY_NqulD_qf50jlMCgYA4sitPPtgkdPb9IQdlU";

function toNumberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

// Wrapper for Supabase REST API calls
async function fetchSupabase(table, queryParams) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    
    // Append all filters (e.g. eq.tmdb_id=123)
    Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));

    // Default to selecting all columns if not specified
    if (!url.searchParams.has('select')) {
        url.searchParams.append('select', '*');
    }

    const res = await fetch(url.toString(), {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        console.error(`Supabase HTTP Error: ${res.status} - ${await res.text()}`);
        return null;
    }
    return res.json();
}

export { fetchSupabase, toNumberOrNull };