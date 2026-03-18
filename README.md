# Mocktest-UI

Vue 3 + Vite + TypeScript dashboard for the mock test platform.

## Location

This frontend now lives beside the backend under:

`MOCKTEST/`
- `MOCKTEST-SERVER/`
- `Mocktest-UI/`

## Features

- Vue Router based navigation
- Pinia stores for auth and dashboard state
- API integration for login, registration, and role creation
- Protected dashboard route with persisted auth session

## Run

```bash
cd Mocktest-UI
npm install
copy .env.example .env
npm run dev
```

## Build

```bash
npm run build
```

## API Base URL

Set `VITE_API_BASE_URL` in `.env`.
Default:

`http://localhost:3000/api/v1`
