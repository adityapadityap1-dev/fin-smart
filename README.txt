FIN SMART 2.0 — LEARN. PLAN. GROW.
=================================

OVERVIEW
Fin Smart 2.0 is an English-only financial education and personal money-planning web application for Indian learners, students and young professionals. It uses a responsive black-and-red interface and keeps personal planning data in the current browser by default.

WHAT IS INCLUDED
- Professional responsive interface for desktop, tablet and mobile.
- Dashboard with income, expenses, balance, spending categories and six-month trend.
- Budget planner, transaction history and savings goals.
- Financial Health Score: an educational habit indicator, not a credit score.
- Net Worth Tracker: manually entered assets and liabilities.
- Student Finance Planner for pocket money, part-time income and spending.
- Investment Simulator using virtual cash and user-entered prices only; no live market data or real orders.
- Calculators: EMI, SIP, compound interest, simple interest, FD, RD, PPF estimate, inflation, education-loan EMI, credit-card payoff, retirement estimate and a manual-rate tax estimate.
- Government scheme directory with official links.
- Financial Learning Centre, quiz and Learning Challenges.
- Financial Safety Centre with scam-prevention guidance and official reporting links.
- Finance News source directory linking to RBI, SEBI, PIB and selected newsrooms. It does not display live headlines.
- Fin Smart AI backend integration through the OpenAI Responses API. AI works only after you configure your own API key on the server.
- English-only quick FAQ and browser speech features where supported.
- Local data backup export/import and local data deletion.

REQUIREMENTS
- Node.js 18 or newer for the local web server and AI backend.
- A modern browser (Chrome, Edge, Firefox or Safari).
- Optional: an OpenAI API key and API billing/availability for the AI assistant.

RUN THE WEBSITE
1. Extract the ZIP.
2. Open a terminal in the Fin_Smart folder (the folder containing server.js).
3. Run: npm start
4. Open: http://localhost:3000
5. The rest of the application works locally without an AI key. The AI page will report that it is not configured until a key is added.

ENABLE THE REAL AI ASSISTANT
1. Copy .env.example to a new file named .env in the Fin_Smart folder.
2. Open .env and set OPENAI_API_KEY=your_actual_key.
3. Optionally set OPENAI_MODEL to a model available to your account. The default is gpt-5.4-mini.
4. Save .env and restart the server with npm start.
5. Open Fin Smart AI and check that the backend status says it is configured.

IMPORTANT API KEY SAFETY
- Never put an API key in index.html or any browser JavaScript.
- Never upload .env to a public repository or share it in a screenshot.
- .env is excluded by .gitignore. Keep your key private and rotate it if exposed.
- The backend sends prompts to the configured AI provider. Do not enter personal identifiers, bank account details, passwords, OTPs, UPI PINs or card credentials.
- The backend does not intentionally save prompts or answers. Provider-side processing is subject to the provider's current terms and settings.
- The basic in-memory rate limit resets when the server restarts and is not a substitute for production abuse prevention.

DATA STORAGE AND CLOUD READINESS
- This release stores transactions, budgets, savings goals, net worth, student planner, virtual trades and learning progress in browser localStorage.
- There are no user accounts, cloud database, automatic cross-device sync or remote backup in this release.
- Export a JSON backup from Account & Settings before clearing browser data or changing devices.
- The application is structured so a cloud service can be added later, but cloud storage is not implemented or enabled.

CALCULATOR NOTES
- Results are estimates based on the assumptions entered; lender terms, compounding rules, fees, taxes and rounding may change real outcomes.
- FD, RD, PPF and retirement projections use simplified assumptions. PPF rates and rules can change; the PPF estimator is not an official statement.
- The Tax Estimate calculator uses a flat effective rate entered by the user. It is NOT an Indian income-tax slab calculator and does not apply rebates, deductions, cess or surcharge.
- Investment Simulator uses user-entered prices and virtual money. It does not fetch quotes, place orders or predict real returns.
- Financial Health Score is a habit indicator only and is not a credit score or regulated financial assessment.

NEWS AND GOVERNMENT SCHEMES
- Finance News is a directory of trusted sources, not a live news feed. Verify dates and details on the publisher's site.
- Government scheme details and eligibility can change. Confirm the latest rules on the linked official government portal before applying.

SECURITY AND LIMITATIONS
- Use localhost or deploy behind HTTPS. Do not expose the Node server directly to the public internet without production hardening, TLS termination, monitoring and stronger rate limiting.
- The server adds basic security headers and a per-IP in-memory request limit for AI requests. This is a starter backend, not a security audit or production certification.
- No bank accounts or payment systems are connected. Fin Smart does not transfer money, execute investments or submit scheme applications.
- AI output may be incomplete or incorrect. Verify important tax, legal, scheme, banking and investment information with official sources or qualified professionals.
- Fin Smart is an educational tool, not financial, investment, tax or legal advice.

TROUBLESHOOTING
- If the page does not load, confirm Node.js 18+ is installed and run npm start from the correct folder.
- If port 3000 is in use, set PORT=3001 in .env and open http://localhost:3001.
- If AI is unavailable, check the server terminal, API key, model access, provider quota and internet connection.
- Opening index.html directly with file:// will not run the AI backend. Use http://localhost:3000.

VERSION
Fin Smart 2.0 · English only · Local-first · AI backend optional until configured.
