COD RTO Automation
A prototype decision-support system for reducing Return to Origin (RTO) losses on Cash on Delivery (COD) orders. It evaluates order risk, recommends an operational action, simulates WhatsApp confirmation/prepaid flows, and provides dashboard views for operations.
Prototype notice: This project uses the supplied sample order dataset and simulated WhatsApp interactions. It is not connected to a live Shopify store, WhatsApp Business account, or payment gateway. Do not use a simulated customer reply as proof of payment.

Features
- COD decision engine: Recommends one of four actions:
  - SHIP_AS_IS — ship the order normally.
  - WHATSAPP_CONFIRMATION — ask the customer to confirm before dispatch.
  - PREPAID_NUDGE — offer a limited discount to encourage prepaid payment.
  - HOLD_REVIEW — send the order for manual review; this does not automatically cancel it.
- Risk assessment: Uses deterministic Python scoring and configurable thresholds. Gemini can assist with interpreting customer names and address quality when available.
- Fallback behaviour: The Python workflow can continue if the external AI service is unavailable. Check the AI status shown by the application.
- WhatsApp simulator: Generates confirmation/prepaid messages and simulates YES, NO, MAYBE/unclear, payment-reported and expiry scenarios.
- Operations dashboard: Displays order and decision information, with historical analysis and operational views.
- Analytics and impact estimates: Shows dataset findings and cost assumptions. It does not claim actual savings until real order outcomes have been recorded.
Technology
- Frontend: React and Vite
- Backend: Python, FastAPI
- Data: CSV sample dataset and local JSON files for prototype workflow history
- Optional AI enrichment: Google Gemini
Requirements
Install the following before starting:
- Python 3.10 or newer
- Node.js and npm
- Git (optional, for cloning and submitting the repository)
Run locally
The following instructions are for Windows PowerShell.
1. Get the project
Clone the repository, or open the project folder if you already have it:
git clone YOUR_GITHUB_REPOSITORY_URL
cd cod-rto-automation
Replace YOUR_GITHUB_REPOSITORY_URL with the actual repository URL.
2. Start the backend
Open a PowerShell terminal:
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
If PowerShell blocks activation, run this once in that terminal and activate again:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
Install backend dependencies:
pip install -r requirements.txt
If the project does not contain backend/requirements.txt, create it from the packages actually used by the backend before submitting. Do not commit the virtual environment.

If Gemini AI enrichment is enabled, create backend/.env and add your own API key:
GEMINI_API_KEY=your_gemini_api_key
Keep .env private. Never commit or share your real API key. The application should still be testable using its Python fallback if Gemini is not configured or is unavailable.

Start the API:
uvicorn app.main:app --reload
Backend API: http://127.0.0.1:8000
Interactive API documentation: http://127.0.0.1:8000/docs

Leave this terminal running.
3. Start the frontend
Open a second PowerShell terminal:
cd path\to\cod-rto-automation\frontend
npm install
Create or check the frontend .env file. Set the API URL:
VITE_API_URL=http://localhost:8000
Start the frontend:
npm run dev
Open the local URL printed by Vite in the terminal (commonly http://localhost:5173).
If your frontend's API helper already has http://localhost:8000 as its default, the frontend environment variable may be optional. Restart the Vite server after changing .env.

Quick test
1. Open the frontend in your browser.
2. Visit Overview to check the dashboard.
3. Visit Orders to search and filter sample orders.
4. Open AI Evaluator and evaluate a low-, medium- and high-risk test order.
5. Open WhatsApp and generate a confirmation or prepaid message for an eligible sample order.
6. Test YES, NO and MAYBE/UNCLEAR replies. Test expiry/no reply as well.
7. Check Analytics and Impact for the dataset analysis and clearly labelled estimates.
You can also open http://127.0.0.1:8000/docs to inspect and test backend API endpoints.
Business assumptions used in the prototype
The estimated cost of one RTO is based on the assignment assumptions:
Cost component	Estimate
Forward shipping	₹65
Return shipping	₹65
Packaging and handling	₹25
Expected damaged-product cost (8% × ₹180)	₹14.40
Estimated cost per RTO	₹169.40


The prepaid scenario uses the assignment assumptions of 28% COD RTO and 4% prepaid RTO. The estimated difference in expected RTO cost is approximately ₹40.66 per successful prepaid conversion before discount. The prototype caps the discount at 5% of order value and ₹30.

These are estimates based on supplied assumptions, not guaranteed savings or audited financial results.
Data and limitations
- The supplied sample CSV is historical data, not a live Shopify feed.
- The WhatsApp feature is a simulator; it does not send real WhatsApp messages.
- A PAID reply in the simulator is customer-reported only. A real payment gateway must verify payment before dispatch.
- Gemini is optional enrichment. It can time out or be unavailable; deterministic Python checks and fallback behaviour are used.
- Local JSON files are suitable for a single-user prototype, not a production multi-worker deployment.
- Actual RTO savings, genuine-order losses and net financial impact cannot be established from recommended-action counts alone. They require final order outcomes and a suitable comparison baseline.
- Risk thresholds and scoring weights are prototype settings. They should be calibrated and validated against representative delivery outcomes before production use.
- HOLD_REVIEW means human review, not automatic cancellation.
Repository documentation
Additional submission documents are in the docs/ folder:
- founder_memo.pdf — business findings, recommendations, trade-offs and rollout roadmap.
- decision_log.md — important decisions, alternatives considered and rationale.
- ai_usage_log.md — AI tools used, examples of weak or unreliable outputs, and how they were checked.
Security
- Do not commit .env files, API keys, passwords, access tokens or private customer data.
- Keep the Python virtual environment and generated cache files out of Git.
- Use test/sample data when demonstrating this prototype.
Author
Sameer 
GitHub profile:-https://github.com/Sameerbisayati