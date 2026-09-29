# T&C RED FLAG SCANNER
> **"Before you click Agree, know what you're agreeing to."**  
> **Team: CorruptX** | Cybersecurity Hackathon Project

---

## 1. Project Overview

**T&C Red Flag Scanner** is an AI-powered cybersecurity application designed to analyze Terms & Conditions, Privacy Policies, and End User License Agreements (EULAs). It detects predatory, deceptive, or privacy-invasive clauses before users click "I Agree", empowering individuals to safeguard their digital rights and personal data.

Built with a **100% offline-first architecture**, the application guarantees zero third-party cloud data leakage—meaning your private documents, employment contracts, and agreements are evaluated entirely on your local machine.

---

## 2. Key Features

- **Automated Clause Segmentation**: Splits complex legal prose into discrete clauses while preserving decimal sections (e.g. `1.1`), bulleted provisions, and legal abbreviations (`e.g.`, `i.e.`, `U.S.`, `Inc.`).
- **14-Category Risk Taxonomy**: Detects patterns across critical vectors including:
  1. Data Sharing & Monetization
  2. Tracking & Hardware Telemetry (Fingerprinting, Session Replay)
  3. Excessive Data Collection (Sensors, Contacts, Biometrics)
  4. Mandatory Binding Arbitration & Class Action Waivers
  5. Unilateral Policy Modifications without Notice
  6. Broad Liability Waivers & Warranty Disclaimers
  7. Auto-Renewal & Recurring Billing Traps
  8. Unilateral Account Termination & Content Forfeiture
  9. Third-Party Vendor Access
  10. Indefinite Data Retention
  11. Real-Time Location & Background Tracking
  12. Behavioral Advertising & Demographic Profiling
  13. Content Licensing & User Rights Surrender
  14. Restrictive Cancellation Penalties
- **Negation & Privacy Protection Detection**: Intelligently distinguishes between risky clauses and positive privacy assertions (e.g. *"We do not sell your personal data"* is recognized as protection, not a red flag).
- **Deterministic 0–100 Risk Score**: Computes a mathematically grounded exposure score and assigns clear risk tiers:
  - `SAFE` (0–30)
  - `CAUTION` (31–60)
  - `HIGH RISK` (61–100)
- **Interactive Policy Highlighting & Inspector**: Renders full document text with inline color-coded risk spans (`.highlight-high`, `.highlight-medium`, `.highlight-low`). Clicking any clause opens the inspector drawer with plain-English translations and defense recommendations.
- **Client-Side Offline Engine**: Bundled with a dual-execution architecture. If the Python backend is running, it uses the local REST API. If running pure frontend or opening via `file:///`, the built-in JavaScript engine takes over automatically with zero network required.
- **Offline History & Reporting**: Stores previous scans locally using browser `localStorage` with view, delete, and JSON export capabilities.

---

## 3. Technology Stack

- **Backend**: Python 3 (Flask, Flask-CORS, BeautifulSoup4)
- **Analysis Engine**: Rule-based NLP pattern matcher and weighted scoring matrix (`analyzer.py` + `risk_rules.json`)
- **Frontend**: Modern Vanilla HTML5, CSS3 (Cyberpunk/Dark Cybersecurity Theme, Glassmorphism, CSS Grid), Vanilla ES6+ JavaScript
- **Icons**: Local inline SVGs (zero CDN dependency)
- **Storage**: Client-side `localStorage` and `sessionStorage`

---

## 4. Folder Structure

```
tc-red-flag-scanner/
│
├── backend/
│   ├── app.py                  # Flask API server & static router
│   ├── analyzer.py             # Core NLP rule engine & risk scorer
│   ├── risk_rules.json         # Cybersecurity risk taxonomy (14 categories)
│   ├── sample_policies.json    # Preloaded hackathon demo policies
│   ├── test_analyzer.py        # Automated test verification script
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── index.html              # Landing page with hero, mockup & team info
│   ├── scanner.html            # Main analysis console & scanning modal
│   ├── results.html            # Results dashboard with circular risk meter
│   ├── history.html            # Scan history management
│   ├── about.html              # Mission, cybersecurity context & team details
│   │
│   ├── css/
│   │   ├── style.css           # Global theme, design system & typography
│   │   ├── scanner.css         # Textarea, dropzone, and radar scanning overlay
│   │   ├── results.css         # Circular gauge, metrics, cards & highlighter
│   │   └── responsive.css      # Mobile, tablet, and desktop breakpoints
│   │
│   └── js/
│       ├── rules_data.js       # Offline bundled taxonomy
│       ├── sample_data.js      # Offline bundled demo policies
│       ├── client_analyzer.js  # Standalone client-side NLP engine
│       ├── app.js              # Shared state, notifications & localStorage
│       ├── scanner.js          # Scanner page controller & animation
│       ├── results.js          # Circular meter, highlighter & inspector
│       └── history.js          # History manager & report exporter
│
├── README.md                   # Complete technical documentation
└── .gitignore                  # Git ignore rules
```

---

## 5. Installation & Setup

### Prerequisites
- Python 3.9+ (Python 3.10, 3.11, 3.12, 3.14 supported)
- Any modern web browser (Chrome, Edge, Firefox, Brave, Safari)

### Option A: Running with Local Flask Server (Recommended)

1. Open PowerShell / Terminal in the `tc-red-flag-scanner/backend` directory:
   ```bash
   cd "backend"
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the Flask application:
   ```bash
   python app.py
   ```

4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

### Option B: Running 100% Offline Standalone (Zero Server Required)

You can run the entire application completely without a web server or Python:
1. Navigate to the `frontend/` folder.
2. Double-click `index.html` or open it directly in any browser (`file:///.../frontend/index.html`).
3. The built-in client-side analyzer (`client_analyzer.js`) automatically activates and executes scans locally in your browser.

---

## 6. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and active rule categories count |
| `GET` | `/api/rules` | Complete active risk rules taxonomy (`risk_rules.json`) |
| `GET` | `/api/demo` | Curated sample policies for instant hackathon evaluation |
| `POST` | `/api/scan` | Main analysis endpoint. Accepts JSON or multipart file uploads |

### Example Scan Request:
```bash
curl -X POST http://127.0.0.1:5000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"text": "We reserve the right to share your personal information with third parties. All disputes shall be resolved exclusively through binding arbitration.", "document_name": "Test Contract"}'
```

### Example Response:
```json
{
  "document_name": "Test Contract",
  "analyzed_at": "2026-09-22T23:15:30.123456",
  "risk_score": 68,
  "risk_level": "HIGH RISK",
  "clauses_analyzed": 2,
  "red_flags": 2,
  "severity_counts": {
    "HIGH": 2,
    "MEDIUM": 0,
    "LOW": 0
  },
  "categories": [
    { "category_id": "data_sharing", "category_name": "Data Sharing", "severity": "HIGH", "count": 1 },
    { "category_id": "arbitration", "category_name": "Mandatory Arbitration", "severity": "HIGH", "count": 1 }
  ],
  "flagged_clauses": [
    {
      "index": 0,
      "text": "We reserve the right to share your personal information with third parties.",
      "category_name": "Data Sharing",
      "severity": "HIGH",
      "explanation": "This clause allows the service to share, distribute, or sell your personal details with third-party vendors...",
      "why_it_matters": "Once your information is handed over to outside parties, you lose direct control...",
      "recommendation": "Check if an opt-out mechanism is available or avoid submitting sensitive confidential data."
    }
  ]
}
```

---

## 7. Risk Scoring Methodology

The risk score is calculated using a deterministic algorithm:
1. **Clause Weighting**:
   - `HIGH` severity clauses: 16 points each
   - `MEDIUM` severity clauses: 8 points each
   - `LOW` severity clauses: 4 points each
2. **Exposure Density Factor**:
   - Compares the ratio of flagged clauses to total document clauses:
   $$\text{Density Bonus} = \min\left(20, \left\lfloor\frac{\text{Flagged Clauses}}{\text{Total Clauses}} \times 35\right\rfloor\right)$$
3. **Composite Normalization**:
   $$\text{Score} = \min\left(100, (\text{Weighted Sum} \times 0.82) + \text{Density Bonus}\right)$$
4. **Safety Threshold Guardrails**:
   - If $\ge 3$ `HIGH` severity red flags are detected, the minimum score floor is bounded to $68$ (`HIGH RISK`).
   - If $\ge 1$ `HIGH` severity red flag is detected, score floor is bounded to $42$ (`CAUTION`).

---

## 8. Hackathon Demo Instructions

1. Launch the application (`python backend/app.py` or open `frontend/index.html`).
2. Click **"Scan a Document"** or navigate to `/scanner`.
3. Click the **"Load Demo Policy"** button in the toolbar. This loads the realistic **HyperNet Social App Terms**, featuring aggressive tracking, arbitration, and data sales.
4. Click **"Start Security Scan"**.
5. Observe the 4-step animated scanning overlay (`Extracting clauses... -> Classifying risks... -> Calculating risk score... -> Generating plain-English explanations`).
6. View the **Results Dashboard**:
   - Inspect the circular risk score gauge (~100/100 HIGH RISK).
   - Review detected red flag cards with plain-English translations and recommendations.
   - Switch to the **"Interactive Policy Analysis"** tab and click on highlighted spans to test the real-time **Clause Inspector**.
   - Check the **"Risk Breakdown"** tab for category rankings.
7. Click **"History"** in the top navigation to verify persistent local logging.

---

## 9. Future AI Architecture & Roadmap

```
Document / Policy Input
        ↓
Text Normalization & Cleaning
        ↓
Intelligent Clause Segmentation
        ↓
LLM / NLP Embedding & Zero-Shot Classification
(e.g., Local Llama 3 / Gemma 2B via ONNX Runtime / Ollama)
        ↓
Cybersecurity Risk Taxonomy Alignment
        ↓
Plain-English Simplification & Defense Synthesis
        ↓
Interactive Results Dashboard
```

The modular design of `ClauseAnalyzer` ensures that swapping regex rules with a HuggingFace Transformer pipeline or local quantized LLM requires updating only the `analyze_clause()` interface method without altering the frontend or database models.

---

## 10. Important Product Disclaimer

> **Disclaimer**: This tool provides automated risk analysis for informational and educational cybersecurity purposes and is **not a substitute for professional legal advice**.

---

## 11. Team Information

**Team CorruptX**
- **Vyom Khanna** — Team Lead (Architecture & Full-Stack Engineering)
- **Nalin Shakher** — Team Member (NLP Engine, Risk Taxonomy & Offline Pipeline)
- **Aayush Verma** — Team Member (Cybersecurity UI/UX & Interactive Clause Inspector)
