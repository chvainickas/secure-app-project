#!/bin/bash

echo "==================================="
echo "  Task Manager - Initialization"
echo "==================================="
echo

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

echo "[1/4] Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo
echo "[2/4] Removing old database (if exists)..."
rm -f database.sqlite3

echo
echo "[3/4] Initializing database..."
npm run init-db

if [ $? -ne 0 ]; then
    echo "Error: Failed to initialize database"
    exit 1
fi

echo
echo "[4/4] Starting application..."
echo
echo "==================================="
echo "  Server running at:"
echo "  http://localhost:3000"
echo ""
echo "  Default login:"
echo "  Username: admin"
echo "  Password: admin123"
echo "==================================="
echo

npm start
