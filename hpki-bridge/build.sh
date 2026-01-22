#!/bin/bash
# HPKI Bridge App Build Script
# Usage: ./build.sh

set -e

echo "==================================="
echo "HPKI Bridge App Builder"
echo "==================================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required"
    exit 1
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
pip3 install -r requirements.txt
pip3 install pyinstaller

# Build
echo ""
echo "Building application..."
pyinstaller hpki_bridge.spec --clean

# Result
echo ""
echo "==================================="
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Build complete!"
    echo ""
    echo "Output: dist/HPKI Bridge.app"
    echo ""
    echo "To create a DMG installer:"
    echo "  hdiutil create -volname 'HPKI Bridge' -srcfolder 'dist/HPKI Bridge.app' -ov -format UDZO hpki-bridge-macos.dmg"
else
    echo "Build complete!"
    echo ""
    echo "Output: dist/HPKI Bridge.exe"
fi
echo "==================================="
