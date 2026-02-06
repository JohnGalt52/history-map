# History Map

Interactive historical world map with AI-powered local history.

## Features

- 🗺️ **31 time periods** from 10,000 BC to 2010 AD
- 🏛️ **Historical borders** — See how nations changed over time
- 🔍 **AI-powered local history** — Click any territory for historical context (Claude Sonnet)
- ⏱️ **Timeline playback** — Animate through history
- 🌙 **Dark mode** — Apple Maps-inspired design

## Local Development

```bash
# Install nothing - just Node.js required

# Run with AI features
ANTHROPIC_API_KEY=your-key node server.js

# Run without AI (static files only)
python3 -m http.server 8888
```

Open http://localhost:8888

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy

The `/api/history` serverless function handles AI queries server-side.

## Keyboard Shortcuts

- `←` `→` — Previous/next time period  
- `Space` — Play/pause animation
- `Escape` — Close info panel

## Data Sources

- Historical borders: [historical-basemaps](https://github.com/aourednik/historical-basemaps)
- AI: Claude Sonnet via Anthropic API

## Project Structure

```
/
├── index.html          # Main app
├── server.js           # Local dev server with API proxy
├── api/
│   └── history.js      # Vercel serverless function
├── data/
│   ├── geojson/        # Historical border files
│   └── *.json          # Trade routes, wonders, etc.
└── vercel.json         # Vercel config
```

## License

MIT
