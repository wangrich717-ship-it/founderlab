# Founder Lab - one-click dev launcher
# Right-click this file -> "Run with PowerShell".
# ASCII-only on purpose: avoids any Chinese/encoding/BOM issues in Windows PowerShell 5.1.
# Do NOT add non-ASCII characters to this file.

$ErrorActionPreference = "Continue"

try {
  Set-Location $PSScriptRoot

  Write-Host "============================================" -ForegroundColor DarkYellow
  Write-Host "  Founder Lab  -  starting dev server" -ForegroundColor Yellow
  Write-Host "============================================`n" -ForegroundColor DarkYellow

  # 1) Node check
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found. Install Node 20+ : https://nodejs.org" -ForegroundColor Red
    return
  }

  # 2) First run: install deps
  if (-not (Test-Path "node_modules")) {
    Write-Host "[1/3] First run: installing dependencies (a few minutes)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] npm install failed (see above)." -ForegroundColor Red; return }
  }

  # 3) First run: database + seed
  if (-not (Test-Path "prisma/dev.db")) {
    Write-Host "[2/3] First run: initializing database and seed data..." -ForegroundColor Cyan
    npx prisma generate
    npx prisma db push
    npm run seed
  } else {
    npx prisma generate *> $null
  }

  # 4) Start dev server + open browser
  Write-Host "`n[3/3] Starting dev server at http://localhost:3000" -ForegroundColor Green
  Write-Host "Press Ctrl + C to stop the server.`n" -ForegroundColor DarkGray
  Start-Job { Start-Sleep 5; Start-Process "http://localhost:3000" } | Out-Null

  npm run dev
}
catch {
  Write-Host "`n[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}
finally {
  Write-Host ""
  Read-Host "Press Enter to close this window"
}
