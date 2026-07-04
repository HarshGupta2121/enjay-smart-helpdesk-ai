# Frontend Architecture

The frontend is a React application built with Vite, TypeScript, and TailwindCSS.

## Core Libraries
- **React 18**
- **Vite**: Build tool and dev server.
- **TailwindCSS**: Utility-first CSS framework.
- **shadcn/ui**: Reusable accessible components built on Radix UI.
- **Zustand**: Global state management (Auth).
- **React Query (TanStack Query)**: Data fetching, caching, and mutation state management.
- **React Router**: Client-side routing.
- **Lucide React**: Iconography.

## React Query Setup
All API interactions are abstracted into custom hooks under `frontend/src/hooks/`.
- Queries are used for fetching data (`useTickets`, `useTicketTimeline`, `useSimilarTickets`).
- Mutations are used for updating data (`useCreateTicket`, `useUpdateTicketStatus`, `useAddComment`, `useGenerateAiReply`).
- Components do not contain direct Axios calls; they only consume hooks.
- Query invalidation is performed automatically in `onSuccess` handlers to refresh data.

## AI Copilot Integration
The `TicketDetails.tsx` component is the primary surface for AI interactions:
- **AI Summary Card**: Renders semantic AI outputs (Summary, Priority, Category, Sentiment, Confidence).
- **Similar Tickets**: Renders tickets with > 80% similarity based on pgvector cosine distance, fetched via `useSimilarTickets`.
- **Draft Generator**: Integrates with `useGenerateAiReply` to display an inline skeleton loader. Drafts are rendered in a separate `Textarea` element allowing agents to refine, copy, or regenerate before appending them to the main public reply box.
