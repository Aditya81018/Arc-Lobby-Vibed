# Agent Rules

1. Never try to test the app yourself. The user will test the app and provide reviews.
2. Never run scripts like `pnpm dev` or `pnpm preview` that can affect the active workflow.
3. Always use the available skills.
4. Always use relative file paths for markdown links (e.g. `../client/src/...`) rather than absolute `file://` scheme paths, to ensure portability across setups.

## Project Reference Specifications
When implementing features, fixing bugs, or expanding the application, you must refer to and follow the documentation files:
- [PRD.md](./PRD.md) - For product specs, onboarding workflows, and core feature requirements.
- [DESIGN.md](./DESIGN.md) - For layout structure, styling theme, user-color configurations, and DaisyUI components.
- [FLOW.md](./FLOW.md) - For routing diagrams, user journey pathways, and Socket connection lifecycles.
- [TRD.md](./TRD.md) - For network data models, REST endpoints, WebSocket socket channels, and presence cleanup algorithms.
