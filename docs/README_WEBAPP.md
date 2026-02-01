# clawd-mcp Webapp

Dark-themed React + Tailwind dashboard for clawd-mcp.

## Stack

- **React 18** + TypeScript
- **Vite** 6
- **Tailwind CSS** 3.4
- **React Router** 6
- **Lucide React** (icons)
- **class-variance-authority** + **clsx** + **tailwind-merge** (cn utility)

## Theme

- **Background**: `#0a0a0c` (near-black)
- **Accent**: `#f97316` (orange, OpenClaw lobster)
- **Card**: `#0f0f12`, `#16161a`
- **Border**: `#27272a`
- **Font**: Inter (sans), JetBrains Mono (mono)

## Structure

```
webapp/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   └── Dashboard.tsx
│   ├── styles/
│   │   └── main.css
│   └── utils/
│       └── cn.ts
└── public/
    └── favicon.svg
```

## Run

```bash
cd webapp
npm install
npm run dev
```

Port: **5180**

## Build

```bash
npm run build
```

Output: `webapp/dist/`

## Dashboard

- Tool cards: clawd_agent, clawd_sessions, clawd_skills, clawd_gateway
- Quick links: openclaw.ai, moltbook.com, docs.openclaw.ai, moltbook.com/heartbeat.md

## Future

- API proxy to clawd-mcp backend (if HTTP transport added)
- Gateway status live view
- Skills browser
- Moltbook feed preview
