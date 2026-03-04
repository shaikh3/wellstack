# IEQ Sensor Buyer's Guide for Senior Living
## Choose the Right Indoor Environmental Quality Monitoring System

---

# 📊 Part 1: Sensor Comparison Matrix

| Sensor | Price | Dimensions | Connectivity | Power | Sensors | WELL Compatible | API Access | Installation | Best For |
|--------|-------|------------|--------------|-------|---------|-----------------|------------|--------------|----------|
| **Awair Omni** | $249/unit | 6.5"×3"×2" | WiFi, Ethernet | Plug-in | PM2.5, CO2, VOCs, Temp, Humidity, Light | ✅ Yes | ✅ REST API | Easy, 5 min | Mid-size facilities |
| **Kaiterra Sensedge** | $399/unit | 5"×5"×1.5" | WiFi, Ethernet, LoRa | Plug-in/PoE | PM2.5, CO2, VOCs, Temp, Humidity, Light, Noise | ✅ Yes | ✅ REST, Webhook | Easy, 5 min | Enterprise/WELL projects |
| **Airthings for Business** | $299/unit | 5"×5"×1" | WiFi, Cellular | Battery (2yr) | Radon, CO2, VOCs, Temp, Humidity, Pressure, Light | ✅ Yes | ✅ REST API | Very Easy | Radon-heavy regions |
| **uHoo Business** | $329/unit | 3.5"×3.5"×6" | WiFi | Plug-in | PM2.5, CO2, VOCs, NO2, O3, Temp, Humidity, Light, Sound | ✅ Yes | ✅ REST API | Easy | Advanced air quality |
| **Eve Room** | $99/unit | 2"×2"×2" | Thread/HomeKit | USB/Battery | VOCs, Temp, Humidity, Light | ⚠️ Limited | ❌ No API | Very Easy | Small pilot projects |
| **IQAir AirVisual Pro** | $269/unit | 6"×3"×3" | WiFi | Plug-in | PM2.5, CO2, Temp, Humidity | ⚠️ Limited | ⚠️ Limited API | Easy | Outdoor + indoor combo |
| **PurpleAir PA-II** | $279/unit | 3"×3"×1" | WiFi | USB | PM1, PM2.5, PM10, Temp | ❌ No | ⚠️ Public API | Easy | Outdoor monitoring |
| **Aranet4 Home** | $249/unit | 2.5"×2.5"×1" | Bluetooth | Battery (4yr) | CO2, Temp, Humidity, Pressure | ❌ No | ❌ No API | Very Easy | Portable spot checks |
| **Temboo Resilience** | $199/unit + sub | 4"×4"×2" | WiFi, Cellular | Plug-in/Battery | CO2, Temp, Humidity, Flood, Leak | ✅ Yes | ✅ REST API | Easy | Multi-hazard monitoring |

---

## 💰 Detailed Pricing Breakdown

### Hardware Costs (One-Time)

| Sensor | Unit Price | 50-Room Facility | 100-Room Facility | 200-Room Facility |
|--------|------------|------------------|-------------------|-------------------|
| Awair Omni | $249 | $12,450 | $24,900 | $49,800 |
| Kaiterra Sensedge | $399 | $19,950 | $39,900 | $79,800 |
| Airthings Business | $299 | $14,950 | $29,900 | $59,800 |
| uHoo Business | $329 | $16,450 | $32,900 | $65,800 |

### Subscription Costs (Annual)

| Sensor | Per-Unit/Year | 50-Room | 100-Room | 200-Room |
|--------|---------------|---------|----------|----------|
| Awair Omni | $36 | $1,800 | $3,600 | $7,200 |
| Kaiterra Sensedge | $60 | $3,000 | $6,000 | $12,000 |
| Airthings Business | $48 | $2,400 | $4,800 | $9,600 |
| uHoo Business | $72 | $3,600 | $7,200 | $14,400 |

---

## 🎯 Sensor Deep Dives

### 🏆 Best Overall: Kaiterra Sensedge

**Pros:**
- WELL v2 certified (official partner)
- Most comprehensive sensor array
- Enterprise-grade dashboard
- LoRa option for large campuses

**Cons:**
- Higher price point
- Subscription required for full features

**Best For:** Facilities pursuing WELL certification, multi-building campuses

---

### 💰 Best Value: Awair Omni

**Pros:**
- Good balance of features and price
- Simple setup
- Solid API
- 5-year sensor life

**Cons:**
- No noise monitoring
- Less enterprise reporting

**Best For:** Small to mid-size facilities, first-time IEQ adopters

---

### 🏠 Best for Radon: Airthings for Business

**Pros:**
- Only commercial sensor with radon detection
- Long battery life
- Cellular backup option
- Excellent for basements/lower levels

**Cons:**
- No PM2.5 detection
- Higher per-unit cost

**Best For:** Facilities in radon-prone regions, buildings with basement levels

---

### 🔬 Best for Research: uHoo Business

**Pros:**
- Most sensor types (9 total)
- Includes NO2 and Ozone
- Virus Index (COVID-era feature)
- Advanced analytics

**Cons:**
- Most expensive option
- Complex dashboard

**Best For:** Research partnerships, facilities with specific air quality concerns

---

# 🧮 Part 2: ROI Calculator

## Input Your Facility Data

```
┌─────────────────────────────────────────────────────────────┐
│                    ROI CALCULATOR INPUTS                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Facility Size: [____] number of rooms/units               │
│  Average Occupancy: [____] % (typically 85-95%)            │
│  Current Fall Rate: [____] per 100 resident-years          │
│  Average Fall Cost: $13,000 (industry standard)            │
│  Monthly HVAC Cost: $[____] per room                       │
│  Annual Staff Turnover: [____] %                           │
│  Cost to Replace Staff: $[____] (typically $3,000-5,000)   │
│  Target Certification: [WELL Core / WELL Silver / None]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## ROI Formula

### Savings Calculation

```
FALL PREVENTION SAVINGS:
  Current Falls per Year = (Rooms × Occupancy) × (Fall Rate / 100)
  Prevented Falls = Current Falls × 20% (conservative IEQ impact)
  Annual Savings = Prevented Falls × $13,000

HVAC EFFICIENCY SAVINGS:
  Annual HVAC Cost = Monthly HVAC × 12 × Rooms
  Efficiency Gain = 15% (typical with IEQ optimization)
  Annual Savings = Annual HVAC Cost × 15%

STAFF RETENTION SAVINGS:
  Annual Turnover = Staff Count × Turnover %
  Retention Improvement = 10% (reduced stress from alerts)
  Staff Saved = Annual Turnover × 10%
  Annual Savings = Staff Saved × Replacement Cost

WELL CERTIFICATION VALUE:
  Certification Consultant Cost = $50,000 (avoided with IEQ auto-reporting)
  Rent Premium = 7% × Average Monthly Rent × Rooms × 12
```

## Example Calculation: 100-Unit Facility

**Inputs:**
- 100 rooms, 90% occupancy = 90 residents
- Current fall rate: 2.5 per 100 resident-years = 2.25 falls/year
- HVAC: $150/room/month = $180,000/year
- Staff: 50 employees, 40% turnover = 20 replacements/year
- Average rent: $5,000/month

**Calculations:**

| Category | Formula | Annual Savings |
|----------|---------|----------------|
| **Fall Prevention** | 2.25 falls × 20% × $13,000 | **$5,850** |
| **HVAC Efficiency** | $180,000 × 15% | **$27,000** |
| **Staff Retention** | 20 × 10% × $4,000 | **$8,000** |
| **WELL Consultant** | Avoided fees | **$50,000** |
| **Rent Premium** | 7% × $5,000 × 100 × 12 | **$420,000** |
| **TOTAL SAVINGS** | | **$510,850** |

**IEQ System Investment (Kaiterra Sensedge):**
- Hardware: $39,900 (one-time)
- Annual subscription: $6,000
- Installation: $5,000
- **Year 1 Total: $50,900**

**ROI:**
- Year 1: 902% return ($510,850 / $50,900)
- Year 2+: 8,414% return ($510,850 / $6,000 subscription)

---

## 📈 ROI by Facility Size

| Facility Size | Year 1 Investment | Year 1 Savings | Year 1 ROI | Break-even |
|---------------|-------------------|----------------|------------|------------|
| 50 units | $28,950 | $255,425 | 882% | 1.4 months |
| 100 units | $50,900 | $510,850 | 902% | 1.3 months |
| 200 units | $91,800 | $1,021,700 | 1,013% | 1.1 months |

---

# 🌳 Part 3: Decision Tree

```
START: What is your primary goal?
│
├─► WELL Certification
│   │
│   ├─► New construction or major renovation?
│   │   ├─► Yes → Kaiterra Sensedge (WELL official partner)
│   │   └─► No (existing building) → Continue below
│   │
│   └─► Budget over $30K?
│       ├─► Yes → Kaiterra Sensedge
│       └─► No → Awair Omni (WELL compatible, lower cost)
│
├─► Fall Prevention Focus
│   │
│   ├─► Need circadian lighting integration?
│   │   ├─► Yes → Kaiterra Sensedge (light sensor + API)
│   │   └─► No → Awair Omni
│   │
│   └─► Have existing nurse call system?
│       ├─► Yes → Any sensor + API integration
│       └─► No → Kaiterra or Awair (better standalone dashboards)
│
├─► HVAC Optimization
│   │
│   ├─► Multi-building campus?
│   │   ├─► Yes → Kaiterra Sensedge with LoRa
│   │   └─► No → Awair Omni or uHoo
│   │
│   └─► Need outdoor air monitoring too?
│       ├─► Yes → IQAir AirVisual (indoor + outdoor)
│       └─► No → Awair Omni
│
├─► Radon Concerns (basements, certain regions)
│   │
│   └─► Airthings for Business (only radon-capable option)
│
├─► Budget Under $10K
│   │
│   ├─► Start with common areas only
│   │   └─► Eve Room (budget) or Awair Omni (better value)
│   │
│   └─► Plan to expand later?
│       ├─► Yes → Awair Omni (scales well)
│       └─► No → Eve Room (cheapest viable option)
│
└─► Research/Academic Partnership
    │
    └─► uHoo Business (most data points, exportable)
```

---

## Quick Pick Guide

| If You... | Choose | Budget |
|-----------|--------|--------|
| Need WELL certification | Kaiterra Sensedge | $40K+ |
| Want best value | Awair Omni | $25K |
| Have radon concerns | Airthings Business | $30K |
| Need most sensors | uHoo Business | $35K |
| Have very tight budget | Eve Room (pilot) | $10K |
| Run multi-building campus | Kaiterra + LoRa | $50K+ |

---

# ✅ Part 4: Installation Checklist

## Pre-Installation

- [ ] **Survey Facility**
  - [ ] Count total rooms/units
  - [ ] Identify common areas (dining, activity, lobby)
  - [ ] Map HVAC zones
  - [ ] Note WiFi coverage (test signal strength)
  - [ ] Identify power outlet locations

- [ ] **Determine Sensor Placement**
  - [ ] 1 sensor per 1,000 sq ft minimum
  - [ ] 1 sensor per resident room (ideal)
  - [ ] Additional sensors in high-risk areas
  - [ ] Height: 3-6 feet from floor (breathing zone)
  - [ ] Away from doors, windows, vents, direct sunlight

## Room-by-Room Placement Guide

### Resident Rooms
| Location | Priority | Placement Notes |
|----------|----------|-----------------|
| Bedroom | HIGH | Wall opposite bed, away from windows |
| Bathroom | MEDIUM | Outside door (humidity spike detection) |
| Living area | HIGH | Central location, seated height |

### Common Areas
| Location | Priority | Sensor Count (per 1,000 sq ft) |
|----------|----------|-------------------------------|
| Dining room | HIGH | 2 (large space, occupancy varies) |
| Activity room | MEDIUM | 1 |
| Lobby/entrance | LOW | 1 (outdoor air infiltration) |
| Nurse station | HIGH | 1 (staff work environment) |
| Corridors | LOW | 1 per 100 ft |

### Special Areas
| Location | Specific Concerns | Recommended Sensor |
|----------|------------------|-------------------|
| Memory care wing | Sound monitoring | Kaiterra (has noise sensor) |
| Kitchen | VOCs from cooking | uHoo (VOC-specific) |
| Laundry | Humidity, heat | Any with temp/humidity |
| Basement | Radon | Airthings only |

## Installation Day Checklist

### Per Sensor
- [ ] Unbox and inspect
- [ ] Record serial number and location
- [ ] Connect to power
- [ ] Connect to WiFi (or set up LoRa hub)
- [ ] Verify data in dashboard
- [ ] Calibrate if required (usually automatic)
- [ ] Photograph installation location
- [ ] Label with room number

### System-Wide
- [ ] Verify all sensors reporting
- [ ] Set alert thresholds
- [ ] Configure notification recipients
- [ ] Test alert delivery
- [ ] Train staff on dashboard access
- [ ] Document any issues
- [ ] Schedule first maintenance check

---

# ⚠️ Red Flags: Avoid These Pitfalls

## Common Mistakes

1. **Installing Too Few Sensors**
   - ❌ 1 sensor for entire facility
   - ✅ 1 per 1,000 sq ft minimum, 1 per room ideal

2. **Wrong Placement**
   - ❌ Direct sunlight (false high temps)
   - ❌ Near HVAC vents (unrepresentative readings)
   - ❌ Behind furniture (blocked airflow)
   - ✅ 3-6 feet height, central location, breathing zone

3. **Ignoring Maintenance**
   - ❌ "Set it and forget it"
   - ✅ Quarterly calibration checks, annual sensor replacement

4. **Choosing on Price Alone**
   - ❌ Cheapest consumer sensor
   - ✅ Commercial-grade with API for integration

5. **No Integration Plan**
   - ❌ Standalone dashboard only
   - ✅ API access for nurse call, EHR, facility management systems

## Questions to Ask Vendors

### Technical
1. "What's the sensor drift rate? How often should we calibrate?"
2. "What happens if WiFi goes down? Is data buffered?"
3. "Can we export raw data for our own analysis?"
4. "What's the API rate limit?"
5. "Do you support single sign-on (SSO)?"

### Business
1. "What's included in the subscription vs. one-time cost?"
2. "What happens if we stop subscribing? Do sensors stop working?"
3. "What's your warranty and replacement policy?"
4. "Can you provide references from senior living facilities?"
5. "What's your roadmap for the next 2 years?"

### Implementation
1. "How long does installation typically take?"
2. "Do you provide training for our staff?"
3. "What's your support response time?"
4. "Do you offer professional installation or just DIY?"
5. "How do we handle moves, adds, changes?"

---

*Guide Version: March 2026 | Prices subject to change*
