#!/bin/bash

# Test script for /api/station-departures endpoint
echo "Testing /api/station-departures endpoint..."
echo

# Test with sample parameters - these would need to be valid station ID and timestamp for the test to work
# Using a timestamp for October 16, 2025 as an example (matching the current date)
timestamp=$(date -d "2025-10-16" +%s)000
echo "Using timestamp: $timestamp (for 2025-10-16)"

response=$(curl -s "http://localhost:8787/api/station-departures/S08409/$timestamp")
echo "Query: /api/station-departures/S08409/$timestamp"
echo "Response: $response"
echo

# Test with another station ID example
response=$(curl -s "http://localhost:8787/api/station-departures/S06000/$timestamp")
echo "Query: /api/station-departures/S06000/$timestamp"
echo "Response: $response"
echo

# Test with invalid timestamp format
response=$(curl -s "http://localhost:8787/api/station-departures/S06085/invalid_timestamp")
echo "Query: /api/station-departures/S06085/invalid_timestamp (should return error)"
echo "Response: $response"
echo

echo "Station departures test completed."
