# Project Documentation — RSC + Cloudflare Workers (Based on vite-plugin-react template)

This document describes the architecture, setup, and workflows of a project derived from the **starter-cf-single** example in the vite-plugin-react repository. It integrates React Server Components (RSC) with Cloudflare Workers so that RSC and SSR can run on a single worker in production.

## Key features
* 🎯 **Simple & Intuitive Chat Interface**: Type messages as either Doctor or Patient using separate input boxes. Press Enter to send messages quickly. All conversations are displayed in real-time with clear role labels showing who said what.
* 🤖 **AI-Powered Medical Record Generation**: Click one button to instantly transform your entire conversation into a professional medical record. The AI analyzes the dialogue and generates a structured document with Chief Complaint, Symptoms, Assessment, and Plan sections.
* ⚡ **Fast & Responsive Experience**: No page reloads needed - everything updates instantly. The app works smoothly on desktop, tablet, and mobile devices with quick response times thanks to edge computing technology.
* 🔒 **Privacy-First Design**: Run with a local AI model so your medical conversations never leave your computer. No login required, no data storage, and all API credentials are kept secure on the server side.
* 📝 **Professional Output Format**: Generated medical records use proper medical terminology and industry-standard formatting. The output is ready to copy and paste into other systems with clear headers and organized sections.
* ⌨️ **Keyboard-Friendly Controls**: Navigate the entire app using just your keyboard. Press Enter to send messages, Tab to move between fields, and use the Generate button when ready - no mouse needed.
* 🎨 **Clean & Focused Design**: Minimalist interface keeps your attention on the conversation. Large, clearly-labeled buttons and inputs make the app easy to use without any training or instructions.
* 🔄 **Smart Workflow Management**: Input fields automatically clear after sending and focus moves to the next speaker. Buttons disable during processing to prevent duplicate submissions, and you get clear feedback at every step.
* 📱 **Works Everywhere**: Web-based application that runs in any browser on any device. No installation required, no apps to download - just open and start using immediately.
* 🚀 **Zero Learning Curve**: Start documenting conversations right away with three simple steps: type as patient, type as doctor, click generate. The interface is self-explanatory and forgiving of mistakes.
* 💡 **Real-Time Feedback**: See loading messages while AI processes your conversation. Get clear error messages if something goes wrong. Watch the medical record appear instantly when generation completes.

## Project Overview
- This project based on Source template: [packages/plugin-rsc/examples/starter-cf-single](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc/examples/starter-cf-single) from vite-plugin-react.
- RSC always runs on Cloudflare Workers.
- During development, SSR runs in Vite’s default Node environment.
- In production, the SSR build output is imported into the RSC build, and both execute in the same worker.
- Development communication is enabled via the plugin option `rsc({ loadModuleDevProxy: true })`.

## Architecture Deep Dive

### RSC + SSR Flow

1. **Initial Request**: Browser requests page
2. **RSC Rendering**: Server Components render on Cloudflare Workers
3. **RSC Stream**: Serialized React tree streams to client
4. **SSR Hydration**: HTML rendered server-side, hydrated in browser
5. **Client Interaction**: Client Components handle user input
6. **Server Actions**: Form submissions trigger server-side LLM calls
7. **Re-render**: New RSC payload updates UI without full page reload

### Server Actions Security

- API credentials never exposed to client
- Form data validated server-side
- CSRF protection via React's built-in mechanisms
- Content Security Policy compatible

## Prerequisites
- Node.js (LTS)
- npm or pnpm
- Cloudflare account + Wrangler CLI
- Any required environment variables/secrets (see Configuration)
- Optional: Nix with flakes enabled for reproducible local development

## Project Structure
```
src/
├── framework/          # RSC framework integration
│   ├── entry.browser.tsx  # Client-side entry
│   ├── entry.rsc.tsx      # Server component entry
│   └── entry.ssr.tsx      # SSR entry
├── action.tsx          # Server Actions (LLM integration)
├── client.tsx          # Client Components (Chat UI)
├── root.tsx            # Root RSC component
└── schema.ts           # TypeScript types

public/                 # Static assets
vite.config.ts         # Vite configuration
wrangler.jsonc         # Cloudflare Workers config
tsconfig.json          # TypeScript configuration
```
## Development Workflow
- Start dev server:
  - `npm run dev`
  - SSR runs on Node (Vite dev server), RSC runs on Workers dev.
- Build for production:
  - `npm run build`
- Preview production bundle locally:
  - `npm run preview`
- Deploy to Cloudflare Workers:
  - `npm run release`

## Configuration
### Vite (`vite.config.ts`)
- Enables the RSC plugin and Cloudflare integration.
- Key option: `rsc({ loadModuleDevProxy: true })` to proxy SSR modules during development.

### Cloudflare (`wrangler.jsonc`)
- Defines worker name, environments, routes, and compatibility flags for RSC/SSR.
- Add secrets/env as needed (e.g., `wrangler secret put API_KEY`).

### TypeScript (`tsconfig.json`)
- Sets target, module resolution, and strictness per project needs.

## Local Development with Nix (flake.nix)
This project includes a Nix flake to provide a reproducible dev environment across macOS and Linux.

### Files
- `flake.nix` — Declares dev shells and inputs using `flake-parts`.
- `flake.lock` — Pins `nixpkgs` and other flake inputs for deterministic environments.

### Supported systems
- `aarch64-darwin` (Apple Silicon macOS)
- `x86_64-darwin` (Intel macOS)
- `aarch64-linux`
- `x86_64-linux`

### Dev Shell
The default dev shell installs Node.js from Nix - [READ HERE](./flake.nix):

### Usage
- Enter the dev shell:
  - `nix develop` (flakes enabled) or `nix develop .` inside the repo
- Then run project scripts inside the shell:
  - `npm run dev`, `npm run build`, etc.

By using `flake.lock`, all contributors share the same pinned `nixpkgs` and toolchain versions, ensuring consistent Node.js and dependency resolution across machines.

## Deployment
1. Ensure a successful build: `npm run build`.
2. Configure secrets/env in Cloudflare (if required).
3. Deploy with `npm run release` or `wrangler deploy`.
4. Verify on the assigned Worker URL.

## Troubleshooting
- Module not found during dev:
  - Confirm `rsc({ loadModuleDevProxy: true })` is enabled.
- Runtime compatibility errors on Workers:
  - Check `wrangler.jsonc` compatibility flags and runtime version.
- HMR not working:
  - Ensure Vite dev server is running and no port conflicts exist.
- Env variables missing in production:
  - Use Wrangler secrets or `vars` in `wrangler.jsonc`.
- Nix shell issues:
  - Ensure flakes are enabled and you’re using a supported system. If Node.js versions differ from your global install, prefer running scripts inside `nix develop`.

## Best Practices
- Explicitly separate server and client components.
- Minimize client-side logic for better performance.
- Use Workers storage/caching (KV, Durable Objects, Cache API) where appropriate.
- Monitor bundle size and apply code-splitting.
- Keep `flake.lock` committed to version control to guarantee dev environment reproducibility.
