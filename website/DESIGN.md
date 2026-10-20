# KORDRA public website — Design system

## Visual authority

The approved source is the original KORDRA banner and the imported desktop/mobile prototype references in `design/references/`. Preserve the banner artwork bit-for-bit; its central wordmark, orbital network geometry, near-black grid and open space define the page. The prototype is an implementation reference, not permission to redraw the brand.

**World:** Orbital Control / Engineering Editorial.

**Visitor modes:** Home and Features use Persuade; Documentation, Blog / Updates and Releases use Read.

## Tokens

| Token | Value | Use |
|---|---|---|
| Background | `#0b0d0f` | Main page ground |
| Raised surface | `#101317` | Header and diagram surfaces |
| Primary text | `#f3f2ed` | Headlines and body text |
| Secondary text | `#b3bbc1` | Supporting copy |
| Thin border | `#33393e` | Section separators and diagram outlines |
| Soft line | `#23282c` | Subtle grid and secondary rules |

Typography uses self-hosted IBM Plex Sans for display and body text, with IBM Plex Mono for restrained metadata. The WOFF2 files and their SIL Open Font License notices are stored in `theme/kordra/assets/fonts/`. Use a consistent spacing scale, comfortable reading measure, visible focus ring and accessible contrast. Do not render small copy below a legible size to mimic mockup metadata.

## Composition

1. Compact navigation with KORDRA identity left, Home / Features / Documentation / Updates navigation, and GitHub action right. On mobile, use the native WordPress Navigation block's accessible overlay menu.
2. Full-width original banner immediately below the header. Preserve intrinsic proportions; use a carefully chosen responsive crop that keeps the center wordmark safe on mobile.
3. Editorial statement **CONTROL THE HANDOFF.** and **One Control Plane. Any Infrastructure.** with concise, truthful support copy.
4. Release path **ARTIFACT → APPROVE → DEPLOY → VERIFY → RECOVER**, connected horizontally on desktop and vertically on mobile. Label it product direction, not shipped capability.
5. Custom CSS/SVG orbital topology diagram, visibly labeled conceptual and not live telemetry.
6. **BUILDING IN THE OPEN. / NO PRETEND FINISH LINE.** with a real GitHub repository/roadmap link and Foundation / In Development status.
7. Minimal footer with useful navigation and project identity.

Additional Features, Documentation, Blog and Releases templates inherit the palette and typography. Editorial pages use Read mode and clear long-form hierarchy, not landing-page density.

## Responsive and interaction rules

- Inspect 1440px desktop, 768px tablet and 390px mobile.
- Prevent horizontal overflow, clipping and unreadable headings.
- Keep the banner's center brand mark visible on mobile.
- Ensure diagram labels and release steps remain legible at every width.
- Use semantic landmarks, a skip link, native keyboard-accessible navigation, visible focus and meaningful image alternatives.
- Respect `prefers-reduced-motion`; avoid decorative animation unless the approved design requires it.
- External links use safe target behavior. All navigation and CTAs must work; do not show fake downloads.

## Explicit exclusions

No generic SaaS hero, gradient text, feature-card grid, fake dashboard, invented metrics, stock data-center photo, neon effects, excessive glass, testimonial block or long repetitive marketing copy. The approved prototype and this document are the design authority; refine implementation details without changing the approved direction.
