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
rem npm run needs Windows command shims, not only the package's JavaScript file.
if not exist "node_modules\vite\bin\vite.js" goto install_dependencies
if not exist "node_modules\.bin\vite.cmd" goto install_dependencies
if not exist "node_modules\.bin\tsc.cmd" goto install_dependencies
if not exist "node_modules\.bin\eslint.cmd" goto install_dependencies
goto dependencies_ready

:install_dependencies
echo [MYTHOS] Installing or repairing project dependencies...
call npm ci --include=dev --bin-links --no-audit --no-fund
if errorlevel 1 (
  echo Installation failed. Please inspect the npm error above.
  pause
  exit /b 1
)
if not exist "node_modules\.bin\vite.cmd" (
  echo Vite's Windows command was not created. Check npm errors and file permissions.
  pause
  exit /b 1
)

:dependencies_ready
echo [MYTHOS] Starting the local 3D museum...
echo When the browser opens, choose ENTER THE MUSEUM.
echo Press Ctrl+C here to stop the server.
call npm run dev -- --open
if errorlevel 1 pause
