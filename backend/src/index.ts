import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

// Define the environment variable interface
interface Env {
  ALLOWED_ORIGINS: string;
}

// Get allowed origins from environment variables
const CORS_ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

// Initialize Express app
const app = express();

// Use the CORS middleware with custom options
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // If no origin is specified (e.g., curl request), allow all
    if (!origin || CORS_ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
      return;
    }

    // Check if origin is in allowed list
    const isAllowed = CORS_ALLOWED_ORIGINS.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard origins (e.g., '*.example.com')
        const regex = new RegExp(allowedOrigin.replace(/\*/g, '.*'));
        return regex.test(origin!);
      }
      return origin === allowedOrigin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Middleware to parse JSON
app.use(express.json());

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
    const jan = new Date(parseInt(year), 0, 1);
    const jul = new Date(parseInt(year), 6, 1);
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
    
    const trenitaliaResponse = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "*/*",  // Accept any content type as the API returns plain text
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
        "Referer": "http://www.viaggiatreno.it/"
      }
    });

    // The Trenitalia API returns plain text data in format "STATION NAME|ID\nSTATION NAME|ID"
    const plainTextResponse = trenitaliaResponse.data as string;

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

// API endpoint: /api/stations/:query
app.get('/api/stations/:query', async (req: Request, res: Response) => {
  try {
    const query = req.params.query;

    // Call Trenitalia API for station search using the correct API endpoint
    const apiUrl = buildTrenitaliaApiUrl('autocompletaStazione', query);
    
    const trenitaliaResponse = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "*/*",  // Accept any content type as the API returns plain text
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
        "Referer": "http://www.viaggiatreno.it/"
      }
    });

    // The Trenitalia API should return plain text data in format "STATION NAME|ID\nSTATION NAME|ID"
    // Example: "ROMA TERMINI|S06085\nROMA TIBURTINA|S06084"
    const plainTextResponse = trenitaliaResponse.data as string;

    // If response contains HTML with a redirect, it means the API requires additional handling
    if (plainTextResponse.includes("redirect.html") || plainTextResponse.includes("<!DOCTYPE HTML")) {
      // Return empty array if redirected to HTML page
      return res.json([]);
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

      return res.json(stations);
    } else {
      // Return empty array if no response
      return res.json([]);
    }
  } catch (error) {
    console.error("Error fetching stations:", error);
    // Return empty array in case of error, not mock data
    return res.json([]);
  }
});

// API endpoint: /api/train-details/:trainNumber/:departureStationId/:departureDate
app.get('/api/train-details/:trainNumber/:departureStationId/:departureDate', async (req: Request, res: Response) => {
  try {
    const { trainNumber, departureStationId, departureDate } = req.params;

    // Call Trenitalia API for train details using the correct API endpoint
    // According to QWEN.md: /infomobilita/resteasy/viaggiatreno/andamentoTreno/{codPartenza}/{codTreno}/{dataPartenza}
    const apiUrl = buildTrenitaliaApiUrl('andamentoTreno', departureStationId, trainNumber, departureDate);
    
    const trenitaliaResponse = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
        "Referer": "http://www.viaggiatreno.it/"
      }
    });

    // Parse response based on content type
    let trainDetailsData;
    if (trenitaliaResponse.headers['content-type']?.includes('application/json')) {
      trainDetailsData = trenitaliaResponse.data;
    } else {
      // If not JSON, try to parse as text and return as appropriate structure
      try {
        trainDetailsData = JSON.parse(trenitaliaResponse.data);
      } catch {
        // If it's not valid JSON, return empty object
        trainDetailsData = {};
      }
    }

    return res.json(trainDetailsData);
  } catch (error) {
    console.error("Error fetching train details:", error);
    // Return empty object in case of error, not mock data
    return res.json({});
  }
});

// API endpoint: /api/station-departures/:stationId/:timestamp
app.get('/api/station-departures/:stationId/:timestamp', async (req: Request, res: Response) => {
  try {
    const { stationId, timestamp } = req.params;

    // Convert standard timestamp to required format
    const standardTimestamp = Number(timestamp);
    if (isNaN(standardTimestamp)) {
      return res.status(400).json({ error: "Invalid timestamp provided" });
    }

    const formattedDate = convertTimestampFormat(standardTimestamp);

    // Call Trenitalia API for station departures using the correct API endpoint
    // URL encode the formatted date to handle spaces and special characters
    const encodedFormattedDate = encodeURIComponent(formattedDate);
    const apiUrl = buildTrenitaliaApiUrl('partenze', stationId, encodedFormattedDate);
    
    const trenitaliaResponse = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
        "Referer": "http://www.viaggiatreno.it/"
      }
    });

    // Parse response based on content type
    let departuresData;
    if (trenitaliaResponse.headers['content-type']?.includes('application/json')) {
      departuresData = trenitaliaResponse.data;
    } else {
      // If not JSON, try to parse as text and return as appropriate structure
      try {
        departuresData = JSON.parse(trenitaliaResponse.data);
      } catch {
        // If it's not valid JSON, return empty array
        departuresData = [];
      }
    }

    return res.json(departuresData);
  } catch (error) {
    console.error("Error fetching station departures:", error);
    // Return empty array in case of error
    return res.json([]);
  }
});

// API endpoint: /api/station-arrivals/:stationId/:timestamp
app.get('/api/station-arrivals/:stationId/:timestamp', async (req: Request, res: Response) => {
  try {
    const { stationId, timestamp } = req.params;

    // Convert standard timestamp to required format
    const standardTimestamp = Number(timestamp);
    if (isNaN(standardTimestamp)) {
      return res.status(400).json({ error: "Invalid timestamp provided" });
    }

    const formattedDate = convertTimestampFormat(standardTimestamp);

    // Call Trenitalia API for station arrivals using the correct API endpoint
    // URL encode the formatted date to handle spaces and special characters
    const encodedFormattedDate = encodeURIComponent(formattedDate);
    const apiUrl = buildTrenitaliaApiUrl('arrivi', stationId, encodedFormattedDate);
    
    const trenitaliaResponse = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
        "Referer": "http://www.viaggiatreno.it/"
      }
    });

    // Parse response based on content type
    let arrivalsData;
    if (trenitaliaResponse.headers['content-type']?.includes('application/json')) {
      arrivalsData = trenitaliaResponse.data;
    } else {
      // If not JSON, try to parse as text and return as appropriate structure
      try {
        arrivalsData = JSON.parse(trenitaliaResponse.data);
      } catch {
        // If it's not valid JSON, return empty array
        arrivalsData = [];
      }
    }

    return res.json(arrivalsData);
  } catch (error) {
    console.error("Error fetching station arrivals:", error);
    // Return empty array in case of error
    return res.json([]);
  }
});

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send("Trenitalia API Proxy");
});

// Get port from environment variable or default to 8787
const PORT = process.env.PORT || 8787;

app.listen(PORT, () => {
  console.log(`Trenitalia API Proxy server running on port ${PORT}`);
});

export default app;