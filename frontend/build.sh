#!/bin/bash

# Ensure the script exits if a command fails
set -e

echo "Installing dependencies..."
npm install

echo "Building React app..."
npm run build

echo "Checking build directory..."
ls -la build

echo "Build completed successfully!"

# Ensure build directory is accessible to Vercel
chmod -R 755 build