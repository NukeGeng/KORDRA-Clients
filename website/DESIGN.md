# KORDRA public website — Design system

## Visual authority

The owner-supplied `theme/kordra/assets/images/logo-no-content.png` and `logo-with-kordra-text.png` are the authoritative KORDRA marks. Use the icon-only mark in the header and the supplied lockup in the homepage hero. Preserve the original banner artwork bit-for-bit as the orbital background; its embedded legacy wordmark is masked by the hero treatment. The imported desktop/mobile prototype references in `design/references/` guide composition, not the logo artwork.

**World:** Orbital Control / Engineering Editorial.

**Visitor modes:** Home and Features use Persuade; Documentation, Blog / Updates and Releases use Read.

## Tokens

| Token | Value | Use |
|---|---|---|
| Background | `#000000` | Main page ground, matched to the supplied banner's dominant black |
| Raised surface | `#101317` | Header and diagram surfaces |
| Primary text | `#f3f2ed` | Headlines and body text |
| Secondary text | `#b3bbc1` | Supporting copy |
| Thin border | `#33393e` | Section separators and diagram outlines |
| Soft line | `#23282c` | Subtle grid and secondary rules |

Typography uses self-hosted IBM Plex Sans for display and body text, with IBM Plex Mono for restrained metadata. The WOFF2 files and their SIL Open Font License notices are stored in `theme/kordra/assets/fonts/`. Use a consistent spacing scale, comfortable reading measure, visible focus ring and accessible contrast. Do not render small copy below a legible size to mimic mockup metadata.

## Composition

1. Navigation with the supplied KORDRA icon and wordmark left, Home / Features / Documentation / Updates navigation, and a GitHub action with the Octocat icon right. Preserve the desktop navbar. On mobile, retain the native WordPress Navigation block and present its overlay as the approved Editorial Navigation + Orbital Motion concept: logo and close control at the top, `01 / NAVIGATION`, large left-aligned links with right-aligned numbers and thin dividers, a restrained orbital SVG, and the development status/tagline at the bottom.
2. Full-width original orbital banner starts flush beneath the header, with no WordPress block-gap above it. Keep the header's navbar divider, center the supplied KORDRA lockup over the artwork's legacy embedded wordmark, and preserve the source image unchanged. Keep the `FOUNDATION · IN DEVELOPMENT` / `PRODUCT DIRECTION` metadata row beneath the artwork at about 50px; the hero ends with one low-contrast bottom rule (`rgba(255, 255, 255, 0.14)`). The artwork and status row have no separate divider. Keep the replacement lockup visible on mobile.
3. Editorial statement **CONTROL THE HANDOFF.** and **One Control Plane. Any Infrastructure.** with concise, truthful support copy.
4. Release path **ARTIFACT → APPROVE → DEPLOY → VERIFY → RECOVER**, connected horizontally on desktop and vertically on mobile. Label it product direction, not shipped capability.
5. Custom CSS/SVG orbital topology diagram, visibly labeled conceptual and not live telemetry.
6. **BUILDING IN THE OPEN. / NO PRETEND FINISH LINE.** with a real GitHub repository/roadmap link and Foundation / In Development status.
7. A spacious footer that closes the page with the supplied KORDRA mark, product tagline and truthful project summary; grouped links to the site's main pages and public GitHub resources; a clear Foundation / In Development status note; and a compact project-identity row. Keep the layout editorial and responsive, with readable body copy, visible focus and safe external links.

Additional Features, Documentation, Blog and Releases templates inherit the palette and typography. Editorial pages use Read mode and clear long-form hierarchy, not landing-page density.

## Responsive and interaction rules

- Inspect 1440px desktop, 768px tablet, the 760px navigation collapse and 390px mobile.
- At widths up to 760px, collapse the primary links into the native responsive menu before they wrap. Keep the trigger beside the KORDRA wordmark and anchor the GitHub action at the opposite end of the header.
- Prevent horizontal overflow, clipping and unreadable headings.
- Keep the existing primary navbar sticky at the top while the page scrolls. Preserve its current desktop links, responsive menu, GitHub action and routes; do not add a second section-navigation bar.
- When the status section stacks below the heading, keep its heading-to-copy gap compact at 1rem so the GitHub status reads as part of the same section.
- Keep the banner's center brand mark visible on mobile.
- Ensure diagram labels and release steps remain legible at every width.
- Use semantic landmarks, a skip link, native keyboard-accessible navigation, visible focus and meaningful image alternatives. On mobile, style the native WordPress menu overlay with the KORDRA ink/paper palette, 44px minimum controls, safe-area spacing and an independently scrollable layout. Keep links usable on short viewports; shrink or hide the orbital decoration first. Keep ARIA expanded/control state synchronized, trap and restore keyboard focus, close with Escape, and preserve WordPress background scroll locking.
- Use one reversible GSAP opening/closing timeline on the mobile overlay. Reveal the background in 350 ms, then logo/close, navigation label, links with 70 ms stagger, dividers left-to-right, and the low-contrast orbital SVG with its status/tagline footer. Rotate the orbit slowly (20–30 seconds per turn), pausing it while hidden. Prime entrance states only after the mobile overlay opens and clear temporary inline styles when it closes so desktop links stay visible. Disable motion for `prefers-reduced-motion` and clean listeners/timelines when reinitialized.
- Keep ambient CSS motion restrained: slow banner drift, a short lockup entrance and small hover feedback. Use the existing GSAP core for homepage scroll reveals as well as the mobile menu. Reveal each explicit headline row and major content block in reading order with a short fade-up; on the five-step release path, pop each marker first, then reveal its label and copy. Complete each step in about 260 ms and start the next after 280 ms, left-to-right on desktop and top-to-bottom on mobile. During an active reveal only, pace vertical wheel/trackpad input to 72% of the requested delta, capped at 180px per event; leave idle scrolling, touch, keyboard, horizontal input, browser zoom, an open mobile menu and reduced-motion mode native. Reconcile actual viewport geometry on scroll so missed observer entries still reveal visible content; cancel offscreen work and accelerate the remaining visible sequence. Finish the Foundation paragraph before revealing its repository action. Scrub the topology's radial connections and satellites together, keep their labels attached and readable, and continue the subtle dotted-ring/concentric-ring response; do not run a constant orbit loop. Completed targets remain visible while any part is in the viewport and replay only after a full exit. Keep topology motion clearly conceptual.
- Keep the original content visible without JavaScript or when the scroll-reveal enhancement is unsupported. Keyboard focus immediately exposes its target. Respect `prefers-reduced-motion` by disabling motion and smooth scrolling.
- External links use safe target behavior. All navigation and CTAs must work; do not show fake downloads.

## Explicit exclusions

No generic SaaS hero, gradient text, feature-card grid, fake dashboard, invented metrics, stock data-center photo, neon effects, excessive glass, testimonial block or long repetitive marketing copy. The approved prototype and this document are the design authority; refine implementation details without changing the approved direction.
