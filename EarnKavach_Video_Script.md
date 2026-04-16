# EarnKavach — 5-Minute Video Pitch Script
**Target:** DEVTrails 2026 Hackathon Use Case 
**Time Limit:** 5 Minutes 
**Format:** Screen Recording Voiceover

---

### [0:00 - 0:45] Introduction & The Crisis
*(On Screen: Start on the Client Home Page `/` without logging in. Scroll slowly down the stunning 'Shield Your Earnings' page).*

**Speaker:** 
"Hello judges, we are Team EarnKavach. In India alone, over 23 million gig delivery workers lose between 20 to 60 percent of their daily income due to massive, uncontrollable weather and traffic disruptions. Currently, they have zero protection. Traditional insurance is too slow, too manual, and requires too much paperwork for micro-payouts. 

Today we are presenting EarnKavach — India's first 100% autonomous, AI-driven parametric income protection engine built specifically on the MERN stack."

### [0:45 - 1:30] The Worker Experience (Client Flow)
*(On Screen: Click 'Login' or 'Dashboard', log into a Worker account. Show the Worker Dashboard `/dashboard`).*

**Speaker:**
"For a Zomato or Swiggy partner, the experience is frictionless. They sign up via our secure node backend and link their platform. On their dynamic dashboard, they have complete transparency. 

They can see their calculated expected earnings, live micro-disruption alerts, and, most importantly, their 'Worker Reliability Score'. We don't ask for manual claims. Once the worker sets up their coverage, our system protects them automatically."

### [1:30 - 2:30] The Live Ecosystem Simulation
*(On Screen: Click the 'Live Demo' tab. Keep 2 or 3 tabs open if you have team members to show the simulation feature).*

**Speaker:**
"Since we can't spawn a storm during this presentation, we built this Sandbox ecosystem to demonstrate our parametric engine. Imagine thousands of workers driving across the city. 

When a worker clicks on our map, the system isn't guessing. Our Node backend instantly pings the public **Open-Meteo API** to fetch real-time hyperlocal coordinates for precipitation and humidity. Once the disruption breaches a critical threshold, say 10mm of rainfall, the claim pipeline triggers entirely on its own."

### [2:30 - 3:30] Deep AI & Fraud Detection (The Backend)
*(On Screen: Stay on the Demo page, click the map to trigger a Severe Weather alert. Show the Razorpay success toast).*

**Speaker:**
"But here is where the true intelligence lies. When it rains, we don't just hand out money blindly. Our backend routes that rainfall payload through 4 separate deployed Machine Learning APIs simultaneously:
1. First, our **Worker Reliability Score** checks if the driver actually accepts orders natively.
2. Second, our **Income Predictor ML** uses XGBoost to calculate exactly how much money they *would* have lost based on historical data.
3. Third, the **Risk Score ML** evaluates the weather multipliers.
4. Finally, our **Fraud Detection Engine** uses an Isolation Forest algorithm. If five riders try to spoof GPS coordinates from the same cafe to steal payouts, the AI intercepts the anomaly and blocks it.

If they pass, our Razorpay server integration pushes the payout instantly to their UPI in milliseconds."

### [3:30 - 4:45] The Enterprise Admin View (Insurer Flow)
*(On Screen: Sign out. Log in using an Admin account. Show the B2B Admin Homepage `Global Control Center`, then click into the Admin Portal `/admin`).*

**Speaker:**
"Now let's switch gears. For the insurers running EarnKavach, the platform radically transforms. This is our B2B Global Control Center. 

Inside the Admin Portal, human adjusters are replaced completely by macro-telemetry. We track live Worker status, Fraud Intervention metrics, and our proprietary **Loss Ratio**—we know instantly if our premium pricing model is profitable based on the payout volume. 

We also scaled our engine with **Predictive Analytics**. We natively hook into future 7-day weather forecasts to pre-feed our Artificial Intelligence. It calculates exact expected claims volume surges for next week before the rain even begins falling."

### [4:45 - 5:00] Conclusion
*(On Screen: Show the bottom of the Admin Portal displaying the ML API Health status 'UP').*

**Speaker:**
"From the MongoDB databases to the automated Razorpay ledgers, every architecture tier is actively running independent of human interaction. EarnKavach doesn't just insure the gig economy—we stabilize it at scale. Thank you for watching." 
