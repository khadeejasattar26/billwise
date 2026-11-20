# Decision log

| ID | Title | Status |
|----|-------|--------|
| [0001](0001-ocr-first-with-vision-fallback.md) | Read bills with OCR first, fall back to vision once | Accepted, amended by 0009 for the free host |
| [0002](0002-claude-via-official-sdk-inside-langgraph.md) | Call Claude through the official SDK inside a LangGraph graph | Superseded by 0004 |
| [0003](0003-postgres-upsert-per-account-month.md) | Store one bill per account per month with a Postgres upsert | Accepted |
| [0004](0004-local-ollama-instead-of-paid-llm-api.md) | Run the LLM locally with Ollama instead of a paid API | Accepted, amended by 0005 |
| [0005](0005-ollama-default-gpt-optional.md) | Keep local Ollama as the default and allow GPT as an optional provider | Accepted |
| [0006](0006-urdu-first-plain-language-explanations.md) | Explain bills in plain Urdu first, with numbers computed in code | Accepted |
| [0007](0007-reasons-from-printed-history-and-rules.md) | Explain "why" with rules over the bill's printed history, and speak on the server | Accepted |
| [0008](0008-host-on-vercel-render-neon.md) | Host the site on Vercel and the backend on Render's free plan, with Neon Postgres | Accepted, amended by 0010 (no database on the public site) |
| [0009](0009-vision-only-on-free-hosting.md) | On the free host, send the photo straight to the vision model instead of running Tesseract | Accepted |
| [0010](0010-public-site-stores-nothing.md) | The public site stores nothing; uploads need explicit consent | Accepted |
| [0011](0011-frontend-product-page-and-tests.md) | Frontend as a product page, split by feature, with Vitest tests | Accepted, layout superseded by 0012 |
| [0012](0012-guided-flow-one-thing-per-screen.md) | Replace the long result page with a guided flow, one thing per screen | Accepted |
