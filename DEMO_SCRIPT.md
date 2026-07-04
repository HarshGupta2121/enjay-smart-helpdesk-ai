# Enjay Smart HelpDesk AI - Demo Script

*This script is designed for a 5-minute showcase of the application's core capabilities.*

### 1. Introduction & Authentication (0:00 - 1:00)
- **Action**: Navigate to `/login`.
- **Talk Track**: "Welcome to Enjay Smart HelpDesk AI. Security is our foundation, so we log in via a robust JWT system with HttpOnly refresh tokens and strictly enforced Role-Based Access Control."
- **Action**: Log in as an `ADMIN` or `ENGINEER`.

### 2. The Enterprise Dashboard (1:00 - 2:00)
- **Action**: Arrive at `/dashboard`. 
- **Talk Track**: "Here is the active queue. The system uses background workers to automatically assign incoming tickets based on team load—like Round Robin or Least Open tickets. Notice how fast the data table loads; this is powered by React Query caching."
- **Action**: Filter the table by `Status: NEW` or `Priority: URGENT`.

### 3. Ticket Details & Timeline (2:00 - 3:00)
- **Action**: Click into an active ticket.
- **Talk Track**: "This is the unified timeline. We don't just track comments; every status change and internal note is logged sequentially for a perfect audit trail. It's also protected by optimistic locking, so if two agents type at once, data is never lost."

### 4. AI Intelligence & Duplicate Detection (3:00 - 4:00)
- **Action**: Point to the "AI Ticket Analysis" card at the top.
- **Talk Track**: "Behind the scenes, an LLM asynchronously analyzed the ticket upon creation, generating a summary, priority prediction, and sentiment analysis."
- **Action**: Point to the 'Similar Tickets Detected' block.
- **Talk Track**: "We also use vector embeddings natively in PostgreSQL to detect duplicates. If three people report the Wi-Fi being down, the system immediately flags the semantic similarity here, allowing agents to merge them."

### 5. AI Copilot Drafts & Resolution (4:00 - 5:00)
- **Action**: Scroll down to the reply box and click "Draft with AI".
- **Talk Track**: "Instead of typing manual replies, agents can invoke the AI Copilot. It reads the entire ticket history and generates a context-aware response."
- **Action**: Wait for the Skeleton loader to finish, click "Insert", and hit "Post Public Reply".
- **Action**: Change the Ticket Status dropdown to `RESOLVED`.
- **Talk Track**: "The response is posted, the SLA timers are fulfilled, and the ticket is resolved. That's a seamless, AI-accelerated IT workflow."
