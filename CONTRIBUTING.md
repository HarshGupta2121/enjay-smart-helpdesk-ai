# Contributing to Enjay Smart HelpDesk AI

First off, thank you for considering contributing to Enjay Smart HelpDesk AI! 

## Monorepo Architecture
This project uses npm workspaces. 
- `frontend/`: React 18, Vite, Tailwind CSS, Zustand, React Query.
- `backend/`: Node.js, Express, Prisma, PostgreSQL.

## Development Setup
1. Fork and clone the repository.
2. Install dependencies: `npm install`
3. Set up `.env` files in both `frontend/` and `backend/` using the provided `.env.example` templates.
4. Run database migrations: `npm run db:push --workspace=backend`
5. Start the development server: `npm run dev`

## Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Ensure your code follows the established ESLint and Prettier standards.
3. Write clear, concise commit messages (Conventional Commits preferred).
4. Do not commit `.patch` or `.orig` files.
5. Open a Pull Request against the `main` branch.

## Code of Conduct
By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
