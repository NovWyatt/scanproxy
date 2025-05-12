#!/bin/bash

# Ensure the script exits if a command fails
set -e

echo "Installing dependencies..."
npm install

echo "Building React app..."
npm run build

echo "Build completed successfully!"