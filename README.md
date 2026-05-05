# Soundscappe

Soundscappe is a Spotify listening insights app built with React, Vite, Tailwind, and the Spotify Web API.

## Repository layout

- `soundscape/` - main app
- `claude/ai-logs/` - session logs and build notes

## Local development

1. `cd soundscape`
2. Copy `.env.example` to `.env` and set your Spotify Client ID
3. Run `npm install`
4. Run `npm run dev`

## Build

```bash
npm run build
```

## Deploy

Cloudflare Pages works with the Vite build output in `dist`.
