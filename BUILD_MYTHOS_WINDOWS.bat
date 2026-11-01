@echo off
setlocal
cd /d "%~dp0"
title MYTHOS - Release Verification
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js LTS: https://nodejs.org/
  pause
  exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js LTS.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" goto install_dependencies
if not exist "node_modules\.bin\vite.cmd" goto install_dependencies
if not exist "node_modules\.bin\tsc.cmd" goto install_dependencies
if not exist "node_modules\.bin\eslint.cmd" goto install_dependencies
goto dependencies_ready

:install_dependencies
echo Installing or repairing frozen dependencies...
call npm ci --include=dev --bin-links --no-audit --no-fund
if errorlevel 1 goto failed
if not exist "node_modules\.bin\vite.cmd" goto failed
if not exist "node_modules\.bin\tsc.cmd" goto failed
if not exist "node_modules\.bin\eslint.cmd" goto failed

:dependencies_ready
echo.
echo [MYTHOS] Testing museum navigation...
call npm run test
if errorlevel 1 goto failed
echo [MYTHOS] Verifying GLB assets...
call npm run verify:assets
if errorlevel 1 goto failed
echo [MYTHOS] Checking TypeScript...
call npm run typecheck
if errorlevel 1 goto failed
echo [MYTHOS] Linting source...
call npm run lint
if errorlevel 1 goto failed
echo [MYTHOS] Building production website...
call npm run build
if errorlevel 1 goto failed
echo.
echo =============================================
echo SUCCESS! The production site is in: dist\
echo =============================================
echo To test the production bundle, run: npm run preview
pause
exit /b 0
:failed
echo.
echo BUILD FAILED. Read the error shown above.
pause
exit /b 1
