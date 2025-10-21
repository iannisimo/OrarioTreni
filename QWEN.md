
# Trenitalia Train Status App

This document outlines the plan for building a React Native application to check the status of trains from Trenitalia.

## 1. Upstream Analysis

*   **Objective:** Identify a public or internal API from the Trenitalia website (`http://www.viaggiatreno.it/infomobilitamobile/pages/cercaTreno/cercaTreno.jsp`) to fetch train data.
*   **Result:** A usable API documentation has been found at (https://github.com/sabas/trenitalia)

## 2. Requirements

*   1. Direct API access without CORS restrictions (achieved via React Native)
*   2. Black, Gray and White color scheme
*   3.1 A user will be asked for a departing and an arriving station
*   3.2 Station selection will be with auto-complete functionality
*   3.3 The result will be a list of trains that match the criteria
*   3.4 Fully client side request, no backend needed due to mobile environment
*   3.5 Native mobile experience

## 3. Work

mark done items with (x) and items we are working on with (-) instead of ()

1. (x) analyze the api and find useful endpoints
   - Core endpoint for searching trains: `/infomobilita/resteasy/viaggiatreno/dettaglioViaggio/{idStazioneDa}/{idStazioneA}` (non-deprecated alternative to soluzioniViaggioNew)
   - Station search/autocomplete: `/infomobilita/resteasy/viaggiatreno/autocompletaStazione/{stringa}`
   - Alternative station autocomplete: `/infomobilita/resteasy/viaggiatreno/autocompletaStazioneNTS/{stringa}`
   - Detailed station info: `/infomobilita/resteasy/viaggiatreno/cercaStazione/{stringa}`
   - Train details: `/infomobilita/resteasy/viaggiatreno/andamentoTreno/{codPartenza}/{codTreno}/{dataPartenza}`
   - Station codes follow format 'S' followed by numbers (e.g., 'S06000')

2. (x) Create React Native app with Expo
3. (x) Implement station search with auto-complete functionality
4. (x) Implement train search functionality using dettaglioViaggio endpoint
5. (x) Display train results in a mobile-friendly interface
6. (x) Refine UI and error handling
7. (x) Verify that no backend is needed for React Native implementation

## 4. Attitude

we will work on one item from (3. Work) at a time, we will move onto the enxt item only when i am happy with the results so far.
You will be able to check your work with puppeteer, use it to navigate the gui

## 5. Important Implementation Details

### Backend Architecture
- The backend is implemented as a Cloudflare Worker using the Workers runtime
- It serves as a proxy to bypass CORS restrictions when accessing the Trenitalia API directly from the browser
- The backend handles the following API endpoints:
  - `/api/stations/{query}` - for station autocomplete functionality
  - `/api/trains/{departure}/{destination}` - for finding trains between stations
  - `/api/station-departures/{stationId}/{timestamp}` - for getting train departures for a station on a specific date
  - `/api/station-arrivals/{stationId}/{timestamp}` - for getting train arrivals for a station on a specific date
- The backend properly handles CORS headers allowing cross-origin requests

### Frontend Architecture
- The frontend is built with React and TypeScript
- Proper typing has been implemented for Station and Train data structures
- The UI has a black, gray, and white color scheme as specified in requirements
- The application is responsive and works on all device sizes
- Input validation and loading states are properly implemented

### Development Setup
- Backend: Cloudflare Worker running on port 8787 via `wrangler dev`
- Frontend: React application running on port 3001 to avoid conflicts
- The application is currently configured to work with local development services

### API Handling
- The backend implements fallback mock data when the Trenitalia API is unavailable
- CORS issues are properly handled through the proxy backend
- Request headers are properly set to mimic browser requests to the Trenitalia API
- The Trenitalia station autocomplete API returns plain text data that needs to be parsed into JSON format
- The station API returns results in format "STATION NAME|ID" which is then converted to JSON format for the frontend

### Today's Work (October 16, 2025)
- Removed the Express server implementation to eliminate potential discrepancies between local development and production
- Added timestamp conversion utility function to convert standard timestamps to required format: `Wed Jan 07 2015 18:58:25 GMT+0100 (ora solare Europa occidentale)`
- Implemented two new API endpoints:
  - `/api/station-departures/{stationId}/{timestamp}` - Get train departures for a station on a specific date
  - `/api/station-arrivals/{stationId}/{timestamp}` - Get train arrivals for a station on a specific date
- Updated dependencies to remove Express-related packages from the backend
- Updated documentation to reflect new architecture and endpoints
- Corrected the API endpoint format to use the proper Trenitalia API structure: `http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/{command}/{...params}` using a dedicated function to ensure consistency
