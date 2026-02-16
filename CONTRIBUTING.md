# Contributing to Ops HQ

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/My-hq.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env.local` and fill in your credentials
5. Run the dev server: `npm run dev`

## Development

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS v4
- **Canvas:** `components/OfficeCanvas.jsx` — the pixel-art rendering engine
- **Bridge API:** `app/api/gateway-bridge/route.js` — receives gateway events
- **Agent Config:** `lib/agents.js` — agent definitions, rooms, colors

## Pull Requests

1. Create a feature branch: `git checkout -b feature/cool-thing`
2. Make your changes
3. Test locally with `npm run dev`
4. Commit with a clear message
5. Push and open a PR

## Issues

Found a bug? Open an issue with:
- What you expected
- What actually happened
- Steps to reproduce

## Code Style

- Use functional components with hooks
- Keep files focused — one component per file
- Follow existing naming conventions
- Comment non-obvious logic

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
