# start_platform.ps1
# Script to launch both backend and frontend applications concurrently.

$parentDir = Get-Location
$backendScript = Join-Path $parentDir "run_backend.ps1"
$frontendDir = Join-Path $parentDir "frontend"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "    Smart Placement Intelligence Platform    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Start Spring Boot Backend in a new window
Write-Host "Launching Spring Boot API service in a separate window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File `"$backendScript`""

# 2. Start React Frontend in this window
Write-Host "Launching React Dev Server..." -ForegroundColor Green
Set-Location -Path $frontendDir
npm run dev
