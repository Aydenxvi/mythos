@echo off
setlocal
cd /d "%~dp0"
title MYTHOS - The Eternal Museum
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from https://nodejs.org/
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js LTS.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo [MYTHOS] Installing project dependencies...
  call npm ci --no-audit --no-fund
  if errorlevel 1 (
    echo Installation failed. Please inspect the npm error above.
    pause
    exit /b 1
  )
)
echo [MYTHOS] Starting the local 3D museum...
echo When the browser opens, choose ENTER THE MUSEUM.
echo Press Ctrl+C here to stop the server.
call npm run dev -- --open
if errorlevel 1 pause
