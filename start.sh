#!/bin/bash

# Create a new tmux session named 'trenitalia' with the frontend and backend
SESSION_NAME="trenitalia"

# Check if the session already exists and kill it if it does
tmux kill-session -t $SESSION_NAME 2>/dev/null

# Create a new session, start the backend in the first pane
tmux new-session -d -s $SESSION_NAME -n backend "cd backend && npx wrangler dev"

# Split the window and start the frontend in the second pane
tmux split-window -h -t $SESSION_NAME "cd frontend && npm start"

# Attach to the session
tmux attach-session -t $SESSION_NAME
