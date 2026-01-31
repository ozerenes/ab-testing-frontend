# A/B Testing Platform – Frontend

Vue 3 + TypeScript + Vite frontend for the A/B testing platform. Connects to the backend API for experiments, assignments, events, and metrics.

## Architecture

- **Views:** Page-level components (ExperimentList, ExperimentDetail, ExperimentCreate) handle layout and user flows.
- **Components:** Reusable UI (ExperimentForm, etc.) used across views.
- **Composables:** Shared state and data loading (`useExperiments`, `useExperimentDetail`, `useExperimentMetrics`) so views stay thin and logic is reusable.
- **API layer:** Axios-based client with typed endpoints for experiments, assignments, and events; responses normalized to `data` where the backend wraps in `{ data }`.
- **Router:** Vue Router with meta titles; list → detail → create flows.

## Structure

```
src/
├── api/           # API client and endpoints (experiments, assignments, events)
├── composables/   # useExperiments, useExperimentDetail, useExperimentMetrics
├── components/    # Reusable UI (ExperimentForm, etc.)
├── views/        # Page-level views (ExperimentList, ExperimentDetail, ExperimentCreate)
├── router/       # Route definitions
├── App.vue
├── main.ts
└── style.css     # Global styles
```

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if needed (default http://localhost:3000/api)
npm run dev
```

- **Dev:** `npm run dev` (Vite, typically http://localhost:5173)
- **Build:** `npm run build`
- **Preview:** `npm run preview`

## Main features

- **Experiment list:** List experiments with status, description, variant count; click card to open detail.
- **Experiment detail:** Single experiment with variants, metrics (views, clicks, conversions), conversion rate bar chart, user assignment simulation, and event triggers (view, click, conversion).
- **User assignment simulation:** Generate random userId and assign variant (deterministic: same user → same variant).
- **Event triggers:** Choose variant and optional userId, then send view, click, or conversion events; metrics refresh after each event.
- **Conversion visualization:** Simple bar chart of conversion rate per variant (0–100% scale).

## Components

| Component        | Role |
|-----------------|-----|
| `ExperimentList` | Lists experiments; navigates to detail or create. |
| `ExperimentDetail` | Shows experiment info, variants, metrics, assignment simulation, event triggers, conversion chart. |
| `ExperimentCreate` | Create form (uses ExperimentForm). |
| `ExperimentForm`  | Shared form for experiment create/edit (name, description, variants). |

## Composables

| Composable            | Role |
|-----------------------|-----|
| `useExperiments()`    | List state: `experiments`, `loading`, `error`, `fetchExperiments`, `retry`. |
| `useExperimentDetail(experimentId)` | Detail state: `experiment`, `stats`, `loading`, `error`, `fetchExperiment`. Accepts `Ref<string>` or getter. |
| `useExperimentMetrics(experimentId)` | Metrics only: `stats`, `loading`, `error`, `fetchStats`. For optional metrics-only refresh. |

## Routes

| Path                  | View            | Description |
|-----------------------|-----------------|-------------|
| `/`                   | ExperimentList | List experiments. |
| `/experiments/:id`    | ExperimentDetail| Experiment detail, variants, metrics, simulation. |
| `/experiments/create`| ExperimentCreate| Create experiment. |

## Future improvements

- **Persistence:** Store current “simulated” userId in session/localStorage so assignment and events stay consistent across detail page visits.
- **Real-time or polling:** Optionally poll or use WebSockets for metrics when multiple users trigger events.
- **Charts:** Use a chart library (e.g. Chart.js, ECharts) for richer visualizations and time-series.
- **Filters and search:** Filter experiments by status, date, or name on the list page.
- **Edit experiment:** Edit experiment and variants from the detail page.
- **Tests:** Unit tests for composables and API layer; E2E for critical flows (list → detail → assign → track event).
- **Error boundaries:** Global or route-level error handling and retry UI.
- **Accessibility:** ARIA labels, focus management, and keyboard navigation for forms and interactive sections.

## Requirements

- Node.js >= 18
- Backend API running (e.g. `http://localhost:3000` with CORS allowed for the frontend origin)
