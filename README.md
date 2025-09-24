# Crypto Trading Dashboard

This is an interactive web application for monitoring and analyzing cryptocurrency prices.

## how to run

see `package.json`:

- install dependencies before: `npm install`
- run locally in dev mode`npm run dev`
- re-creates docker volume and start docker-compose: `npm run docker:restart`
- run tests: `npm run test`

config see `.env` file.

## technologies

This project is built with the following stack:

- **Language**: TypeScript
- **Frontend Framework**: Next.js (React + SSR/SSG)
- **Backend / API**: Next.js API routes (serverless functions)
- **UI & Styling**: Tailwind CSS
- **Charts**: Recharts for interactive data visualization
- **State Management**: Redux with React-Redux
- **Testing**:
  - Jest for integration/e2e tests
  - Cypress for component/ui testing
- **Build**: via Next.js, Docker + docker-compose

Features:

- **Data Handling**: Precise crypto calculations with Big.js
- **Effective Input Handling**: Efficient user input updates (e.g., onBlur)
- **Incremental Processing**: Account balance, net holdings, profit and loss updates without full recalculation.
- **Responsive Design**: Mobile-friendly layouts with Tailwind CSS grids and flex
- **Data Caching**: API data caching, providing default chart data if apki key missing
- **Component Architecture**: Modular, reusable React components for charts and tooltips
- **Error Handling & Logging**: Robust client/server error management
- **Dockerized**: Ready-to-run Docker setup for development and production
- **Testing & Quality Assurance**: UI behaviour and Client Server interaction asserted in tests
