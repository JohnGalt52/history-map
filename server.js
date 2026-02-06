// Local development server with API proxy
// Run: ANTHROPIC_API_KEY=your-key node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;

// Get API key from environment
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.geojson': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
};

async function handleApiRequest(req, res, query) {
    const params = new URLSearchParams(query);
    const place = params.get('place');
    const year = parseInt(params.get('year'));
    
    if (!place || !year) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing place or year' }));
        return;
    }
    
    if (!ANTHROPIC_API_KEY) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set. Run: ANTHROPIC_API_KEY=your-key node server.js' }));
        return;
    }
    
    try {
        const result = await queryAnthropic(place, year);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
    } catch (err) {
        console.error('API error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
    }
}

async function queryAnthropic(placeName, year) {
    const yearLabel = year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
    
    const prompt = `You are a historical expert. Provide a concise overview of ${placeName} during ${yearLabel}.

Include (if relevant):
• Indigenous peoples or tribes
• Settlements, colonies, or cities
• Political control (empire, kingdom)
• Notable events or conflicts
• Economic activities

Keep response under 200 words. Use bullet points.`;

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
            messages: [{ role: 'user', content: prompt }]
        })
    });
    
    if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.content?.[0]?.text || 'No information available.';
}

function serveStatic(req, res, filePath) {
    const fullPath = path.join(__dirname, filePath === '/' ? 'index.html' : filePath);
    const ext = path.extname(fullPath);
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    const [pathname, query] = req.url.split('?');
    
    if (pathname === '/api/history') {
        handleApiRequest(req, res, query || '');
    } else {
        serveStatic(req, res, pathname);
    }
});

server.listen(PORT, () => {
    console.log(`\n🗺️  History Map server running at http://localhost:${PORT}`);
    if (ANTHROPIC_API_KEY) {
        console.log('✅ Anthropic API key loaded');
    } else {
        console.log('⚠️  No ANTHROPIC_API_KEY set - AI history will not work');
        console.log('   Run: ANTHROPIC_API_KEY=your-key node server.js');
    }
    console.log('');
});
