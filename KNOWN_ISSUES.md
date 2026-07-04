# Known Issues (v1.0.0)

While Enjay Smart HelpDesk AI v1.0.0 is production-ready, the following limitations and known issues are documented for upcoming sprints:

1. **TicketSequence Single-Row Bottleneck**:
   - *Impact*: Under extreme concurrent creation loads (e.g., thousands of tickets per second), the `TicketSequence` table may cause database lock contention. 
   - *Workaround*: None required for standard enterprise usage. Future updates will evaluate native PostgreSQL `SEQUENCE` with trigger-based formatting.

2. **Automated E2E Testing**:
   - *Impact*: Automated frontend integration test coverage (Playwright/Cypress) is currently omitted from the CI/CD pipeline.
   - *Workaround*: QA engineers must execute manual regression checklists prior to releases.

3. **Horizontal Mobile Scrolling on Deep Timelines**:
   - *Impact*: Extensively nested ticket timelines or massive monolithic code block attachments might overflow on devices with viewports narrower than 320px (e.g., iPhone SE).
   - *Workaround*: View on standard mobile or desktop viewports.

4. **Missing Dockerfile for Node Services**:
   - *Impact*: While a `docker-compose.yml` provisions the PostgreSQL database, isolated `Dockerfile` definitions for building and containerizing the Node.js backend and Nginx-hosted frontend are not yet unified in the repo root. 
   - *Workaround*: Deploy utilizing standard Node.js processes (e.g., PM2) or write custom Dockerfiles per environment.

5. **AI Confidence Score UI Edge Case**:
   - *Impact*: If the AI Provider responds without a confidence rating but successfully summarizes the ticket, the UI renders `N/A`.
   - *Workaround*: This is intended behavior, but user feedback suggests it could be hidden rather than displaying `N/A`.
