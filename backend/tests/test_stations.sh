#!/bin/bash

# Test script for /api/stations endpoint
echo "Testing /api/stations endpoint..."
echo

# Test with a common station query
response=$(curl -s "http://localhost:8787/api/stations/roma")
echo "Query: roma"
echo "Response: $response"
echo

# Test with another query
response=$(curl -s "http://localhost:8787/api/stations/milano")
echo "Query: milano"
echo "Response: $response"
echo

# Test with empty query (should return empty array)
response=$(curl -s "http://localhost:8787/api/stations/")
echo "Query: (empty)"
echo "Response: $response"
echo

echo "Station autocomplete test completed."