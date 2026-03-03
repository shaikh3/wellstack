# Sapphire Hub Migration Financial Model
## Excel Workbook Structure

**File:** `sapphire-hub-migration-financial-model.xlsx`  
**Tabs:** 5  
**Format:** Professional with clear headers, input cells highlighted (yellow)

---

## Tab 1: Assumptions

**Purpose:** All key input variables in one place for easy scenario testing

### Section A: Current State
| Input | Value | Notes |
|-------|-------|-------|
| Current Deployed Units | 3,300 | Sapphire's current footprint |
| SmartThings Cost/Unit/Month | $1.00 | Current revenue share |
| Annual Growth Rate | 700 | Units per year (configurable) |
| Average Property Size | 120 | Units per property |

### Section B: Hardware Costs (per unit)
| Component | Cost | Notes |
|-----------|------|-------|
| SmartThings v3 Hub | $70 | Current; supply limited |
| Aeotec B2B Hub | $60 | Estimated wholesale |
| Home Assistant - Raspberry Pi | $75 | Dev/testing only |
| Home Assistant - Industrial SBC | $100 | Production-grade |
| LG ThinQ Pro | $90 | Estimated |
| Hybrid - Aeotec + HA | $80 | Estimated bundle |

### Section C: Development Costs (one-time)
| Component | Cost | Notes |
|-----------|------|-------|
| Installer App (Aeotec path) | $150,000 | Moderate complexity |
| Installer App (HA path) | $250,000 | Higher complexity |
| Management Layer (Aeotec) | $100,000 | Lower complexity |
| Management Layer (HA) | $200,000 | Higher complexity |
| HA Productization | $150,000 | UI/UX, testing, docs |
| Hybrid Integration | $300,000 | Most complex |

### Section D: Migration Costs (per unit)
| Activity | Cost | Notes |
|----------|------|-------|
| Truck Roll | $15 | Installer visit |
| Device Re-pairing | $10 | Z-Wave/ZigBee re-enrollment |
| Testing & Validation | $5 | Post-migration verification |
| Customer Communication | $1 | Notifications, instructions |
| **Total Migration Cost/Unit** | **$31** | Applied to existing units |

### Section E: Ongoing Costs (annual)
| Cost Category | SmartThings | Aeotec | Home Assistant | Hybrid |
|---------------|-------------|--------|----------------|--------|
| Platform Revenue Share | $39,600 | $0 | $0 | $0 |
| Cloud Infrastructure | $12,000 | $15,000 | $18,000 | $18,000 |
| Support Staff (FTE portion) | $60,000 | $40,000 | $50,000 | $50,000 |
| **Total Annual** | **$111,600** | **$55,000** | **$68,000** | **$68,000** |

### Section F: Revenue Impact Assumptions
| Metric | Value | Notes |
|--------|-------|-------|
| Deals Blocked/Month (units) | 50 | Due to SmartThings limitations |
| Avg Deal Size (units) | 150 | Typical property size |
| Avg Revenue/Unit/Month | $15 | Sapphire's ARPU |
| Gross Margin | 70% | Industry standard |
| Customer Lifetime | 36 months | Average |

---

## Tab 2: TCO Comparison — 3 Year

**Purpose:** Total Cost of Ownership for each option over 3 years

### Columns:
- Year (1, 2, 3)
- Starting Units (calculated from growth rate)
- New Units Deployed (calculated)
- Cumulative Units

### Cost Categories (for each option):
1. **Hardware Costs** = New Units × Hardware Cost/Unit
2. **Development Costs** = One-time (mostly Year 1)
3. **Migration Costs** = Existing Units × $31 (for migration paths; Year 1)
4. **Ongoing Platform** = Cumulative Units × Monthly Cost × 12
5. **Support/Operations** = Annual cost (escalating 5% per year)

### Options Compared:
| Row | Description | Year 1 | Year 2 | Year 3 | 3-Year Total |
|-----|-------------|--------|--------|--------|--------------|
| 1 | SmartThings Status Quo | [calc] | [calc] | [calc] | [sum] |
| 2 | Aeotec B2B | [calc] | [calc] | [calc] | [sum] |
| 3 | Home Assistant | [calc] | [calc] | [calc] | [sum] |
| 4 | LG ThinQ Pro | [calc] | [calc] | [calc] | [sum] |
| 5 | Hybrid | [calc] | [calc] | [calc] | [sum] |

### Charts:
- **Stacked Bar Chart:** Cost components by option (3-year total)
- **Line Chart:** Cumulative cost over time for each option

### Key Formulas:
```
Starting Units (Year 1) = Assumptions!CurrentUnits
Starting Units (Year 2) = Year1 Ending Units
New Units = Assumptions!AnnualGrowth
Cumulative Units = Starting + New

Hardware = NewUnits × HardwareCost
Development = Assumptions!DevCost (if Year 1, else 0)
Migration = Assumptions!CurrentUnits × $31 (if migration path & Year 1, else 0)
Ongoing = CumulativeUnits × $1 × 12 (or $0 for non-ST)
Support = Assumptions!SupportCost × (1.05 ^ (Year-1))
```

---

## Tab 3: Break-Even Analysis

**Purpose:** At what unit count does each path break even vs. Status Quo?

### Section A: Monthly Cash Flow
| Month | SmartThings Cumulative | Aeotec Cumulative | HA Cumulative | Hybrid Cumulative |
|-------|----------------------|-------------------|---------------|-------------------|
| 1 | [calc] | [calc] | [calc] | [calc] |
| 2 | [calc] | [calc] | [calc] | [calc] |
| ... | ... | ... | ... | ... |
| 36 | [calc] | [calc] | [calc] | [calc] |

### Section B: Break-Even Points
| Comparison | Break-Even Month | Break-Even Units | Notes |
|------------|-----------------|------------------|-------|
| Aeotec vs SmartThings | [calc] | [calc] | Includes lost deals |
| Home Assistant vs SmartThings | [calc] | [calc] | Includes lost deals |
| Hybrid vs SmartThings | [calc] | [calc] | Includes lost deals |

### Section C: Sensitivity Table
**Break-Even Units at Different Growth Rates:**

| Growth Rate | Aeotec | Home Assistant | Hybrid |
|-------------|--------|----------------|--------|
| 300/year (Conservative) | [calc] | [calc] | Never |
| 700/year (Moderate) | [calc] | [calc] | [calc] |
| 1,000/year (Aggressive) | [calc] | [calc] | [calc] |
| 1,500/year (Very Aggressive) | [calc] | [calc] | [calc] |

### Charts:
- **Line Chart:** Cumulative cost curves showing crossover points
- **Highlight:** Break-even points marked with vertical lines

---

## Tab 4: Growth Scenario Modeling

**Purpose:** How does the optimal path change at different growth assumptions?

### Section A: Conservative Growth (300 units/year)
| Year | New Units | Cumulative | Best Path | TCO |
|------|-----------|------------|-----------|-----|
| 1 | 300 | 3,600 | [calc] | [calc] |
| 2 | 300 | 3,900 | [calc] | [calc] |
| 3 | 300 | 4,200 | [calc] | [calc] |

**Recommendation at this growth:** [auto-populated]

### Section B: Moderate Growth (700 units/year)
| Year | New Units | Cumulative | Best Path | TCO |
|------|-----------|------------|-----------|-----|
| 1 | 700 | 4,000 | [calc] | [calc] |
| 2 | 700 | 4,700 | [calc] | [calc] |
| 3 | 700 | 5,400 | [calc] | [calc] |

**Recommendation at this growth:** [auto-populated]

### Section C: Aggressive Growth (1,500 units/year)
| Year | New Units | Cumulative | Best Path | TCO |
|------|-----------|------------|-----------|-----|
| 1 | 1,500 | 4,800 | [calc] | [calc] |
| 2 | 1,500 | 6,300 | [calc] | [calc] |
| 3 | 1,500 | 7,800 | [calc] | [calc] |

**Recommendation at this growth:** [auto-populated]

### Section D: Optimal Path by Scale
| Scale | Optimal Path | Rationale |
|-------|-------------|-----------|
| < 4,000 units | [calc] | [auto] |
| 4,000-7,000 units | [calc] | [auto] |
| > 7,000 units | [calc] | [auto] |

### Charts:
- **Small Multiples:** TCO comparison at each growth rate
- **Decision Matrix:** Color-coded recommendation by growth rate and time horizon

---

## Tab 5: Revenue Impact

**Purpose:** Quantify the revenue cost of NOT migrating

### Section A: Current Pipeline Blockers
| Blocker Type | Units/Month | Annual Units | Revenue Impact |
|--------------|-------------|--------------|----------------|
| Wi-Fi Thermostat Required | 20 | 240 | [calc] |
| ZigBee Reliability Concerns | 15 | 180 | [calc] |
| Enterprise Fleet Management | 40 | 480 | [calc] |
| **Total Blocked** | **75** | **900** | **[calc]** |

### Section B: Revenue Calculation
**Per Blocked Unit:**
- Monthly Revenue: $15
- Lifetime (36 months): $540
- Gross Profit (70%): $378

**Annual Impact:**
- Units Blocked: 900
- Lifetime Revenue Lost: $486,000
- Gross Profit Lost: $340,200

**3-Year Cumulative:**
- Units Blocked: 2,700
- Lifetime Revenue Lost: $1,458,000
- Gross Profit Lost: $1,020,600

### Section C: Market Sizing
| Market Segment | Total Units | Addressable % | Sapphire TAM |
|----------------|-------------|---------------|--------------|
| Class A Apartments | 2,500,000 | 2% | 50,000 |
| Class B Apartments | 5,000,000 | 1% | 50,000 |
| Student Housing | 1,500,000 | 3% | 45,000 |
| Senior Living | 1,000,000 | 2% | 20,000 |
| **Total TAM** | | | **165,000** |

**Sapphire's Current Share:** 3,300 / 165,000 = 2%

### Section D: Revenue Opportunity by Path
| Path | Enables Protocols | Unlocks Segments | Additional TAM |
|------|-------------------|------------------|----------------|
| SmartThings | Z-Wave only | Basic MDU | Current only |
| Aeotec | Z-Wave + ZigBee | Standard MDU | +15% |
| Home Assistant | All protocols | All segments | +40% |
| Hybrid | All protocols | All segments | +40% |

### Charts:
- **Bar Chart:** Revenue lost by staying on SmartThings (3-year cumulative)
- **Pie Chart:** Market segment breakdown
- **Waterfall Chart:** Revenue opportunity unlocked by each migration path

---

## Formatting Guidelines

### Cell Formatting:
- **Input Cells:** Light yellow background (#FFFACD), black border
- **Calculated Cells:** White background, no border
- **Headers:** Dark blue background (#1E2761), white text, bold
- **Totals:** Bold, light blue background (#CADCFC)
- **Currency:** $#,##0 format
- **Percentages:** 0.0% format

### Validation:
- Growth rate: 0-5000 (whole numbers)
- Costs: > 0 (currency)
- Percentages: 0-100%

### Protection:
- Lock calculated cells (user can only edit yellow input cells)
- No password (Jon/Phil should be able to modify as needed)

### Print Layout:
- Landscape orientation for all tabs
- Headers repeat on each page
- Page numbers in footer
- "Sapphire Hub Migration Financial Model — CONFIDENTIAL" in footer

---

## Key Formulas Reference

### SmartThings Annual Cost:
```excel
=CumulativeUnits * $1 * 12
```

### Total Migration Cost:
```excel
=CurrentUnits * $31
```

### Break-Even Month (simplified):
```excel
=MATCH(TRUE, AeotecCumulative <= SmartThingsCumulative, 0)
```

### Lifetime Value of Blocked Unit:
```excel
=$15 * 36 months * 70% margin
```

### 3-Year TCO:
```excel
=Hardware + Development + Migration + Ongoing + Support
```

---

## Usage Instructions (for Jon/Phil)

1. **Start on Tab 1 (Assumptions):** Adjust the yellow cells to match your actual numbers
2. **Review Tab 2 (TCO):** See how costs compare across all options
3. **Check Tab 3 (Break-Even):** Understand when each path pays back
4. **Test Scenarios on Tab 4:** Change growth assumptions, see how recommendations shift
5. **Quantify Impact on Tab 5:** See the revenue cost of staying on SmartThings

**Questions about the model?** Contact Khayyam for walkthrough.
