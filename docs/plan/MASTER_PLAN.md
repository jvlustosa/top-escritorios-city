# Master Plan: Escritório City — Lovable & Competitive for Digital Legal Offices in Brazil

> **Goal**: Simplified onboarding with maximum a-ha moment, want triggers while navigating, lovable for high-performance digital legal offices.

---

## Phase 1: Onboarding & A-Ha Moment (Week 1-2)

The a-ha moment = "I see MY building in the city."

- [x] **1.1 One-click registration with OAB validation** ✅
  - Reduced form to: Name + OAB Number + Email
  - Auto-extracts state from OAB (e.g., 123456/SP → SP), auto-fills city from state capital
  - Inline state detection hint shown below OAB field
- [x] **1.2 Instant building preview during registration** ✅
  - CSS-based 2D building preview (spire, windows, base) shown alongside form
  - Office name updates live as user types
  - Caption: "Este será o seu prédio. Verifique para crescer."
- [x] **1.3 Post-registration redirect with welcome toast** ✅
  - Redirects to `/?new=SLUG` after successful registration
  - Welcome toast auto-dismisses after 5s, URL cleaned via replaceState
  - Error display added to form for API failures
- [x] **1.4 Guided first-visit tour** ✅
  - 3-step tooltip tour with step counter, progress bar, arrows
  - localStorage flag `tour_completed` — shows once per browser
  - Dismiss via Escape, click outside, or "Pular" link
- [x] **1.5 Social proof counter on landing** ✅
  - Animated count-up (0 → N) with cubic ease-out over 1.5s
  - Fade-in entrance, tabular-nums for layout stability
  - Shows: "X escritórios na cidade · Y verificados"

---

## Phase 2: Want Triggers While Navigating (Week 2-3)

Create desire to upgrade at every interaction point.

- [ ] **2.1 Building comparison on hover**
  - Hovering a verified (white/tall) building shows: "Tier 4 · Verificado · #3 no ranking"
  - Hovering your own (gray/small): "Tier 1 · Não verificado · Verifique para subir"
- [ ] **2.2 "Ghost building" for unregistered visitors**
  - Show a translucent placeholder: "Seu escritório poderia estar aqui"
  - Click → registration flow
- [ ] **2.3 Ranking position teaser**
  - Sidebar shows: "Se verificado, seu escritório estaria na posição #X"
  - Based on estimated revenue bracket
- [ ] **2.4 Competitor proximity trigger**
  - When viewing a building in the same city: "3 escritórios da sua cidade já são verificados"
  - Creates urgency through local competition
- [ ] **2.5 Upgrade CTA in office detail page**
  - Side-by-side visual: current tier vs. next tier building
  - "Seu prédio com Tier 3" → show taller, whiter building preview
- [ ] **2.6 Weekly ranking email digest**
  - "Seu escritório caiu 2 posições esta semana" / "3 novos escritórios na sua cidade"
  - CTA: "Verifique para proteger sua posição"

---

## Phase 3: Lovable Core Features (Week 3-5)

Make verified offices feel premium and proud.

- [ ] **3.1 Shareable office card**
  - OG image auto-generated: 3D building render + rank + city
  - URL: top.escritorio.ai/office/[slug] — shareable on LinkedIn/WhatsApp
  - Meta tags for rich preview
- [ ] **3.2 Verified badge & seal**
  - Downloadable "Top Escritório Verificado 2026" badge for website/email signature
  - Dynamic: updates with tier and ranking position
- [ ] **3.3 Office analytics dashboard**
  - Profile views, ranking history chart, city comparison
  - "Seu escritório foi visto 47 vezes esta semana"
- [ ] **3.4 Custom building appearance**
  - Verified offices can customize: antenna color, window pattern, small logo on facade
  - Creates ownership and emotional attachment
- [ ] **3.5 City leaderboard by city/state**
  - Filter: "Top escritórios em São Paulo" / "Top em Direito Tributário"
  - Specialty tags on buildings (future: area de atuação)
- [ ] **3.6 Chat Jurídico integration visibility**
  - Antenna on building glows and pulses
  - Badge: "Atendimento digital ativo" — signals modernity to visitors

---

## Phase 4: Competitive Moat (Week 5-8)

Features that make switching away painful.

- [ ] **4.1 Client review system**
  - Verified clients can leave reviews (authenticated via email)
  - Stars appear as window lights on the building
- [ ] **4.2 Lead capture for verified offices**
  - Visitors can "Solicitar contato" from office detail page
  - Leads delivered via email + dashboard notification
- [ ] **4.3 "Escritório do Mês" spotlight**
  - Monthly automated selection based on ranking + engagement
  - Featured building gets golden glow + homepage banner
- [ ] **4.4 Integration marketplace**
  - Chat Jurídico, Asaas billing, Google Calendar booking
  - Each integration adds visual element to building
- [ ] **4.5 Multi-office firm support**
  - Firms with branches in multiple cities → buildings in each city
  - Unified dashboard across locations
- [ ] **4.6 API for embedding**
  - Embed "Top #3 em São Paulo" widget on firm's own website
  - Auto-updating badge/iframe

---

## Phase 5: Growth & Virality (Week 8+)

Organic acquisition loops.

- [ ] **5.1 "Indique um escritório" referral program**
  - Refer → both offices get temporary tier boost
  - Referral tracking in dashboard
- [ ] **5.2 City-level landing pages (SEO)**
  - top.escritorio.ai/cidade/sao-paulo → ranked offices in SP
  - SEO-optimized for "melhores escritórios advocacia [cidade]"
- [ ] **5.3 OAB section integration**
  - Partner with local OAB sections for institutional credibility
  - "Recomendado pela OAB-SP" badge potential
- [ ] **5.4 Annual awards ceremony**
  - "Top Escritório Awards 2026" — virtual event
  - Trophy building skin for winners
- [ ] **5.5 Embeddable city widget**
  - Other legal platforms can embed mini city view
  - Backlinks + brand awareness

---

## Onboarding Strategy (Decided 2026-03-21)

### Core Decisions
| Decision | Choice |
|---|---|
| **Core emotion** | Status envy between offices ("my building > yours") |
| **Social media** | Profile links only (Instagram/LinkedIn) — no social stats in ranking |
| **Logo** | Upload logo → shows as building billboard/outdoor sign |
| **Asaas model** | Freemium — tier-1 shack appears instantly, Asaas upgrades it |
| **Onboarding flow** | 2-step wizard with live building preview |
| **Logo visibility** | Tier-gated — only tier 2+ (paying) show logo on building |

### 2-Step Onboarding Wizard

**Step 1: "Crie seu escritório"** (left column: form, right column: live 2D building preview)
- Fields: Name, OAB Number, Email
- As user fills fields → building silhouette takes shape on right
- Office name appears on building as user types
- Submit → building appears in city as tier-1 shack
- Caption: "Este será o seu prédio. Verifique para crescer."

**Step 2: "Destaque seu prédio"** (post-registration, same split layout)
- Upload logo (stored, displayed on building only for tier 2+)
- Link Instagram URL
- Link LinkedIn URL
- Connect Asaas (upgrade tier, unlock logo billboard)
- Each card shows what it unlocks visually
- Can skip — nudge cards appear later in sidebar/profile

### Building Billboard (Logo on Building)
- Tier 2+ only: logo texture mapped as a small outdoor/billboard on building facade
- B&W aesthetic: logo rendered in grayscale to match brand
- Higher tiers → larger/more prominent billboard placement

---

## Current Progress Tracker

### Completed (from existing codebase)
- [x] 3D city visualization with day/night cycle
- [x] Building rendering by tier (1-5) with verified/unverified distinction
- [x] Basic registration form (name, city, state, OAB, email)
- [x] Asaas webhook integration (payment → verification)
- [x] Office detail page (/office/[slug])
- [x] Mobile responsive card grid
- [x] Admin panel (toggle verification)
- [x] Ranking system (verified by revenue, unverified by date)
- [x] Animated loading screen with skyline
- [x] Street lamps, stars, bloom post-processing

### In Progress
- [ ] Real Supabase integration on detail page (still uses mock data)

### Not Started
- [ ] Phases 2-5

---

## Success Metrics

| Metric | Target (3 months) |
|--------|-------------------|
| Registered offices | 500+ |
| Verified (paying) offices | 50+ (10% conversion) |
| Weekly active visitors | 2,000+ |
| Avg. time on site | > 2 min |
| Registration → Verification | < 48h |
| Office detail page shares | 100+/week |

---

## Key Principles

1. **A-ha em 30 segundos** — visitor sees the city, understands the game, wants to play
2. **Inveja produtiva** — every interaction shows what verified offices have that you don't
3. **Orgulho de participar** — verified offices feel proud, share their building, defend their rank
4. **Simplicidade brutal** — no feature takes more than 2 clicks to use
5. **Competição local** — ranking by city creates urgency in smaller markets

---

*Last updated: 2026-03-21 (Phase 1 completed)*
*Next review: Weekly or after each phase milestone*
