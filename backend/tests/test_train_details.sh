#!/bin/bash

# Test script for /api/train-details endpoint
echo "Testing /api/train-details endpoint..."
echo

# Test with sample parameters - these would need to be valid train details for the test to work
# This is a sample test - you'll need to provide actual valid parameters
echo "Testing with sample parameters (these are examples and may not return actual data):"
response=$(curl -s "http://localhost:8787/api/train-details/12345/S06000/1704063600000")
echo "Query: /api/train-details/12345/S06000/1704063600000"
echo "Response: $response"
echo

# If you know valid train numbers and station IDs, you can test with those
echo "Note: To test with real data, you'll need valid parameters like:"
echo "curl -s \"http://localhost:8787/api/train-details/[TRAIN_NUMBER]/[STATION_ID]/[TIMESTAMP]\""
echo

echo "Train details test completed."