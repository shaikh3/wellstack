# P4 Build Brief — Community, Family Dashboard, Portfolio, RPM

Context for building the remaining P4 screens. Read this before 
building Community Dashboard, Family Dashboard, Portfolio Benchmarking, 
and RPM Status Card.

---

## Community Dashboard / Social Isolation Monitor

### Common Areas (use these for mock data)
- Dining Room
- Activity Room
- Library / Lounge
- Fitness Center
- Outdoor Courtyard
- Chapel

### Activity Calendar (3–5 programs/day)
- Morning: Chair yoga, walking club
- Afternoon: Bingo, card games, movie screening, arts & crafts
- Evening: Live music, trivia night

### Dining
- Cafeteria-style, 3 meals/day
- Breakfast: 7–9am
- Lunch: 11:30am–1pm
- Dinner: 4:30–6:30pm
- Realistic participation: 70–80% for meals, 30–50% for activities

### Social Isolation Flags
- Unit 118 (Eleanor Vasquez): 72-hour isolation flag, 1 meal/day, 
  0 activity attendance this week
- Unit 312 (Robert Chen): mild decline, 2 meals/day, 1 activity/week

---

## Family Dashboard

### Tone & Voice
- Warm, plain English, zero medical jargon
- Think: caring text message from a nurse, not an EMR report
- Good: "Mom had a great week — she attended 4 activities and her 
  sleep has been restful"
- Bad: "ADL consistency 91%, circadian adherence nominal"

### What Families Care About
- Activities attended (count + names): "Attended chair yoga, bingo, 
  and movie night this week"
- Meals: "Eating well — attended all 3 meals today"
- Sleep quality in plain terms: Good / Fair / Poor (not a score)
- Last staff check-in date
- Any alerts, framed reassuringly: "Staff checked in with Mom 
  yesterday — everything is fine"
- Wellness trend: simple up/down/stable, no numbers

### What Families Don't Need
- Raw sensor readings
- Clinical scores (ADL, mEDI, etc.)
- Device status
- Billing codes

### Design
- Soft whites, warm greens, generous spacing, large readable fonts
- Light mode — completely different from the ops dashboard
- Feel: Caring.com, not Epic EMR
- No consent language needed for demo

### Primary Demo Resident
Margaret Chen, Unit 2B — healthy, score 87. Her family dashboard 
should feel warm and reassuring.

---

## Portfolio Benchmarking

### Audience
David Carlson, Renfir Capital — evaluating an investment. He wants 
to see both wellness outcomes AND financial return.

### Metrics to Show (per property)
| Metric | Description |
|--------|-------------|
| Wellness Score | Aggregate across all units |
| Fall Incident Rate | Per 100 residents/month |
| RPM Enrollment % | % of eligible residents enrolled |
| WELL Compliance Score | Overall % compliant |
| Fall Cost Avoidance | Estimated annual savings ($30K–50K per prevented fall) |
| Medicare Reimbursement | Monthly per enrolled resident ($150–200) |

### Properties (3 in demo portfolio)
- Lakeview Commons
- Oak Ridge Villas
- Sunset Gardens

### Headline ROI Metric
"Portfolio wellness initiative projected to generate $2.1M in 
fall cost avoidance annually"

Show this prominently — this is the CFO/investor hook.

### Percentile Rankings
Show each property ranked against industry benchmarks.
Lakeview Commons should be top performer.

---

## RPM Status Card

### Visual
- Calendar grid (16 boxes = 16 days), not a progress bar
- Green fill = data logged that day
- Empty/gray = missed
- Red border = compliance at risk (<12 days logged)

### Devices (FDA-cleared only — do NOT show generic smart home sensors)
- Withings BPM Connect (blood pressure)
- Dexcom G7 (continuous glucose)

### Billing Codes
- CPT 99453: Initial setup ($19.33 one-time)
- CPT 99454: Device supply, 16-day threshold ($91.10/month)
- CPT 99457: Remote monitoring, 20 min staff time ($50.18/month)

### Dollar Amounts
Show them — $91–168/patient/month is the point.
Frame as "revenue opportunity" not just compliance.
Make it feel like money sitting on the table.

### Demo Data
- Unit 2B (Margaret Chen): 14/16 days logged, on track, projected $141/month
- Unit 118 (Eleanor Vasquez): 6/16 days, at risk, alert shown
- Unit 312 (Robert Chen): 16/16 days, fully compliant, projected $168/month
