FIN SMART 2.0 — APPLICATION ARCHITECTURE
========================================

1. FRONTEND
- index.html contains the responsive English-only user interface, styles and browser-side application logic.
- Existing budgeting, transaction, savings, learning, quiz, scheme directory, EMI and core calculator experiences remain available.
- New modules add financial habit scoring, manual net-worth tracking, student budgeting, a virtual investment simulator, safety education, challenges, source links for financial news and expanded calculators.

2. LOCAL DATA LAYER
- FinSmartStorage is the small persistence interface used by the application (get/set).
- The current implementation uses browser localStorage under the key finsmart_v1.
- normalizeState applies defaults and validates the expected collection shapes when loading or importing a backup.
- A future cloud adapter can implement the same get/set boundary, but no cloud adapter, account system or remote database is included in this build.

3. AI BACKEND
- server.js is a dependency-free Node.js 18+ HTTP server.
- GET /api/health reports whether an API key is configured without exposing the key.
- POST /api/chat accepts a bounded question, applies a basic in-memory per-IP rate limit, and forwards the request to the OpenAI Responses API.
- The OpenAI API key is read only from the server-side .env file or process environment. It is never embedded in index.html or returned by an endpoint.
- AI chat is inactive until the owner supplies a valid key and starts the server. The rest of the app remains usable without it.

4. SECURITY BOUNDARIES
- The server blocks direct access to dotfiles, server.js and package.json.
- Basic security headers, request body limits, same-origin endpoints and an in-memory rate limit are included.
- This is a local-first starter application, not a production security-certified service. A public deployment needs HTTPS, stronger persistent rate limiting, monitoring, secret management, security review and appropriate privacy notices.
- Browser localStorage is not encrypted or protected from another person using the same browser profile.

5. THIRD-PARTY SERVICES
- AI: OpenAI API when configured by the site owner.
- News: the page links to external publishers and official sources; it does not scrape or reproduce live headlines.
- Market prices: none. The investment simulator uses manually entered sample prices only.
- Banking/payment connectivity: none.
