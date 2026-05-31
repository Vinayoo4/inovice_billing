# Student Finance Mentor (SALTEDHASH)

A client-side Progressive Web App (PWA) designed to teach students the basics of personal finance, budgeting, and loan management. Built by SALTEDHASH.

**Disclaimer:** This tool is strictly for educational purposes and does not constitute financial advice.

## Features

- **PWA Ready:** Installable on desktop and mobile devices. Fully functional offline (all data persists locally).
- **Interactive Budget Simulator:** Template-driven budget planner with dynamic category adjustments and sample expense injection.
- **Loan & EMI Calculator:** Compare standard loan scenarios against a custom-built EMI calculator featuring live amortization charts.
- **Financial Lessons:** Bite-sized lessons covering compound interest, budgeting rules, and emergency funds, complete with end-of-lesson quizzes.
- **Scenario Simulator:** Explore 6-month expense projections across different life scenarios (e.g., Freelancer, Student).
- **Admin Dashboard:** Manage and seed custom loan scenarios, educational lessons, and track student progress.

## Tech Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- HeroUI components
- Recharts (for data visualization)
- Vitest (for testing)
- vite-plugin-pwa

## Commands

- Install dependencies: \`npm install\`
- Start dev server: \`npm run dev\`
- Run tests: \`npm run test\`
- Build app: \`npm run build\`

## Routes

- \`/\` : Dashboard (Progress overview, quick links)
- \`/budget\` : Budget Planner & Simulator
- \`/loans\` : EMI Calculator & Scenario comparison
- \`/simulate\` : 6-Month Life Phase Simulator
- \`/lessons\` : Educational materials and quizzes
- \`/admin\` : Admin panel for data management
- \`/login\` : Authentication page
- \`/register\` : Account creation

## Demo Credentials

All data is stored purely in the browser's localStorage. No external backend is required.

- **Admin Account:** \`admin@sfm.com\` / \`admin123\`
- **Student Account:** \`student@sfm.com\` / \`student123\`

To reset all local data, log in as an Admin, navigate to the **Settings** tab, and perform a Factory Reset.
