// API utility functions for Trenitalia backend

// Define TypeScript types for API responses
export interface Station {
  id: string;
  name: string;
  code: string;
}

export interface StationAutocompleteResponse {
  id: string;
  name: string;
}

export interface TrainDepartureArrivalResponse {
  arrivato: boolean | null;
  binarioEffettivoArrivoCodice: string | null;
  binarioEffettivoArrivoDescrizione: string | null;
  binarioEffettivoArrivoTipo: string | null;
  binarioEffettivoPartenzaCodice: string | null;
  binarioEffettivoPartenzaDescrizione: string | null;
  binarioEffettivoPartenzaTipo: string | null;
  binarioProgrammatoArrivoCodice: string | null;
  binarioProgrammatoArrivoDescrizione: string | null;
  binarioProgrammatoPartenzaCodice: string | null;
  binarioProgrammatoPartenzaDescrizione: string | null;
  categoria: string | null;
  categoriaDescrizione: string | null;
  circolante: boolean | null;
  codDestinazione: string | null;
  codOrigine: string | null;
  codiceCliente: number | null;
  compClassRitardoLine: string | null;
  compClassRitardoTxt: string | null;
  compDurata: string | null;
  compImgCambiNumerazione: string | null;
  compImgRitardo: string | null;
  compImgRitardo2: string | null;
  compInStazioneArrivo: string[] | null;
  compInStazionePartenza: string[] | null;
  compNumeroTreno: string | null;
  compOrarioArrivo: string | null;
  compOrarioArrivoZero: string | null;
  compOrarioArrivoZeroEffettivo: string | null;
  compOrarioEffettivoArrivo: string | null;
  compOrarioPartenza: string | null;
  compOrarioPartenzaZero: string | null;
  compOrarioPartenzaZeroEffettivo: string | null;
  compOrientamento: string[] | null;
  compRitardo: string[] | null;
  compRitardoAndamento: string[] | null;
  compTipologiaTreno: string | null;
  corrispondenze: any[] | null;
  dataPartenzaTreno: number | null;
  dataPartenzaTrenoAsDate: string | null;
  destinazione: string | null;
  destinazioneEstera: string | null;
  destinazioneZero: string | null;
  esisteCorsaZero: string | null;
  haCambiNumero: boolean | null;
  iconTreno: string | null;
  inStazione: boolean | null;
  materiale_label: string | null;
  millisDataPartenza: string | null;
  nonPartito: boolean | null;
  numeroTreno: number | null;
  oraArrivoEstera: string | null;
  oraPartenzaEstera: string | null;
  orarioArrivo: number | null;
  orarioArrivoZero: number | null;
  orarioPartenza: number | null;
  orarioPartenzaZero: number | null;
  orientamento: string | null;
  origine: string | null;
  origineEstera: string | null;
  origineZero: string | null;
  partenzaTreno: number | null;
  provvedimento: number | null;
  regione: number | null;
  riprogrammazione: string | null;
  ritardo: number | null;
  servizi: any[] | null;
  statoTreno: string | null;
  stazioneArrivo: string | null;
  stazionePartenza: string | null;
  subTitle: string | null;
  tipoProdotto: string | null;
  tratta: number | null;
  ultimoRilev: number | null;
}

export interface TrainStopDetails {
  orientamento: string | null;
  kcNumTreno: string | null;
  stazione: string | null; // Station name
  codLocOrig: string | null;
  id: string | null; // Station ID
  listaCorrispondenze: any[] | null;
  programmata: number | null; // Scheduled time
  programmataZero: number | null;
  effettiva: number | null; // Actual time
  ritardo: number | null; // Delay in minutes
  partenzaTeoricaZero: number | null;
  arrivoTeoricoZero: number | null;
  partenza_teorica: number | null; // Theoretical departure time
  arrivo_teorico: number | null; // Theoretical arrival time
  isNextChanged: boolean | null;
  partenzaReale: number | null; // Real departure time
  arrivoReale: number | null; // Real arrival time
  ritardoPartenza: number | null;
  ritardoArrivo: number | null;
  progressivo: number | null; // Station sequence number
  binarioEffettivoArrivoCodice: string | null;
  binarioEffettivoArrivoTipo: string | null;
  binarioEffettivoArrivoDescrizione: string | null;
  binarioProgrammatoArrivoCodice: string | null;
  binarioProgrammatoArrivoDescrizione: string | null;
  binarioEffettivoPartenzaCodice: string | null;
  binarioEffettivoPartenzaTipo: string | null;
  binarioEffettivoPartenzaDescrizione: string | null;
  binarioProgrammatoPartenzaCodice: string | null;
  binarioProgrammatoPartenzaDescrizione: string | null;
  tipoFermata: string | null; // 'P' for departure, 'F' for intermediate stop, 'A' for arrival
  visualizzaPrevista: boolean | null;
  nextChanged: boolean | null;
  nextTrattaType: number | null;
  actualFermataType: number | null;
  materiale_label: string | null;
}

export interface TrainDetailsResponse {
  tipoTreno: string | null;
  orientamento: string | null;
  codiceCliente: number | null;
  fermateSoppresse: any[] | null;
  dataPartenza: string | null;
  fermate: TrainStopDetails[] | null; // Array of stops with arrival/departure information
  anormalita: any[] | null;
  provvedimenti: any[] | null;
  segnalazioni: any[] | null;
  oraUltimoRilevamento: number | null;
  stazioneUltimoRilevamento: string | null;
  idDestinazione: string | null;
  idOrigine: string | null;
  cambiNumero: any[] | null;
  hasProvvedimenti: boolean | null;
  descOrientamento: string[] | null;
  compOraUltimoRilevamento: string | null;
  motivoRitardoPrevalente: string | null;
  descrizioneVCO: string | null;
  materiale_label: string | null;
  arrivato: boolean | null;
  dataPartenzaTrenoAsDate: string | null;
  dataPartenzaTreno: number | null;
  partenzaTreno: number | null;
  millisDataPartenza: string | null;
  numeroTreno: number | string | null;
  categoria: string | null;
  categoriaDescrizione: string | null;
  origine: string | null;
  codOrigine: string | null;
  destinazione: string | null;
  codDestinazione: string | null;
  origineEstera: string | null;
  destinazioneEstera: string | null;
  oraPartenzaEstera: string | null;
  oraArrivoEstera: string | null;
  tratta: number | null;
  regione: number | null;
  origineZero: string | null;
  destinazioneZero: string | null;
  orarioPartenzaZero: number | null;
  orarioArrivoZero: number | null;
  circolante: boolean | null;
  binarioEffettivoArrivoCodice: string | null;
  binarioEffettivoArrivoDescrizione: string | null;
  binarioEffettivoArrivoTipo: string | null;
  binarioProgrammatoArrivoCodice: string | null;
  binarioProgrammatoArrivoDescrizione: string | null;
  binarioEffettivoPartenzaCodice: string | null;
  binarioEffettivoPartenzaDescrizione: string | null;
  binarioEffettivoPartenzaTipo: string | null;
  binarioProgrammatoPartenzaCodice: string | null;
  binarioProgrammatoPartenzaDescrizione: string | null;
  subTitle: string | null;
  esisteCorsaZero: string | null;
  inStazione: boolean | null;
  haCambiNumero: boolean | null;
  nonPartito: boolean | null;
  provvedimento: number | null;
  riprogrammazione: string | null;
  orarioPartenza: number | null;
  orarioArrivo: number | null;
  stazionePartenza: string | null;
  stazioneArrivo: string | null;
  statoTreno: string | null;
  corrispondenze: any[] | null;
  servizi: any[] | null;
  ritardo: number | null;
  tipoProdotto: string | null;
  compOrarioPartenzaZeroEffettivo: string | null;
  compOrarioArrivoZeroEffettivo: string | null;
  compOrarioPartenzaZero: string | null;
  compOrarioArrivoZero: string | null;
  compOrarioArrivo: string | null;
  compOrarioPartenza: string | null;
  compNumeroTreno: string | null;
  compOrientamento: string[] | null;
  compTipologiaTreno: string | null;
  compClassRitardoTxt: string | null;
  compClassRitardoLine: string | null;
  compImgRitardo2: string | null;
  compImgRitardo: string | null;
  compRitardo: string[] | null;
  compRitardoAndamento: string[] | null;
  compInStazionePartenza: string[] | null;
  compInStazioneArrivo: string[] | null;
  compOrarioEffettivoArrivo: string | null;
  compDurata: string | null;
  compImgCambiNumerazione: string | null;
  ultimoRilev: number | null;
  iconTreno: string | null;
}

// Base API configuration
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8787';

/**
 * Fetches station autocomplete suggestions
 * @param query - The search query for station names
 * @returns Promise resolving to an array of station suggestions
 */
export async function fetchStations(query: string): Promise<StationAutocompleteResponse[]> {
  try {
    const response = await fetch(`${API_BASE}/api/stations/${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Check the content type to determine how to parse the response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // If it's JSON, parse it as JSON
      const jsonData = await response.json();
      // If jsonData is an array, return it directly
      if (Array.isArray(jsonData)) {
        return jsonData;
      }
      // If it's an object with stations property, return that
      if (jsonData.stations && Array.isArray(jsonData.stations)) {
        return jsonData.stations;
      }
      // If it's an object with results property, return that
      if (jsonData.results && Array.isArray(jsonData.results)) {
        return jsonData.results;
      }
      // Otherwise return empty array
      return [];
    } else {
      // Handle plain text response from the Trenitalia API
      // Format: "STATION NAME|ID" per line
      const text = await response.text();
      const lines = text.trim().split('\n');
      return lines
        .filter((line) => line.trim() !== '')
        .map((line) => {
          const [name, id] = line.split('|').map((part) => part.trim());
          return { id, name };
        });
    }
  } catch (error) {
    console.error('Error fetching stations:', error);
    // Return mock data in case of error
    return [
      { id: 'S06000', name: 'Milano Centrale' },
      { id: 'S07000', name: 'Roma Termini' },
      { id: 'S05000', name: 'Firenze Santa Maria Novella' },
    ];
  }
}

/**
 * Fetches train departures for a specific station
 * @param stationId - ID of the station
 * @param timestamp - Date and time for the departure search (in milliseconds)
 * @returns Promise resolving to train departure information
 */
export async function fetchStationDepartures(stationId: string, timestamp: number): Promise<TrainDepartureArrivalResponse[]> {
  try {
    const response = await fetch(`${API_BASE}/api/station-departures/${stationId}/${timestamp}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching station departures:', error);
    return [];
  }
}

/**
 * Fetches train arrivals for a specific station
 * @param stationId - ID of the station
 * @param timestamp - Date and time for the arrival search (in milliseconds)
 * @returns Promise resolving to train arrival information
 */
export async function fetchStationArrivals(stationId: string, timestamp: number): Promise<TrainDepartureArrivalResponse[]> {
  try {
    const response = await fetch(`${API_BASE}/api/station-arrivals/${stationId}/${timestamp}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching station arrivals:', error);
    return [];
  }
}

/**
 * Fetches detailed information for a specific train
 * @param trainNumber - The train number
 * @param departureStationId - ID of the departure station
 * @param departureDate - The departure date (timestamp in milliseconds)
 * @returns Promise resolving to detailed train information
 */
export async function fetchTrainDetails(
  trainNumber: string,
  departureStationId: string,
  departureDate: number,
): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE}/api/train-details/${trainNumber}/${departureStationId}/${departureDate}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching train details:', error);
    // Return mock data in case of error
    return {
      // Mock data structure similar to what the real API would return
      numeroTreno: trainNumber,
      origine: 'Origin Station',
      destinazione: 'Destination Station',
      orarioPartenza: departureDate,
      orarioArrivo: departureDate + 7200000, // 2 hours later
      statoTreno: 'In Transit',
      ritardo: 0,
      fermate: [
        {
          stazione: 'Origin Station',
          programma: { orario: departureDate, binario: '1' },
          effettivo: { orario: departureDate, binario: '1' },
          tipo: 'P'
        },
        {
          stazione: 'Intermediate Station',
          programma: { orario: departureDate + 3600000, binario: '2' },
          effettivo: { orario: departureDate + 3600000, binario: '2' },
          tipo: 'P'
        },
        {
          stazione: 'Destination Station',
          programma: { orario: departureDate + 7200000, binario: '3' },
          effettivo: { orario: departureDate + 7200000, binario: '3' },
          tipo: 'A'
        }
      ]
    };
  }
}
