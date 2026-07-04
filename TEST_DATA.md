# Enjay Smart HelpDesk AI - Test Data

This file contains the credentials for the default seed data generated for development and QA testing. 

All accounts are pre-verified, active, and dynamically seeded with unique UI avatars.

## 🔑 Demo Accounts

| Role       | Name             | Email                 | Password     |
|------------|------------------|-----------------------|--------------|
| **ADMIN**  | System Admin     | `admin@enjay.com`     | `Admin@123`  |
| **MANAGER**| Support Manager  | `manager@enjay.com`   | `Password@123`|
| **ENGINEER**| Jane Engineer   | `engineer1@enjay.com` | `Password@123`|
| **ENGINEER**| Bob Engineer    | `engineer2@enjay.com` | `Password@123`|
| **CUSTOMER**| Alice Customer  | `customer1@enjay.com` | `Password@123`|
| **CUSTOMER**| Charlie Customer| `customer2@enjay.com` | `Password@123`|

## 🎫 Seeded Entities
The `npm run db:seed` command automatically populates the database with:
- **11 Sample Tickets**: Spanning various states (`NEW`, `OPEN`, `PENDING`, `RESOLVED`, `CLOSED`), categories (`HARDWARE`, `SOFTWARE`, `NETWORK`, `ACCOUNT`), and priorities.
- **AI Intelligence**: Each ticket is pre-populated with AI summaries, confidence scores, and sentiment analysis for UI visualization.
- **Event Timeline**: Tickets contain sample `TicketActivity` audit logs (e.g., status changes) and `TicketComment` replies simulating agent interaction.

> **Note**: Do NOT use these accounts or passwords in a production environment. 
