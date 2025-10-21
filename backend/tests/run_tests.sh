#!/bin/bash

# Main test runner for Trenitalia API endpoints
echo "Running Trenitalia API backend tests..."
echo

# Check if the backend server is running
if ! curl -s http://localhost:8787 > /dev/null 2>&1; then
    echo "ERROR: Backend server is not running on http://localhost:8787"
    echo "Please start the backend server with 'wrangler dev' before running tests"
    exit 1
fi

echo "Backend server is running. Starting tests..."
echo

# Run each test script
echo "1. Running station autocomplete tests..."
./test_stations.sh
echo
echo "------------------------"
echo

echo "2. Running train details tests..."
./test_train_details.sh
echo
echo "------------------------"
echo

echo "3. Running station departures tests..."
./test_station_departures.sh
echo
echo "------------------------"
echo

echo "4. Running station arrivals tests..."
./test_station_arrivals.sh
echo
echo "------------------------"
echo

echo "All tests completed!"