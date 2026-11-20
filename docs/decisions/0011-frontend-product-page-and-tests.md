# 0011: Frontend as a product page, split by feature, with Vitest tests
- Date: 2026-11-20
- Status: Accepted
- Related: `frontend/src/components/`, `frontend/src/hooks/`, `frontend/vitest.config.ts`

**Context:** A UI review found the page was a bare form: no header, footer, FAQ, trust signals or link preview, emoji for icons, and one 554-line `App.tsx` with no frontend tests.

**Decision:** The page is now a product page (header, hero with the upload card, how it works, what it checks, companies, FAQ, footer). Code is split by feature (`layout`, `landing`, `upload`, `result`), with logic in hooks, design tokens in `index.css` and inline SVG icons. Vitest + Testing Library cover formatting, Urdu warnings, chart data, the consent gate and section order. We rejected a component library: it adds weight and fights the right-to-left Nastaliq layout.

**Consequences:** Easier to change and review; four new dev dependencies; a slightly larger bundle (86 KB gzipped).

**Revisit when:** The page needs routing or several screens.
