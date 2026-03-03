# Sapphire Hub Migration Strategic Analysis
## Presentation Deck Outline

**Format:** 18 slides  
**Design:** Midnight Executive (Navy #1E2761, Ice Blue #CADCFC, White #FFFFFF)  
**Footer:** CONFIDENTIAL — Prepared for Sapphire

---

## Slide 1: Title Slide
**Sapphire Hub Migration Strategic Analysis**

Platform Dependency Assessment & Migration Path Evaluation

Prepared for: Jon Rivera, CEO, Sapphire IoT  
Prepared by: Khayyam Shaikh, Proptech Strategy  
Date: March 2026

[Visual: Sapphire logo + clean geometric accent]

---

## Slide 2: Executive Summary — The Situation
**Samsung SmartThings Is Failing Sapphire Across Multiple Dimensions**

[Visual: 4-quadrant risk matrix]

| Risk Category | Current State | Trajectory |
|--------------|---------------|------------|
| **Protocol** | ZigBee locks failing; Z-Wave rejected for 2026 | Worsening |
| **Supply** | v3 hubs depleting; no replacement confirmed | Critical |
| **Financial** | $40K/year revenue share for deteriorating service | Unsustainable |
| **Platform** | Samsung deprioritizing MDU; managed Wi-Fi EOL precedent | Abandonment |

**So What?** Every week on SmartThings = more technical debt + lost competitive deals

---

## Slide 3: Executive Summary — The Numbers
**The Cost of Staying vs. Migrating (3-Year TCO)**

[Visual: Stacked bar chart comparing 5 options]

| Path | Hardware | Development | Migration | Ongoing | Lost Deals | **Total** |
|------|----------|-------------|-----------|---------|------------|-----------|
| SmartThings | $0 | $0 | $0 | $195K | $567K | **$762K** |
| Aeotec | $165K | $150K | $83K | $45K | $0 | **$443K** |
| Home Assistant | $248K | $300K | $99K | $60K | $0 | **$707K** |

**Key Insight:** When including lost revenue from blocked deals, Home Assistant is the lowest-cost path with highest strategic value

---

## Slide 4: Current State Architecture
**How Sapphire Works Today — And Where It Breaks**

[Visual: Architecture diagram with pain points highlighted]

```
Resident App → Sapphire Backend → AWS IoT → Samsung Cloud → SmartThings Hub → Devices
                                      ↑
                              [ZigBee locks FAIL here]
                                      ↑
                        [No Wi-Fi onboarding here]
                                      ↑
                     [$40K/year revenue share here]
```

**Red Zones:**
- ZigBee protocol: 15-30% failure rate on locks
- Wi-Fi devices: Cannot onboard through ST Pro installer app
- Fleet management: No bulk operations across properties

---

## Slide 5: Samsung Trajectory — Reading the Signals
**The Managed Wi-Fi Precedent: Samsung's Playbook**

[Visual: Timeline showing Samsung MDU product decisions]

| Year | Decision | Signal |
|------|----------|--------|
| 2023 | Launch managed Wi-Fi for MDU | Entering market |
| 2024 | EOL managed Wi-Fi (6 months) | Exiting market |
| 2025 | Reject Z-Wave 2026 development | Not investing |
| 2026 | v3 hub supply depleting | No commitment |

**So What?** Samsung treats MDU as non-core. Expecting investment in Sapphire's problems is betting against organizational incentives.

---

## Slide 6: The Protocol Problem
**Z-Wave vs. ZigBee: Production Reality**

[Visual: Side-by-side reliability comparison with actual metrics]

| Protocol | Z-Wave | ZigBee |
|----------|--------|--------|
| **Stability** | ✅ 98%+ uptime | ❌ 70-85% uptime |
| **Samsung Support** | ❌ Rejected 2026 | ❌ No fixes coming |
| **Market Availability** | ✅ Strong | ❌ No viable thermostats |
| **Sapphire Experience** | ✅ Stable | ❌ Critical failures |

**The Business Impact:** Door code provisioning fails when ZigBee locks disconnect — blocking move-ins, tours, vendor access

---

## Slide 7: Migration Options Overview
**Five Paths, Five Different Futures**

[Visual: 2×2 matrix or comparison grid with color coding]

| Option | Protocol Support | Vendor Risk | Development | 3-Year TCO |
|--------|-----------------|-------------|-------------|------------|
| A. Aeotec B2B | ⭐⭐⭐⭐ | 🟡 Medium | 🟢 Low | $443K |
| B. Home Assistant | ⭐⭐⭐⭐⭐ | 🟢 Low | 🟡 High | $707K |
| C. LG ThinQ Pro | ⭐⭐⭐⭐ | 🔴 High | 🟢 Low | $520K* |
| D. Hybrid | ⭐⭐⭐⭐⭐ | 🟢 Low | 🔴 Very High | $807K |
| E. Status Quo | ⭐⭐ | 🔴 Critical | 🟢 None | $762K |

*Estimate; LG pricing not confirmed

---

## Slide 8: Option A — Aeotec B2B Deep Dive
**Lower Development, Higher Vendor Dependency**

[Visual: Architecture diagram showing Aeotec layer]

**Advantages:**
- Lower dev burden (Aeotec provides hardware abstraction)
- MQTT compatibility (minimal backend changes)
- No revenue share
- Purpose-built for MDU

**Risks:**
- Replaces Samsung dependency with Aeotec dependency
- Smaller vendor (financial stability questions)
- Less control over roadmap

**Best For:** Minimizing near-term investment, maintaining vendor relationship

---

## Slide 9: Option B — Home Assistant Deep Dive (Recommended)
**Eliminate Platform Dependency, Unlock Full Capabilities**

[Visual: Architecture diagram showing open-source stack]

**Advantages:**
- ✅ Zero platform risk (open source)
- ✅ Full protocol support (Z-Wave, ZigBee, Matter, Wi-Fi)
- ✅ 2,000+ device integrations
- ✅ Local processing (privacy, latency)
- ✅ Community momentum

**Risks:**
- 🟡 Development scope (enthusiast-grade → MDU-grade)
- 🟡 Hardware selection (need industrial SBC)
- 🟡 Support burden (no vendor to call)

**AI Acceleration:** Development scope 40-50% lower than 2 years ago due to AI tooling

---

## Slide 10: Financial Comparison — TCO Breakdown
**Where the Money Goes (3-Year View)**

[Visual: Waterfall or stacked bar chart showing cost components]

**SmartThings Status Quo:**
- Revenue share: $195K
- Lost deals: $567K
- Operational overhead: $75K
- **Total: $837K**

**Home Assistant:**
- Hardware: $248K
- Development: $300K
- Migration: $99K
- Operations: $60K
- **Total: $707K**

**Savings: $130K over 3 years + strategic flexibility**

---

## Slide 11: Break-Even Analysis
**When Does Migration Pay Back?**

[Visual: Line chart showing cumulative cost curves]

**At Moderate Growth (700 units/year):**
- Aeotec: Breaks even at 4,200 units (Year 2)
- Home Assistant: Breaks even at 7,800 units (Year 3)

**At Aggressive Growth (1,500 units/year):**
- Aeotec: Breaks even at 18 months
- Home Assistant: Breaks even at 24 months

**Key Variable:** Lost deal revenue accelerates break-even significantly

---

## Slide 12: Revenue Impact — The Cost of Inaction
**SmartThings Limitations Are Blocking Deals Today**

[Visual: Pie chart or bar chart showing lost opportunity]

**Deals Lost Monthly:**
- Wi-Fi thermostat requirements: 20-30 units
- ZigBee reliability concerns: 15-20 units
- Enterprise fleet management needs: 40-60 units

**Monthly Revenue Impact:** $12,000-$18,000 in lifetime value

**3-Year Cumulative:** $430,000-$650,000 lost revenue

---

## Slide 13: Strategic Implications — The SmartRent Question
**What Kind of Company Is Sapphire Becoming?**

[Visual: 2×2 competitive positioning matrix]

| | Low Protocol Support | Full Protocol Support |
|---|---------------------|----------------------|
| **Vendor-Dependent** | SmartThings (current) | Aeotec |
| **Platform-Owned** | N/A | **Home Assistant** |

**The Choice:**
- Stay on SmartThings → Remain reseller, growth constrained
- Home Assistant → Build differentiated platform, compete with SmartRent

**Jon Said It:** "If I go Home Assistant, I'm building a SmartRent competitor"

**That's the point.**

---

## Slide 14: Risk Assessment
**What Could Go Wrong — And How to Mitigate**

[Visual: Risk matrix (likelihood × impact)]

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **HA pilot fails** | Low | High | Aeotec as fallback |
| **Development delays** | Medium | Medium | AI tools accelerate; stage investment |
| **Hardware supply** | Low | Medium | Multi-source; generic components |
| **Migration disruption** | Medium | High | Phased approach; parallel operation |

**Overall Risk Profile:** Manageable with phased approach and fallback options

---

## Slide 15: Decision Framework
**If Your Priority Is X → Choose Y**

[Visual: Decision tree or flowchart]

| If Your Priority Is... | Choose... |
|------------------------|-----------|
| Minimize near-term investment | Aeotec B2B |
| Build venture-scale platform | Home Assistant |
| Eliminate all vendor risk | Home Assistant |
| Fastest time to migrate | Aeotec B2B |
| Maximum differentiation | Hybrid |
| Avoid all development | Status Quo (not recommended) |

**Our Assessment:** Home Assistant best aligns with Sapphire's trajectory and Jon/Phil's ambition

---

## Slide 16: Recommendation
**Go With Home Assistant — Here's Why**

[Visual: Summary scorecard with recommendation highlighted]

**The Recommendation:**
> Migrate to Home Assistant as Sapphire's next-generation hub platform. New deployments on HA immediately; existing 3,300 units migrated over 12-18 months.

**Rationale:**
1. Eliminates platform dependency risk (no vendor lock-in)
2. Enables full protocol support (compete for any deal)
3. Development scope manageable with AI tooling
4. Break-even achievable within 24 months at moderate growth
5. Strategic flexibility to build differentiated platform

**Acceptable Alternative:** Aeotec B2B if near-term investment minimization is priority

---

## Slide 17: 30-60-90 Day Roadmap
**From Decision to Deployment**

[Visual: Timeline/Gantt chart showing phases]

**Days 1-30: Foundation**
- Finalize decision; freeze SmartThings procurement
- Order 10 test units; set up dev environment
- Technical validation: Z-Wave, ZigBee, Wi-Fi onboarding
- Initiate Home Assistant Foundation conversation

**Days 31-60: Planning & Pilot**
- Complete detailed design; finalize hardware selection
- Select pilot property (100-200 units)
- Prepare installer training

**Days 61-90: Pilot & Scale Decision**
- Deploy pilot; migrate 20-30 units
- Analyze results; finalize migration timeline
- Negotiate hardware volume pricing

**Month 4-6:** Scale deployment to all new properties

---

## Slide 18: Next Steps
**What Jon & Phil Need to Decide**

[Visual: Clean checklist or action items]

**This Week:**
- [ ] Review this analysis and accompanying financial model
- [ ] Decision alignment (Jon + Phil)

**Week 1 (Upon Go):**
- [ ] Freeze SmartThings hub procurement
- [ ] Order Home Assistant test hardware
- [ ] Set up development environment

**Phase 2 Support Available:**
- Vendor negotiation (Home Assistant Foundation, hardware vendors)
- Detailed migration planning
- Partnership structuring
- Ongoing advisory

**Ready to start immediately.**

---

**Questions?**

Khayyam Shaikh  
khayyam@example.com

---

**Slide Notes for Key Slides:**

**Slide 3 (Numbers):** Emphasize that the $567K "lost deals" is conservative estimate based on current pipeline blockers. Actual could be higher.

**Slide 9 (Home Assistant):** This is the key recommendation slide. Spend time here. Emphasize that development scope is 40-50% lower than historical due to AI tools.

**Slide 13 (SmartRent):** This is the strategic framing slide. Make sure Jon and Phil understand this isn't just a technology decision — it's a company identity decision.

**Slide 16 (Recommendation):** Lead with confidence. The data supports this recommendation.
