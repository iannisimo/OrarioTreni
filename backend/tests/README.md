# Trenitalia API Backend Tests

This directory contains shell scripts to test the various endpoints of the Trenitalia API backend.

## Prerequisites

Before running the tests, make sure:
1. You have Node.js and npm installed
2. You have wrangler installed globally: `npm install -g wrangler`
3. The backend server is running: `cd backend && wrangler dev`

## Available Tests

### 1. Station Autocomplete Test (`test_stations.sh`)
Tests the `/api/stations/{query}` endpoint for station autocomplete functionality with various queries.

### 2. Train Details Test (`test_train_details.sh`)
Tests the `/api/train-details/{trainNumber}/{departureStationId}/{departureDate}` endpoint.

### 3. Station Departures Test (`test_station_departures.sh`)
Tests the `/api/station-departures/{stationId}/{timestamp}` endpoint with various station IDs and timestamps.

### 4. Station Arrivals Test (`test_station_arrivals.sh`)
Tests the `/api/station-arrivals/{stationId}/{timestamp}` endpoint with various station IDs and timestamps.

## How to Run Tests

### Run All Tests
```bash
cd trenitalia-web/backend/tests
./run_tests.sh
```

### Run Individual Tests
```bash
cd trenitalia-web/backend/tests
./test_stations.sh
./test_train_details.sh
./test_station_departures.sh
./test_station_arrivals.sh
```

## Notes

- Make sure the backend server is running on `http://localhost:8787` before executing tests
- Some tests may return empty results if the Trenitalia API doesn't have data for the provided parameters
- Valid station IDs typically follow the format 'S' followed by numbers (e.g., 'S06085')
- Timestamps should be in milliseconds since epoch