import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Box, Container, FormControl, Button, Stack, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { fetchStations, fetchTrainsFromTo, fetchTrainDetails, StationAutocompleteResponse, TrainDepartureArrivalResponse } from './api';

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [departureStations, setDepartureStations] = useState<StationAutocompleteResponse[]>([]);
  const [arrivalStations, setArrivalStations] = useState<StationAutocompleteResponse[]>([]);
  const [departureInput, setDepartureInput] = useState(searchParams.get('da') || '');
  const [arrivalInput, setArrivalInput] = useState(searchParams.get('a') || '');
  const [selectedDeparture, setSelectedDeparture] = useState<StationAutocompleteResponse | null>(null);
  const [selectedArrival, setSelectedArrival] = useState<StationAutocompleteResponse | null>(null);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [arrivalLoading, setArrivalLoading] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(dayjs()); // Default to current date/time
  const [searchLoading, setSearchLoading] = useState(false);
  const [trainResults, setTrainResults] = useState<TrainDepartureArrivalResponse[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [expandedTrainId, setExpandedTrainId] = useState<string | null>(null);
  const [trainDetails, setTrainDetails] = useState<Record<string, any>>({});
  const [trainDetailsLoading, setTrainDetailsLoading] = useState<Record<string, boolean>>({});

  // Initialize stations from URL parameters when component loads
  useEffect(() => {
    const daParam = searchParams.get('da');
    const aParam = searchParams.get('a');

    if (daParam) {
      setDepartureInput(daParam);
      fetchStations(daParam)
        .then(stations => {
          setDepartureStations(stations);
          const matchingStation = stations.find(s => s.name === daParam || s.id === daParam);
          if (matchingStation) {
            setSelectedDeparture(matchingStation);
          }
        })
        .catch(error => {
          console.error('Error fetching departure stations:', error);
          setDepartureStations([]);
        });
    }

    if (aParam) {
      setArrivalInput(aParam);
      fetchStations(aParam)
        .then(stations => {
          setArrivalStations(stations);
          const matchingStation = stations.find(s => s.name === aParam || s.id === aParam);
          if (matchingStation) {
            setSelectedArrival(matchingStation);
          }
        })
        .catch(error => {
          console.error('Error fetching arrival stations:', error);
          setArrivalStations([]);
        });
    }
  }, [searchParams]);

  const handleSearch = async (updateUrl = true) => {
    // Validate that both stations are selected
    if (!selectedDeparture || !selectedArrival) {
      alert('Please select both departure and arrival stations.');
      return;
    }

    if (!selectedDateTime) {
      alert('Please select a departure date and time.');
      return;
    }

    // Update URL parameters with selected stations only if not auto-searching
    if (updateUrl) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('da', selectedDeparture.name);
        newParams.set('a', selectedArrival.name);
        return newParams;
      });
    }

    setSearchLoading(true);
    setSearchError(null);
    setTrainResults(null);
    setTrainDetails({});

    try {
      // Convert the selected date time to timestamp in milliseconds
      const timestamp = selectedDateTime.valueOf();

      // Call the API to fetch train results
      const results = await fetchTrainsFromTo(
        selectedDeparture.id,
        selectedArrival.id,
        timestamp
      );

      setTrainResults(results);
    } catch (error) {
      console.error('Error fetching train results:', error);
      setSearchError('Failed to fetch train results. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  }


  // Automatically trigger search when both stations are loaded from parameters
  useEffect(() => {
    const daParam = searchParams.get('da');
    const aParam = searchParams.get('a');

    // Only auto-search if both parameters exist and both stations are selected
    if (daParam && aParam && selectedDeparture && selectedArrival &&
      !trainResults && !searchLoading) {
      // Delay the search slightly to ensure all state is properly set
      const timer = setTimeout(() => {
        handleSearch();
      }, 100);

      return () => clearTimeout(timer);
    }
  });

  // Fetch departure stations when user types at least 2 characters
  useEffect(() => {
    if (departureInput.length >= 2) {
      setDepartureLoading(true);
      fetchStations(departureInput)
        .then(setDepartureStations)
        .catch(error => {
          console.error('Error fetching departure stations:', error);
          setDepartureStations([]);
        })
        .finally(() => setDepartureLoading(false));
    } else {
      setDepartureStations([]);
    }
  }, [departureInput]);

  // Fetch arrival stations when user types at least 2 characters
  useEffect(() => {
    if (arrivalInput.length >= 2) {
      setArrivalLoading(true);
      fetchStations(arrivalInput)
        .then(setArrivalStations)
        .catch(error => {
          console.error('Error fetching arrival stations:', error);
          setArrivalStations([]);
        })
        .finally(() => setArrivalLoading(false));
    } else {
      setArrivalStations([]);
    }
  }, [arrivalInput]);

  // const handleSearch = async (updateUrl = true) => {
  //   // Validate that both stations are selected
  //   if (!selectedDeparture || !selectedArrival) {
  //     alert('Please select both departure and arrival stations.');
  //     return;
  //   }
  //
  //   if (!selectedDateTime) {
  //     alert('Please select a departure date and time.');
  //     return;
  //   }
  //
  //   // Update URL parameters with selected stations only if not auto-searching
  //   if (updateUrl) {
  //     setSearchParams(prev => {
  //       const newParams = new URLSearchParams(prev);
  //       newParams.set('da', selectedDeparture.name);
  //       newParams.set('a', selectedArrival.name);
  //       return newParams;
  //     });
  //   }
  //
  //   setSearchLoading(true);
  //   setSearchError(null);
  //   setTrainResults(null);
  //   setTrainDetails({});
  //
  //   try {
  //     // Convert the selected date time to timestamp in milliseconds
  //     const timestamp = selectedDateTime.valueOf();
  //
  //     // Call the API to fetch train results
  //     const results = await fetchTrainsFromTo(
  //       selectedDeparture.id,
  //       selectedArrival.id,
  //       timestamp
  //     );
  //
  //     setTrainResults(results);
  //   } catch (error) {
  //     console.error('Error fetching train results:', error);
  //     setSearchError('Failed to fetch train results. Please try again.');
  //   } finally {
  //     setSearchLoading(false);
  //   }
  // };

  // Function to format time from timestamp
  const formatTime = (timestamp: number | null | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 3 }}>
        <FormControl fullWidth margin="normal">
          <Autocomplete
            disablePortal
            options={departureStations}
            loading={departureLoading}
            value={selectedDeparture}
            onInputChange={(event, newInput) => {
              setDepartureInput(newInput);
            }}
            onChange={(event, newValue) => {
              setSelectedDeparture(newValue);
              if (newValue) {
                setDepartureInput(newValue.name);
              } else {
                setDepartureInput('');
              }
            }}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Departure Station"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {departureLoading ? <div>Loading...</div> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

          <Autocomplete
            disablePortal
            options={arrivalStations}
            loading={arrivalLoading}
            value={selectedArrival}
            onInputChange={(event, newInput) => {
              setArrivalInput(newInput);
            }}
            onChange={(event, newValue) => {
              setSelectedArrival(newValue);
              if (newValue) {
                setArrivalInput(newValue.name);
              } else {
                setArrivalInput('');
              }
            }}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Arrival Station"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {arrivalLoading ? <div>Loading...</div> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Departure Date & Time"
              value={selectedDateTime}
              onChange={(newValue: Dayjs | null) => setSelectedDateTime(newValue)}
              slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
              sx={{ mb: 2 }}
            />
          </LocalizationProvider>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => handleSearch(true)}
              disabled={!selectedDeparture || !selectedArrival || searchLoading}
              sx={{
                bgcolor: 'black',
                color: 'white',
                '&:hover': {
                  bgcolor: 'gray',
                }
              }}
            >
              {searchLoading ? 'Searching...' : 'Search Trains'}
            </Button>
          </Stack>

          {/* Results section */}
          {searchLoading && (
            <Box display="flex" justifyContent="center" mt={3}>
              <CircularProgress />
            </Box>
          )}

          {searchError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {searchError}
            </Alert>
          )}

          {trainResults && trainResults.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" component="h2" gutterBottom>
                Available Trains
              </Typography>
              {trainResults.map((train, index) => {
                // Create a unique ID for this train to track expanded state
                const trainId = `${train.numeroTreno}-${train.codOrigine}-${train.codDestinazione}-${train.dataPartenzaTreno}`;

                return (
                  <Card key={index} sx={{ mb: 2, bgcolor: 'grey.100' }}>
                    <CardContent onClick={() => {
                      // Toggle expanded state for this train
                      if (expandedTrainId === trainId) {
                        setExpandedTrainId(null);
                      } else {
                        setExpandedTrainId(trainId);
                        // Fetch detailed train information if not already loaded
                        if (!trainDetails[trainId] && !trainDetailsLoading[trainId]) {
                          setTrainDetailsLoading(prev => ({ ...prev, [trainId]: true }));
                          fetchTrainDetails(
                            train.numeroTreno?.toString() || '0',
                            train.codOrigine || '',
                            train.dataPartenzaTreno || Date.now()
                          )
                            .then(details => {
                              setTrainDetails(prev => ({ ...prev, [trainId]: details }));
                            })
                            .catch(error => {
                              console.error('Error fetching train details:', error);
                            })
                            .finally(() => {
                              setTrainDetailsLoading(prev => {
                                const newLoading = { ...prev };
                                delete newLoading[trainId];
                                return newLoading;
                              });
                            });
                        }
                      }
                    }} style={{ cursor: 'pointer' }}>
                      <Box>
                        <Typography variant="h6" component="div">
                          Train {train.numeroTreno || 'N/A'} {(train.categoria || train.categoriaDescrizione) && ("(" + (train.categoria?.trim() || train.categoriaDescrizione?.trim()) + ")")}
                        </Typography>
                        <Typography sx={{ mb: 1.5 }} color="text.secondary">
                          To {train.destinazione || 'Destination'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Platform: </strong> {train.binarioEffettivoPartenzaDescrizione || train.binarioProgrammatoPartenzaDescrizione || train.binarioEffettivoArrivoDescrizione || train.binarioProgrammatoArrivoDescrizione || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Departure:</strong> {formatTime(train.orarioPartenza)}
                        </Typography>
                        {(train.ritardo && train.ritardo > 0 && (
                          <Typography variant="body2" color="error">
                            <strong>Delay: </strong>{train.ritardo} minutes
                          </Typography>
                        )) || ''}
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: 1,
                        pt: 1,
                        border: 'none',
                        borderTop: '1px solid #ccc'
                      }}>
                        <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
                          Click to expand
                        </Typography>
                        <svg
                          style={{
                            transform: expandedTrainId === trainId ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                            color: 'gray'
                          }}
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                        >
                          <path fill="currentColor" d="M7,10L12,15L17,10H7Z" />
                        </svg>
                      </Box>
                    </CardContent>

                    {/* Expanded train details section */}
                    {expandedTrainId === trainId && (
                      <CardContent sx={{ bgcolor: 'grey.200', pt: 0 }}>
                        {trainDetailsLoading[trainId] ? (
                          <Box display="flex" justifyContent="center" my={2}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : trainDetails[trainId] ? (
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              Route Details
                            </Typography>
                            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>

                              {
                                (() => {
                                  const lastDeparted = trainDetails[trainId].fermate?.findLastIndex((stop: any, idx: number) => (stop.partenzaReale != null));

                                  return trainDetails[trainId].fermate?.map((stop: any, stopIndex: number) => {
                                    const isArrived = stop.arrivoReale != null;
                                    const isDeparted = stopIndex <= lastDeparted;
                                    const isInStation = isArrived && !isDeparted;

                                    return (
                                      <Box
                                        key={stopIndex}
                                        sx={{
                                          mb: 1,
                                          p: 1,
                                          border: '1px solid #ccc',
                                          borderRadius: 1,
                                          bgcolor: 'lightgray',
                                          opacity: isDeparted ? 0.7 : 1
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Typography variant="subtitle2" sx={{ flex: 1 }}>
                                            {stop.stazione}
                                          </Typography>
                                          {isInStation && (
                                            <svg
                                              width="20"
                                              height="20"
                                              viewBox="0 0 640 640"
                                              style={{ color: 'gray', marginLeft: '8px' }}
                                            >
                                              <path fill="currentColor" d="M128 160C128 107 171 64 224 64L416 64C469 64 512 107 512 160L512 416C512 456.1 487.4 490.5 452.5 504.8L506.4 568.5C515 578.6 513.7 593.8 503.6 602.3C493.5 610.8 478.3 609.6 469.8 599.5L395.8 512L244.5 512L170.5 599.5C161.9 609.6 146.8 610.9 136.7 602.3C126.6 593.7 125.3 578.6 133.9 568.5L187.8 504.8C152.6 490.5 128 456.1 128 416L128 160zM192 192L192 288C192 305.7 206.3 320 224 320L416 320C433.7 320 448 305.7 448 288L448 192C448 174.3 433.7 160 416 160L224 160C206.3 160 192 174.3 192 192zM320 448C337.7 448 352 433.7 352 416C352 398.3 337.7 384 320 384C302.3 384 288 398.3 288 416C288 433.7 302.3 448 320 448z" />
                                            </svg>
                                          )}
                                        </Box>

                                        <Box>
                                          <Typography variant="body2">
                                            <strong>Platform: </strong> {stop.binarioEffettivoPartenzaDescrizione || stop.binarioProgrammatoPartenzaDescrizione || stop.binarioEffettivoArrivoDescrizione || stop.binarioProgrammatoArrivoDescrizione || "N/A"}
                                          </Typography>
                                          {stop.arrivo_teorico && (
                                            <Typography variant="body2">
                                              <strong>Arrival: </strong> {formatTime(stop.arrivo_teorico) || "-"} {stop.arrivoReale && "(" + formatTime(stop.arrivoReale) + ")"}
                                            </Typography>
                                          )}
                                          {stop.partenza_teorica && (
                                            <Typography variant="body2">
                                              <strong>Departure: </strong> {formatTime(stop.partenza_teorica) || "-"} {stop.partenzaReale && "(" + formatTime(stop.partenzaReale) + ")"}
                                            </Typography>
                                          )}
                                        </Box>


                                        {(((stop.ritardo && stop.ritardo > 0) || (stopIndex === lastDeparted + 1 && train.ritardo && train.ritardo > 0)) && (
                                          <Typography variant="body2" color="error">
                                            <strong>Delay: </strong>{stop.ritardo || (stopIndex === lastDeparted + 1 && train.ritardo)} minutes
                                          </Typography>
                                        )) || ''}
                                      </Box>
                                    );
                                  })
                                })()
                              }


                            </Box>
                          </Box>
                        ) : (
                          <Typography>No detailed information available</Typography>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </Box>
          )
          }

          {trainResults && trainResults.length === 0 && !searchLoading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No trains found for the selected route and date.
            </Alert>
          )}
        </FormControl>

        {/* Footer with links */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          mt: 4,
          pt: 2,
          borderTop: '1px solid #ccc'
        }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => {
              let url = 'http://www.viaggiatreno.it/infomobilitamobile/pages/cercaTreno/cercaTreno.jsp';
              if (selectedDeparture) {
                const encodedName = encodeURIComponent(selectedDeparture.name);
                url += `?cod=${selectedDeparture.id}&nome=${encodedName}`;
              }
              window.open(url, '_blank');
            }}
          >
            Open in viaggiatreno
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => window.open('https://github.com/', '_blank')}
          >
            Github
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
