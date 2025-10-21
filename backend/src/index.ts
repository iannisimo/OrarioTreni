export interface Env {
  // Add any environment variables here
}

// CORS configuration
const CORS_ALLOWED_ORIGINS = (typeof process !== 'undefined' && process.env?.ALLOWED_ORIGINS) 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:19006', 
    'https://trenitalia-app.pages.dev',
    'https://*.trenitalia-app.pages.dev'
  ];

// Function to generate proper CORS headers
function getCorsHeaders(origin: string | null): Record<string, string> {
  // If no origin is specified (e.g., curl request), allow all
  if (!origin) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }
  
  // Check if origin is in allowed list
  const isAllowed = CORS_ALLOWED_ORIGINS.some(allowedOrigin => {
    if (allowedOrigin.includes('*')) {
      // Handle wildcard origins (e.g., '*.example.com')
      const regex = new RegExp(allowedOrigin.replace(/\*/g, '.*'));
      return regex.test(origin);
    }
    return origin === allowedOrigin;
  });
  
  if (isAllowed) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
  }
  
  // Origin not in allowed list, return empty headers to block
  return {};
}

// Function to generate the correct Trenitalia API endpoint
// NEVER TOUCH THIS FUNCTION - This format is the correct one for all Trenitalia API calls
// NEVER TOUCH THIS FUNCTION - Format: http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/{command}/{...params}
// NEVER TOUCH THIS FUNCTION - This is the correct API base that must be used for all endpoints
function buildTrenitaliaApiUrl(command: string, ...params: string[]): string {
  // NEVER TOUCH THIS FUNCTION - The base URL is correct as-is
  const baseUrl = "http://www.viaggiatreno.it/infomobilitamobile/resteasy/viaggiatreno";
  // NEVER TOUCH THIS FUNCTION - Parameters are joined with forward slashes
  const paramString = params.join('/');
  // NEVER TOUCH THIS FUNCTION - Return the complete URL
  return `${baseUrl}/${command}/${paramString}`;
}

// Helper function to convert standard timestamp to required format
// Format: e.g. Thu Oct 16 2025 11:39:08 GMT+0200 (Central European Summer Time)
function convertTimestampFormat(timestamp: number): string {
  const date = new Date(timestamp);

  // Get parts using the Rome time zone
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Europe/Rome' });
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'Europe/Rome' });
  const day = date.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'Europe/Rome' });
  const year = date.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'Europe/Rome' });

  // Format time with leading zeros
  const hours = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false, timeZone: 'Europe/Rome' }).padStart(2, '0').slice(0, 2);
  const minutes = date.toLocaleTimeString('en-US', { minute: '2-digit', timeZone: 'Europe/Rome' }).padStart(2, '0');
  const seconds = date.toLocaleTimeString('en-US', { second: '2-digit', timeZone: 'Europe/Rome' }).padStart(2, '0');

  // Determine if it's DST for Italy (CEST) or standard time (CET)
  // Calculate the date in Rome's time zone to check if DST is active
  const isDST = () => {
    const jan = new Date(year, 0, 1);
    const jul = new Date(year, 6, 1);
    // Use Rome timezone offset 
    const janOffset = new Date(jan.toLocaleString("en-US", { timeZone: "Europe/Rome" })).getTimezoneOffset();
    const julOffset = new Date(jul.toLocaleString("en-US", { timeZone: "Europe/Rome" })).getTimezoneOffset();
    const currentOffset = date.getTimezoneOffset();
    return currentOffset < Math.max(janOffset, julOffset);
  };

  const timezone = isDST() ? 'GMT+0200' : 'GMT+0100';
  const timezoneName = isDST() ? 'Central European Summer Time' : 'Central European Standard Time';

  return `${weekday} ${month} ${day} ${year} ${hours}:${minutes}:${seconds} ${timezone} (${timezoneName})`;
}

// Helper function to get station ID from name
async function getStationId(stationName: string): Promise<string | null> {
  try {
    // Call Trenitalia API for station search using the correct API endpoint
    const apiUrl = buildTrenitaliaApiUrl('autocompletaStazione', stationName);
    const trenitaliaResponse = await fetch(
      apiUrl,
      {
        method: 'GET',
        redirect: 'follow', // Follow redirects
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "*/*",  // Accept any content type as the API returns plain text
          "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
          "Referer": "http://www.viaggiatreno.it/"
        }
      }
    );

    if (!trenitaliaResponse.ok) {
      console.warn(`Trenitalia API returned status: ${trenitaliaResponse.status}`);
      return null;
    }

    // The Trenitalia API returns plain text data in format "STATION NAME|ID\nSTATION NAME|ID"
    const plainTextResponse = await trenitaliaResponse.text();

    // If response contains HTML with a redirect, it means the API requires additional handling
    if (plainTextResponse.includes("redirect.html") || plainTextResponse.includes("<!DOCTYPE HTML")) {
      return null;
    }

    // Parse the plain text response to find the station ID
    if (plainTextResponse) {
      const lines = plainTextResponse.trim().split("\n");
      const stations = lines
        .filter(line => line.trim() !== "")
        .map(line => {
          const [name, id] = line.split("|");
          if (name && id) {
            return { name: name.trim(), id: id.trim() };
          }
          return null;
        })
        .filter((station): station is { name: string; id: string } => station !== null);

      // Find the best match
      const exactMatch = stations.find(station =>
        station.name.toLowerCase() === stationName.toLowerCase()
      );

      if (exactMatch) {
        return exactMatch.id;
      }

      // If no exact match, try to find a partial match
      const partialMatch = stations.find(station =>
        station.name.toLowerCase().includes(stationName.toLowerCase()) ||
        stationName.toLowerCase().includes(station.name.toLowerCase())
      );

      return partialMatch ? partialMatch.id : stations[0] ? stations[0].id : null;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting station ID:", error);
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      // Extract origin from request headers
      const origin = request.headers.get('Origin');
      return new Response(null, {
        headers: {
          ...getCorsHeaders(origin),
        },
      });
    }

    // API endpoint: /api/stations/:query
    if (url.pathname.startsWith("/api/stations/")) {
      try {
        const query = url.pathname.split("/")[3];

        // Call Trenitalia API for station search using the correct API endpoint
        const apiUrl = buildTrenitaliaApiUrl('autocompletaStazione', query);
        const trenitaliaResponse = await fetch(
          apiUrl,
          {
            method: 'GET',
            redirect: 'follow', // Follow redirects
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              "Accept": "*/*",  // Accept any content type as the API returns plain text
              "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
              "Referer": "http://www.viaggiatreno.it/"
            }
          }
        );

        if (!trenitaliaResponse.ok) {
          console.warn(`Trenitalia API returned status: ${trenitaliaResponse.status}`);
        }

        // The Trenitalia API should return plain text data in format "STATION NAME|ID\nSTATION NAME|ID"
        // Example: "ROMA TERMINI|S06085\nROMA TIBURTINA|S06084"
        const plainTextResponse = await trenitaliaResponse.text();
        
        // Extract origin from request headers
        const origin = request.headers.get('Origin');
        const corsHeaders = getCorsHeaders(origin);

        // If response contains HTML with a redirect, it means the API requires additional handling
        if (plainTextResponse.includes("redirect.html") || plainTextResponse.includes("<!DOCTYPE HTML")) {
          // Return empty array if redirected to HTML page
          return new Response(JSON.stringify([]), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        }

        // Parse the plain text response into JSON
        if (plainTextResponse) {
          const lines = plainTextResponse.trim().split("\n");
          const stations = lines
            .filter(line => line.trim() !== "")
            .map(line => {
              const [name, id] = line.split("|");
              if (name && id) {
                return { name: name.trim(), id: id.trim() };
              }
              return null;
            })
            .filter((station): station is { name: string; id: string } => station !== null);

          return new Response(JSON.stringify(stations), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        } else {
          // Return empty array if no response
          return new Response(JSON.stringify([]), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
        // Extract origin from request headers
        const origin = request.headers.get('Origin');
        const corsHeaders = getCorsHeaders(origin);
        
        // Return empty array in case of error, not mock data
        return new Response(JSON.stringify([]), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    // API endpoint: /api/train-details/:trainNumber/:departureStationId/:departureDate
    if (url.pathname.startsWith("/api/train-details/")) {
      try {
        const pathParts = url.pathname.split("/");
        if (pathParts.length === 6) { // [, api, train-details, {trainNumber}, {departureStationId}, {departureDate}]
          const trainNumber = pathParts[3];
          const departureStationId = pathParts[4];
          const departureDate = pathParts[5];

          // Call Trenitalia API for train details using the correct API endpoint
          // According to QWEN.md: /infomobilita/resteasy/viaggiatreno/andamentoTreno/{codPartenza}/{codTreno}/{dataPartenza}
          const apiUrl = buildTrenitaliaApiUrl('andamentoTreno', departureStationId, trainNumber, departureDate);
          const trenitaliaResponse = await fetch(
            apiUrl,
            {
              method: 'GET',
              redirect: 'follow', // Follow redirects
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
                "Referer": "http://www.viaggiatreno.it/"
              }
            }
          );

          if (!trenitaliaResponse.ok) {
            console.warn(`Trenitalia API returned status: ${trenitaliaResponse.status}`);
          }

          // Check content type and handle accordingly
          const contentType = trenitaliaResponse.headers.get("content-type");
          let trainDetailsData;
          
          // Extract origin from request headers
          const origin = request.headers.get('Origin');
          const corsHeaders = getCorsHeaders(origin);

          if (contentType && contentType.includes("application/json")) {
            trainDetailsData = await trenitaliaResponse.json();
          } else {
            // If not JSON, try to parse as text and return as appropriate structure
            const textResponse = await trenitaliaResponse.text();
            try {
              trainDetailsData = JSON.parse(textResponse);
            } catch {
              // If it's not valid JSON, return empty object
              trainDetailsData = {};
            }
          }

          return new Response(JSON.stringify(trainDetailsData), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching train details:", error);
        // Extract origin from request headers
        const origin = request.headers.get('Origin');
        const corsHeaders = getCorsHeaders(origin);
        
        // Return empty object in case of error, not mock data
        return new Response(JSON.stringify({}), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    // API endpoint: /api/station-departures/:stationId/:timestamp
    if (url.pathname.startsWith("/api/station-departures/")) {
      try {
        const pathParts = url.pathname.split("/");
        if (pathParts.length === 5) { // [, api, station-departures, {stationId}, {timestamp}]
          const stationId = pathParts[3];
          const timestamp = pathParts[4];

          // Convert standard timestamp to required format
          const standardTimestamp = Number(timestamp);
          if (isNaN(standardTimestamp)) {
            // Extract origin from request headers
            const origin = request.headers.get('Origin');
            const corsHeaders = getCorsHeaders(origin);
            
            return new Response(JSON.stringify({ error: "Invalid timestamp provided" }), {
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
              status: 400,
            });
          }

          const formattedDate = convertTimestampFormat(standardTimestamp);

          // Call Trenitalia API for station departures using the correct API endpoint
          // URL encode the formatted date to handle spaces and special characters
          // const encodedFormattedDate = encodeURIComponent(formattedDate);
          const encodedFormattedDate = formattedDate.replaceAll(" ", "%20");
          const apiUrl = buildTrenitaliaApiUrl('partenze', stationId, encodedFormattedDate);
          const trenitaliaResponse = await fetch(
            apiUrl,
            {
              method: 'GET',
              redirect: 'follow', // Follow redirects
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
                "Referer": "http://www.viaggiatreno.it/"
              }
            }
          );

          if (!trenitaliaResponse.ok) {
            console.warn(`Trenitalia API returned status: ${trenitaliaResponse.status}`);
          }

          // Check content type and handle accordingly
          const contentType = trenitaliaResponse.headers.get("content-type");
          let departuresData;
          
          // Extract origin from request headers (if not already extracted)
          const origin = request.headers.get('Origin');
          const corsHeaders = getCorsHeaders(origin);

          if (contentType && contentType.includes("application/json")) {
            departuresData = await trenitaliaResponse.json();
          } else {
            // If not JSON, try to parse as text and return as appropriate structure
            const textResponse = await trenitaliaResponse.text();
            try {
              departuresData = JSON.parse(textResponse);
            } catch {
              // If it's not valid JSON, return empty array
              departuresData = [];
            }
          }

          return new Response(JSON.stringify(departuresData), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching station departures:", error);
        // Extract origin from request headers
        const origin = request.headers.get('Origin');
        const corsHeaders = getCorsHeaders(origin);
        
        // Return empty array in case of error
        return new Response(JSON.stringify([]), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    // API endpoint: /api/station-arrivals/:stationId/:timestamp
    if (url.pathname.startsWith("/api/station-arrivals/")) {
      try {
        const pathParts = url.pathname.split("/");
        if (pathParts.length === 5) { // [, api, station-arrivals, {stationId}, {timestamp}]
          const stationId = pathParts[3];
          const timestamp = pathParts[4];

          // Convert standard timestamp to required format
          const standardTimestamp = Number(timestamp);
          if (isNaN(standardTimestamp)) {
            // Extract origin from request headers
            const origin = request.headers.get('Origin');
            const corsHeaders = getCorsHeaders(origin);
            
            return new Response(JSON.stringify({ error: "Invalid timestamp provided" }), {
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
              status: 400,
            });
          }

          const formattedDate = convertTimestampFormat(standardTimestamp);

          // Call Trenitalia API for station arrivals using the correct API endpoint
          // URL encode the formatted date to handle spaces and special characters
          const encodedFormattedDate = encodeURIComponent(formattedDate);
          const apiUrl = buildTrenitaliaApiUrl('arrivi', stationId, encodedFormattedDate);
          const trenitaliaResponse = await fetch(
            apiUrl,
            {
              method: 'GET',
              redirect: 'follow', // Follow redirects
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "application/json",
                "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
                "Referer": "http://www.viaggiatreno.it/"
              }
            }
          );

          if (!trenitaliaResponse.ok) {
            console.warn(`Trenitalia API returned status: ${trenitaliaResponse.status}`);
          }

          // Check content type and handle accordingly
          const contentType = trenitaliaResponse.headers.get("content-type");
          let arrivalsData;
          
          // Extract origin from request headers
          const origin = request.headers.get('Origin');
          const corsHeaders = getCorsHeaders(origin);

          if (contentType && contentType.includes("application/json")) {
            arrivalsData = await trenitaliaResponse.json();
          } else {
            // If not JSON, try to parse as text and return as appropriate structure
            const textResponse = await trenitaliaResponse.text();
            try {
              arrivalsData = JSON.parse(textResponse);
            } catch {
              // If it's not valid JSON, return empty array
              arrivalsData = [];
            }
          }

          return new Response(JSON.stringify(arrivalsData), {
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          });
        }
      } catch (error) {
        console.error("Error fetching station arrivals:", error);
        // Extract origin from request headers
        const origin = request.headers.get('Origin');
        const corsHeaders = getCorsHeaders(origin);
        
        // Return empty array in case of error
        return new Response(JSON.stringify([]), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    // Extract origin from request headers for default response
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin);
    
    return new Response("Trenitalia API Proxy", {
      headers: { 
        "Content-Type": "text/plain",
        ...corsHeaders,
      },
    });
  },
};
