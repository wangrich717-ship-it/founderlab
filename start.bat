@echo off
setlocal enableextensions
cd /d "%~dp0"

echo ============================================
echo   Founder Lab  -  creating dev server
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node 20+ : https://nodejs.org
  echo.
  goto :end
)

if not exist "node_modules" (
  echo [1/3] First run: installing dependencies, may take a few minutes...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed. See messages above.
    goto :end
  )
)

if not exist "prisma\dev.db" (
  echo [2/3] First run: initializing database and seed data...
  call npx prisma generate
  call npx prisma db push
  call npm run seed
) else (
  call npx prisma generate >nul 2>nul
)

echo.
echo [3/3] Starting dev server at http://localhost:3000
echo Press Ctrl + C to stop the server.
echo.

start "" cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:3000"
call npm run dev

echo.
echo Dev server has stopped.

:end
echo.
pause
endlocal
