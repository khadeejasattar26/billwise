# 0012: Replace the long result page with a guided flow, one thing per screen
- Date: 2026-11-21
- Status: Accepted
- Related: supersedes the page layout in [0011](0011-frontend-product-page-and-tests.md); `frontend/src/screens/`, `frontend/src/lib/photo.ts`, `qa/ui_qa.py`

**Context:** Older Pakistani users on phones met one long page with about ten sections and seven folds. GOV.UK research favours one question per page and warns against accordions; NN/g recommends progressive disclosure and large targets.

**Decision:** Home → consent → photo → photo check → answer, then details or ask. Screens live in the URL hash so the back button works. The answer screen shows only the amount, due date and main reason. Photos are checked on the phone for blur, light and size, and shrunk before upload. We rejected improving the single page: every fix still left the answer buried.

**Consequences:** Fewer decisions per screen, 3 taps to the camera, and a free example. More screens to maintain, plus hash routing and focus handling.

**Revisit when:** Pilot users get lost between screens, or the site needs real URLs for search engines.
