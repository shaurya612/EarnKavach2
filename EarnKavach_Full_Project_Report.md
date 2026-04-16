# EarnKavach - The Complete Hackathon Report & Ecosystem Guide

**Project Target:** DEVTrails 2026 Use Case (Parametric Income Protection)
**Goal:** A fully autonomous AI-driven insurance platform that predicts income loss, prevents fraud, and executes instant payouts for gig workers without manual bureaucracy.

---

## 1. Where to See DEVTrails Phase Fulfillments
- **Phase 1 (MERN Foundation):** Accessible immediately upon loading `http://localhost:5173`. Uses a secure MongoDB + Node backend, JWT-based Login/Signup, and a tailored gig-worker profile schema.
- **Phase 2 (Razorpay + Models):** Viewable by logging in as a Worker. The `/demo` page visually simulates the Open-Meteo API calling out to our 3 Machine Learning endpoints (Income Predictor, Risk Score, WRS), terminating in a live Razorpay payout flow.
- **Phase 3 (Scale & Optimise):** Viewable by logging in as an Admin. The `/admin` Portal features the **Predictive Analytics (7-Day Forecast)** pane utilizing Open-Meteo hooks, Isolation Forest Fraud mapping, and a live tracking of the System **Loss Ratio**.

---

## 2. Feature-by-Feature Pipeline Explanation

### A) Onboarding (Signup & Login)
Gig workers (e.g., Zomato/Swiggy partners) sign up by providing their name, email, mapping a specific Platform, and creating a password. Behind the scenes, the `authController.js` hashes the password securely using `bcryptjs` and returns a JWT token. They can immediately log in to access the private routes.

### B) Client Dashboard (`/dashboard`)
Upon entering, workers see a stunning glowing interface natively displaying their real-time "Worker Reliability Score" (fetched from the ML API) which dictates their claim eligibility. They see live macro-economic statistics, past claims, and expected weekly premiums calculated dynamically.

### C) The Simulation Sandbox (`/demo`)
Because we cannot control real-world rainfall during a hackathon demo, we built a Simulator Sandbox. Workers click on a map. The system:
1. Reaches out to the public **Open-Meteo API** to get real humidity/rain data for that click.
2. Formats that data and sends it to the custom Machine Learning APIs.
3. Automatically triggers a parametric "Claim Event" if the disruption is severe.

### D) Global Control Center (`/`, Admin Role)
When a user with the `admin` role logs in, their homepage transforms into a massive B2B server monitoring hub. They can watch deep analytics, Isolation Forest anomaly data, macro-weather forecasts, and real-time backend latency without worker-facing marketing noise.

### E) Administrative Metrics (`/admin`)
The inner portal for Admins where they can explicitly see the "Loss Ratio" (a crucial insurance metric calculating Total Paid out vs Total Premuims Earned), active worker telemetry tracking, and the automated "Payout Cron Schedules" managed by Node.

---

## 3. Team Ecosystem: A Real-World Simulated Workflow

**Scenario:** You and your team are demonstrating the app to judges. One of you logs in as the **Admin**, and three others grab their phones and log in as **Worker Clients**.

**Step 1:** The **Admin** opens the Global Dashboard on a projector. The dashboard shows "0 Active Claims" and a healthy "WRS System Average". Everything is secure.
**Step 2:** The three **Worker Clients** open the app on their phones in Bangalore.
**Step 3:** A severe storm functionally 'hits' Bangalore. The 3 workers click the `Simulate Disruption` button on the `/demo` page. 
**Step 4:** The Node.js Backend instantly catches 3 concurrent payload requests. It queries the Open-Meteo API, confirming there is indeed 12mm of rainfall currently. 
**Step 5:** The backend feeds the worker profiles into the **Fraud Detection API**. It notices Worker #3 is reporting rainfall from Bangalore, but their GPS device history claims they were in Delhi 5 minutes ago. It instantly labels Worker #3 as a "Spoofer" via Isolation Forest and flags them.
**Step 6:** The backend feeds Worker #1 and #2 into the **Income Prediction API**, concluding they have lost ₹250 of expected income due to the storm. Automatically, two Razorpay Payout triggers are minted for Worker #1 and #2. 
**Step 7:** On the Projector, the **Admin** instantly sees the dashboard update: "2 Paid Claims. 1 Fraud Event Blocked", without a human insurance-adjuster ever lifting a finger!

---

## 4. Deep Dive into Machine Learning APIs & Fraud

The platform removes the human element entirely using 4 specific deployed APIs:

- **Income Predictor ML (`earnkavach-ml-api.onrender.com`):** Uses an XGBoost Hybrid Model. Input includes location and history. Output is precisely how much money the worker *would* have predictably made if it didn't rain.
- **Risk Score ML (`earnkavach-riskscore.onrender.com`):** Consumes JSON payloads from the Open-Meteo weather API (lat, long, precipitation, temp). Outputs a multiplier threat integer (e.g. 1.2x Risk). 
- **Worker Reliability Score (`earnkavach-wrs-sanya.onrender.com`):** Maps a worker's consistency. If a worker accepts every order, they get a 95/100 score. If they constantly uninstall the app or cancel orders, the score drops. Claims are auto-rejected if the score is under 55.
- **Fraud Detection API (`earnkavach-fraud-api.onrender.com`):** The masterpiece Isolation Forest algorithm. It looks for spatial anomalies—like 50 claims occurring from the exact same street corner within 1 minute, or a device jumping cities. It immediately blocks these payloads from hitting Razorpay, saving the insurance pool money. 

---

## 5. The Complete Codebase Map (File-By-File)

### 📂 `backend/` (The Server)
- **`app.js` / `server.js`**: The root of the backend. Bootstraps the Express server, connects to MongoDB, and injects middleware.
- **`routes/api.js`**: The master switchboard. Routes `/auth`, `/claim`, `/admin`, and `/payment` requests to specific controllers.
- **`middleware/authMiddleware.js`**: Protects secure routes by checking the JWT token. Rejects unauthorized HTTP requests.
- **`controllers/authController.js`**: Controls User registration/logins and encrypts passwords.
- **`controllers/claimController.js`**: The most critical engine. Reads disruption metrics, pipes them sequentially through the ML APIs, and handles the logic for storing Claim documents as `approved`, `pending`, or `blocked`.
- **`controllers/adminController.js`**: Computes massive array logic. Calculates "Loss Ratios", counts system-wide fraud, and hosts the `getPredictiveAnalytics` algorithm.
- **`controllers/paymentController.js`**: Directly communicates with the Razorpay instance using protected environment keys.
- **`services/fraudService.js`, `incomeService.js`, `riskService.js`, `wrsService.js`**: Isolated helper modules that strictly communicate with the external Render hosted python Machine Learning endpoints using `axios`.
- **`models/User.js`, `Claim.js`, `WorkerProfile.js`**: Mongoose Schemas strictly defining structural rules for documents being saved into the MongoDB Atlas layer.

### 📂 `src/` (The Frontend React App)
- **`main.tsx` & `App.tsx`**: Mounts React to the DOM. Handles `react-router-dom` mapping URLs (like `/admin` and `/login`) to the UI components. Contains `ScrollToTop` logic.
- **`context/AuthContext.tsx`**: A massive global state provider holding the user's `token`, `role`, and `userData`. Wraps the entire app so any page can check `isAuthenticated`.
- **`pages/Home.tsx`**: A Wrapper component. If a worker visits, it renders a stunning gig-worker pitch. If an admin visits, it returns `<AdminHome />`.
- **`pages/AdminHome.tsx`**: A dedicated B2B "Enterprise" dashboard loaded with data grids and telemetry.
- **`pages/Admin.tsx`**: The inner portal for viewing numerical statistics. Renders the Predictive Analytics forecast and the critical Loss Ratio graphs using Recharts.
- **`pages/Demo.tsx`**: The interactive "Sandboxed Map" where users click around the map and trigger APIs manually for hackathon staging purposes.
- **`pages/Claims.tsx`**: A personalized ledger where a worker sees only their own historical payouts and fraud rejections.
- **`components/Navbar.tsx` & `Footer.tsx`**: Reusable navigation that dynamically alters rendering elements (hiding Admin tabs from workers). Extensively styled with Tailwind glassmorphism.
