# Pollution API

The API uses PostgreSQL and exposes the pollution reports consumed by the Angular app:

- `GET /api/pollutions`
- `GET /api/pollutions/:id`
- `POST /api/pollutions`
- `PUT /api/pollutions/:id`
- `DELETE /api/pollutions/:id`

The older pollution-measurement endpoints remain available under `/api/pollution`.

## Local development

Install dependencies and start a local PostgreSQL database. Copy `.env.example` to `.env`
in `ex01/api`, then set `DATABASE_URL` to that database:

```sh
npm ci --prefix ex01
npm ci --prefix ex01/api
```

From the repository root, run `npm start` to start the API and Angular development server
together. The API listens on port 3000 and Angular on port 4200.

## Render deployment

The root `render.yaml` deploys this API from `ex01/api` and the Angular app from `ex01`.
Render supplies `DATABASE_URL`; the frontend build uses `API_HOST` to generate its
production API URL.
