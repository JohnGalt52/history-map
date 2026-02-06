/**
 * Local History Module - Semantic Zoom
 * Queries Gemini for location-specific historical context when zoomed in
 */

const LocalHistory = (function() {
    const GEMINI_API_KEY = 'AIzaSyDNm67CxCXF4yV1UBG2WKeN6eUch4Ue1xE';
    const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    const ZOOM_THRESHOLD = 8;
    const DEBOUNCE_MS = 1500;
    
    let map = null;
    let currentYear = 1492;
    let panel = null;
    let cache = new Map(); // key: "lat,lng,year" -> response
    let debounceTimer = null;
    let lastQuery = null;
    
    function init(mapInstance) {
        map = mapInstance;
        createPanel();
        
        map.on('zoomend moveend', () => {
            if (map.getZoom() >= ZOOM_THRESHOLD) {
                debouncedQuery();
            } else {
                hidePanel();
            }
        });
    }
    
    function createPanel() {
        panel = document.createElement('div');
        panel.id = 'localHistoryPanel';
        panel.innerHTML = `
            <div class="local-history-header">
                <span class="local-history-icon">🔍</span>
                <span class="local-history-title">Local History</span>
                <button class="local-history-close" onclick="LocalHistory.hide()">×</button>
            </div>
            <div class="local-history-location"></div>
            <div class="local-history-content">
                <div class="local-history-loading">
                    <div class="spinner"></div>
                    Researching local history...
                </div>
            </div>
            <div class="local-history-disclaimer">
                ⚠️ AI-generated historical context. Verify important facts.
            </div>
        `;
        document.body.appendChild(panel);
    }
    
    function setYear(year) {
        currentYear = year;
        if (map && map.getZoom() >= ZOOM_THRESHOLD) {
            debouncedQuery();
        }
    }
    
    function debouncedQuery() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(queryLocation, DEBOUNCE_MS);
    }
    
    async function queryLocation() {
        const center = map.getCenter();
        const lat = center.lat.toFixed(2);
        const lng = center.lng.toFixed(2);
        const yearBucket = Math.round(currentYear / 50) * 50; // Bucket by 50-year periods
        
        const cacheKey = `${lat},${lng},${yearBucket}`;
        
        // Skip if same query
        if (lastQuery === cacheKey) return;
        lastQuery = cacheKey;
        
        // Check cache
        if (cache.has(cacheKey)) {
            displayResult(cache.get(cacheKey));
            return;
        }
        
        showLoading();
        
        try {
            // Reverse geocode to get place name
            const placeName = await reverseGeocode(center.lat, center.lng);
            
            // Query Gemini
            const result = await queryGemini(center.lat, center.lng, placeName, currentYear);
            
            // Cache and display
            const data = { placeName, result, year: currentYear };
            cache.set(cacheKey, data);
            displayResult(data);
            
        } catch (error) {
            console.error('Local history error:', error);
            showError(error.message);
        }
    }
    
    async function reverseGeocode(lat, lng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
                { headers: { 'User-Agent': 'HistoryMap/1.0' } }
            );
            const data = await response.json();
            
            // Build place name from components
            const parts = [];
            if (data.address) {
                if (data.address.city || data.address.town || data.address.village) {
                    parts.push(data.address.city || data.address.town || data.address.village);
                }
                if (data.address.county) parts.push(data.address.county);
                if (data.address.state) parts.push(data.address.state);
                if (data.address.country) parts.push(data.address.country);
            }
            
            return parts.length > 0 ? parts.join(', ') : data.display_name || 'Unknown location';
        } catch (e) {
            return `Coordinates ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        }
    }
    
    async function queryGemini(lat, lng, placeName, year) {
        const yearLabel = year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
        
        const prompt = `You are a historical expert. Provide a concise but informative overview of what was happening at or near this location during this time period.

Location: ${placeName} (coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)})
Time Period: Around ${yearLabel}

Please include (if known/relevant):
- Indigenous peoples or tribes in the area
- Settlements, towns, or colonies
- Forts, trading posts, or military presence
- Notable events or conflicts
- Economic activities (farming, trade, mining, etc.)
- Political governance (who controlled this area?)
- Any notable historical figures associated with this place/time

Be specific to this exact location and time. If this area was uninhabited or little is known, say so. Keep response under 300 words. Use bullet points for clarity.`;

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500
                }
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('No response from Gemini');
    }
    
    function showLoading() {
        panel.style.display = 'block';
        panel.querySelector('.local-history-content').innerHTML = `
            <div class="local-history-loading">
                <div class="spinner"></div>
                Researching local history...
            </div>
        `;
        panel.querySelector('.local-history-location').textContent = 'Loading...';
    }
    
    function displayResult(data) {
        panel.style.display = 'block';
        
        const yearLabel = data.year < 0 ? `${Math.abs(data.year)} BCE` : `${data.year} CE`;
        panel.querySelector('.local-history-location').textContent = `${data.placeName} • ${yearLabel}`;
        
        // Convert markdown-style formatting to HTML
        let html = data.result
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\* /gm, '• ')
            .replace(/^- /gm, '• ')
            .replace(/\n/g, '<br>');
        
        panel.querySelector('.local-history-content').innerHTML = `<div class="local-history-text">${html}</div>`;
    }
    
    function showError(message) {
        panel.style.display = 'block';
        panel.querySelector('.local-history-content').innerHTML = `
            <div class="local-history-error">
                Unable to load local history.<br>
                <small>${message}</small>
            </div>
        `;
    }
    
    function hidePanel() {
        if (panel) {
            panel.style.display = 'none';
        }
        lastQuery = null;
    }
    
    function hide() {
        hidePanel();
    }
    
    return {
        init,
        setYear,
        hide
    };
})();

// Export for use
window.LocalHistory = LocalHistory;
