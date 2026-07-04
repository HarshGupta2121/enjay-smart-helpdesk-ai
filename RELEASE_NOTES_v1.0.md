# Release Notes - v1.0.0

**Date**: July 4, 2026
**Product**: Enjay Smart HelpDesk AI

We are excited to announce the General Availability (v1.0.0) of Enjay Smart HelpDesk AI. This release establishes a secure, AI-powered foundation for enterprise ticketing and routing.

## Highlights
- **Enterprise Authentication**: Hardened JWT workflow featuring seamless refresh token rotation and cryptographic SHA-256 storage.
- **Core Ticket Engine**: Robust state-machine enforcement with native optimistic locking for concurrent agent editing.
- **AI Copilot**: Pluggable LLM intelligence (OpenAI/Gemini/Ollama) running asynchronously to provide automatic triage (Category, Priority, Sentiment) and generate rich, editable agent drafts in the UI.
- **Team Routing**: Dynamic queues utilizing intelligent strategies (`ROUND_ROBIN`, `LEAST_OPEN`, `LEAST_ACTIVE`) for zero-touch ticket assignments.
- **Optimized Frontend**: A heavily chunk-optimized React 18 / Vite frontend built on `shadcn/ui`, featuring global error boundaries, lazy-loaded route splitting, and strict accessible markup.

## Changes Since RC
- Hardened CORS configuration and implemented `helmet` security headers.
- Implemented `React.lazy()` and `<Suspense>` resolving bundle size warnings.
- Added live OpenAPI (Swagger) API documentation available at `/api/docs`.
