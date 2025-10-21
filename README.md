# Trenitalia Train Status Web App

A web application to check train status from Trenitalia using a React frontend and Cloudflare Workers backend.

## Disclaimer

This webapp has been made with the sole purpose of testing agentic coding; most of the code has been written by qwen.
The original idea was to never touch code however (after __rewriting__ the frontend 4 times from scratch) I gave up and started tweaking some things manually.

Given the unreliable architecture of the Trenitalia API, and the unreliable nature of vibe coded apps, I am expecting thing to break as soon as possible.

## Architecture

- **Frontend**: React application with TypeScript
- **Backend**: Cloudflare Worker to proxy requests to Trenitalia API (avoiding CORS issues)

## Setup Instructions

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The application will be available at http://localhost:3000

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Deploy the worker to Cloudflare:
   ```bash
   npx wrangler deploy
   ```

4. Update the `REACT_APP_API_BASE` environment variable with your deployed worker URL.

## Development

To run the backend locally for development, use:

```bash
npx wrangler dev
```

## Features

- Station autocomplete search
- Train search functionality
- Responsive design for all devices
- Black, gray, and white color scheme
- Two dropdowns for departure/arrival stations
- DateTime selector for journey planning

## API Endpoints

- `GET /api/stations/{query}` - Search for stations by name
- `GET /api/station-departures/{stationId}/{timestamp}` - Get train departures for a station on a specific date (timestamp converted to required format)
- `GET /api/station-arrivals/{stationId}/{timestamp}` - Get train arrivals for a station on a specific date (timestamp converted to required format)

