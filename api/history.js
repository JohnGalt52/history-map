// Vercel Serverless Function - Local History API
// Proxies requests to Claude Sonnet, keeping API key server-side

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Get parameters
    const { place, year } = req.query;
    
    if (!place || !year) {
        return res.status(400).json({ error: 'Missing place or year parameter' });
    }
    
    // Rate limiting (simple in-memory, resets on cold start)
    const clientIP = req.headers['x-forwarded-for'] || 'unknown';
    
    try {
        const result = await queryAnthropic(place, parseInt(year));
        res.status(200).json({ result });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch history' });
    }
}

async function queryAnthropic(placeName, year) {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    
    if (!ANTHROPIC_API_KEY) {
        throw new Error('API key not configured');
    }
    
    const yearLabel = year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
    
    const prompt = `You are a historical expert. Provide a concise overview of ${placeName} during ${yearLabel}.

Include (if relevant):
• Indigenous peoples or tribes
• Settlements, colonies, or cities
• Political control (empire, kingdom)
• Notable events or conflicts
• Economic activities
• Notable historical figures

Keep response under 200 words. Use bullet points for clarity.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 400,
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });
    
    if (!response.ok) {
        const error = await response.text();
        console.error('Anthropic error:', error);
        throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content?.[0]?.text || 'No information available.';
}
