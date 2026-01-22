@echo off
REM HPKI Bridge App Build Script for Windows
REM Usage: build.bat

echo ===================================
echo HPKI Bridge App Builder
echo ===================================

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is required
    exit /b 1
)

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt
pip install pyinstaller

REM Build
echo.
echo Building application...
pyinstaller hpki_bridge.spec --clean

REM Result
echo.
echo ===================================
echo Build complete!
echo.
echo Output: dist\HPKI Bridge.exe
echo ===================================
