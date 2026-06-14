# T001 — Library Research: TypeScript Graph Visualization for Tolaria

## Codebase Context

- **Stack**: React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Tauri 2 (WKWebView)
- **UI library**: shadcn/ui + Radix UI + Mantine
- **Data ready**: `VaultEntry.outgoingLinks: string[]` and `VaultEntry.relationships: Record<string, string[]>` already extract wikilink targets and frontmatter relationship fields
- **Sidebar**: `SidebarTopNav.tsx` renders nav items with `NavItem` (icon + label + count badge). `SidebarSections.tsx` manages the full sidebar.
- **No existing graph library** in dependencies

## Candidate Libraries

### 1. @xyflow/react (React Flow) — **RECOMMENDED**

| Criterion | Assessment |
|---|---|
| **Version** | 11.5.5 |
| **Bundle size** | ~150KB gzipped |
| **React integration** | First-class: `useNodesState`, `useEdgesState` hooks, custom React node components |
| **TypeScript** | Natively written in TypeScript, excellent types |
| **Rendering** | Canvas-based (good WKWebView support) |
| **Interactivity** | Pan, zoom, click handlers built in; MiniMap, Controls, Background components |
| **Force layout** | Not built-in. Use `d3-force` (~20KB) to compute positions, feed to React Flow |
| **Maintenance** | Very active (xyflow org), 651 Context7 snippets, high reputation |
| **Custom nodes** | React components as nodes (perfect for file icons, titles, type badges) |
| **Read-only mode** | `nodesDraggable={false}`, `nodesConnectable={false}` or `panOnDrag` mode |
| **Total weight** | ~170KB gzipped (xyflow + d3-force) |

### 2. Cytoscape.js + react-cytoscapejs

| Criterion | Assessment |
|---|---|
| **Version** | 3.x (mature) |
| **Bundle size** | ~350KB gzipped |
| **React integration** | Via third-party `react-cytoscapejs` wrapper (Plotly), imperative API underneath |
| **TypeScript** | Types available via `@types/cytoscape` |
| **Rendering** | Canvas-based (good WKWebView) |
| **Interactivity** | Pan, zoom, tap events, extensive extension ecosystem |
| **Force layout** | Built-in `cose` and `cola` layouts |
| **Maintenance** | Stable but slower development, 253 Context7 snippets |
| **Custom nodes** | HTML/SVG overlay or canvas rendering (less React-idiomatic) |

### 3. vis-network

| Criterion | Assessment |
|---|---|
| **Version** | 7.x |
| **Bundle size** | ~400KB+ gzipped |
| **React integration** | Third-party wrappers only, imperative API |
| **Force layout** | Built-in physics engine |
| **Maintenance** | Moderate, 1093 Context7 snippets |
| **Verdict** | Too heavy, less React-idiomatic |

### 4. Reagraph (WebGL-based)

| Criterion | Assessment |
|---|---|
| **Bundle size** | Very small |
| **Rendering** | WebGL (⚠️ potential WKWebView issues) |
| **Verdict** | WebGL in WKWebView is risky; not recommended for Tauri |

## Recommendation: @xyflow/react + d3-force

**Why:**
1. **React-native feel**: Custom node components can render file icons, note titles, type badges using existing Tolaria components and Phosphor icons
2. **Built-in UX**: MiniMap, Controls (zoom buttons), Background grid come as drop-in components
3. **WKWebView-safe**: Canvas rendering is well-supported in WKWebView
4. **TypeScript-native**: Clean types, hooks-based API matching Tolaria's patterns
5. **Bundle size**: ~170KB total (xyflow + d3-force) is reasonable
6. **Active**: Most actively maintained React graph library, 651 code snippets

**How it works:**
- Use `d3-force` to run force-simulation on the vault file graph (files = nodes, wikilinks/relates-to = edges)
- Pass computed {x, y} positions to React Flow nodes
- Render custom React node components showing file title, type icon, etc.
- Click handler navigates to the file using existing Tolaria routing
- Wrap in a route component, add side-menu entry

## Libraries to Install

```bash
pnpm add @xyflow/react d3-force
pnpm add -D @types/d3-force
```