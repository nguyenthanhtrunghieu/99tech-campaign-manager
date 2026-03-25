📧 Campaign Manager - Fullstack Monorepo
A modern email marketing campaign management system built with a robust Monorepo architecture, integrated with an AI-assisted development workflow (Claude Code and Antigravity).

🚀 Quick Start (Local Setup)
This project is fully containerized. Ensure you have Docker and Docker Compose installed.

Start the system:

docker-compose up --build
Access the application:

Frontend: http://localhost:3000

Backend API: http://localhost:3001

Seed Data:
To populate the dashboard with demo campaigns immediately, run this command in a new terminal:

docker exec -it campaign-manager-api yarn workspace @99tech/api db:seed

🛠 Tech Stack & Architecture
Monorepo: Managed via Yarn Workspaces for seamless code sharing.

Frontend: Next.js 14 (App Router), Tailwind CSS, Lucide Icons.

Backend: Node.js, Express, Sequelize ORM.

Database: PostgreSQL 15.

Shared Logic: @99tech/shared package for consistent types and constants across the stack.

Pattern: Follows a 3-Layer Architecture (Directives, Orchestration, Execution) to ensure high separation of concerns and maintainability.

✨ Quality Highlights
Backend Correctness: Enforced business rules for campaign scheduling and status transitions (Draft -> Scheduled -> Sent).

API Design: RESTful conventions with standardized error codes and response shapes.

Frontend Polish: * Skeleton Loaders: Smooth perceived performance during data fetching.

Status Badges: Color-coded status tracking (Draft: Grey, Scheduled: Blue, Sent: Green).

UX Flow: Comprehensive error/loading states and intuitive navigation.
🤖 AI Collaboration Workflow (Multi-Agent Strategy)
This project was developed using a sophisticated Human-in-the-loop approach, orchestrating three different AI agents to ensure architectural integrity and rapid execution.

- The Planning Phase (Brainstorming)
Agent: Claude

Role: Architectural Consultant.

Process: I started by providing the project requirements to Claude to brainstorm construction methods. While Claude suggested various patterns, I remained the final decision-maker. I specifically enforced a 3-Layer Architecture (Directives, Orchestration, Execution) and established the implementation plan.

- The Building Phase (Execution)
Agent: Antigravity (AG)

Role: The Builder.

Process: Once the blueprint was finalized, I tasked AG with generating the boilerplate code, setting up the Monorepo structure, and implementing the base API services according to my architectural directives.(Step-by-step)

- The Auditing Phase (Terminal-based)
Agent: Claude Code

Role: The Auditor & Fixer.

Process: I implemented a strict "Step-by-Step Audit" workflow using Claude Code in the terminal. I did not move to the next development phase until Claude Code performed a full audit and returned an "All PASS" status. This ensured that every infrastructure bug (Docker/Networking) and logic error was resolved immediately before adding more complexity.

🛠 Detailed AI Insights & Transparency
1. Tasks Delegated to AI Agent
I delegated specific tasks to different AI Agents based on their specialized skills to ensure maximum efficiency and optimize token usage(the specific job mentioned above).

Throughout each development phase, I orchestrated a multi-agent workflow where each task—from architectural brainstorming to code generation and auditing—was assigned to the most suitable agent, ensuring a high-quality output while avoiding resource waste

2. Real Prompts Used (Selected from Audit Logs)
Prompt 1 (Started prompt for AG to make step 1.1): 

Role: "You are a Senior Fullstack Engineer (The Builder). Your task is to implement the Campaign Manager system using a Monorepo structure with Yarn Workspaces."

Architectural Directives (The 3-Layer Pattern):
"You must strictly follow the 3-Layer Architecture for both Backend and Frontend:

Directives Layer: Define Types, Interfaces, and Constants (Shared package).

Orchestration Layer: Business Logic, Services, and API Routes.

Execution Layer: Database Migrations (Sequelize), Repository Pattern, and UI Components (Next.js/Tailwind).

Initial Task (Scaffolding):

Initialize a Monorepo with two apps: web (Next.js 14) and api (Express).

Create a shared package for common TypeScript types.

Setup Dockerfile for each workspace and a root docker-compose.yml that includes a PostgreSQL service.

Constraint: Use PostgreSQL, Sequelize, and TypeScript for the backend. Use Tailwind CSS for the frontend.

Workflow Rule:

After each sub-task completion, I will trigger Claude Code to audit your output. Do not proceed to the next feature until Claude returns an 'All PASS' status."

Prompt 2 (Database & Schema Audit)"Claude, perform a Step-by-Step Audit on the Database layer.

Criteria:

- Verify all primary keys use UUIDs.

- Ensure all fields follow snake_case naming conventions.

- Check for composite indexes on (campaign_id, status) to optimize dashboard queries.

- Return an 'All PASS' only if the Sequelize models perfectly match these criteria."

Prompt 3 (Type Safety & Validation Audit): "Audit the Communication Layer between API and Shared package.

Criteria:

-Verify Zod schemas correctly validate future dates for scheduled campaigns.

-Ensure the API uses these schemas for all Request Body validation.

-Check if TypeScript interfaces in @99tech/shared are strictly implemented in both Web and API.

- Do not proceed until all validation logic is bulletproof."

3. Where AI Agent was Wrong or Needed Correction

A key takeaway is that AI precision is directly proportional to prompt specificity. Vague instructions often lead to suboptimal or incorrect outputs. However, even with detailed prompts, human oversight remains essential to correct "AI hallucinations" or logical missteps.

For example: During the system planning and design phase, Claude proposed an overengineered project structure that was unnecessarily complex for a mini-webapp, requiring me to manually intervene and streamline it.

In Docker packaging, Claude attempted a multi-stage build that broke Yarn Workspace symlinks and incorrectly used localhost for service connections, requiring me to manually fix the networking logic and enforce a reliable single-stage build.

4. What I would NOT let AI Agent do — and why

Architectural Blueprinting: I did not allow the AI to define the system's core layers. AI tends to favor generic, flat structures or overskill architecture. I used the 3-Layer Architecture to ensure the project remains scalable and maintainable for a real-world production environment.

Final UX Validation: I personally audited every navigation flow. AI can write "working" code quickly that is logically flawed from a user journey perspective. Human intuition is still superior for final quality assurance.

Finally, while AI can significantly augment a developer's productivity across various stages, the Architect—the one who makes the final, critical decisions—must always be the human user. Throughout this project, I acted as the 'Chief Orchestrator,' ensuring that every line of code and every architectural choice aligned with long-term scalability and real-world logic, which AI alone cannot yet fully grasp.