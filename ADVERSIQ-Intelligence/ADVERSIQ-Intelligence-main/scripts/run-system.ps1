# ADVERSIQ System Startup & Live Training Script (Windows PowerShell)
# Runs backend, frontend, and training data collector with live monitoring
# Usage: .\scripts\run-system.ps1

$ErrorActionPreference = "Stop"

$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

function Write-Header {
    Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║      ADVERSIQ AI SYSTEM - LIVE TRAINING LAUNCHER          ║" -ForegroundColor Cyan
    Write-Host "║        Multi-Layer Autonomous Learning Platform          ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Check-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

function Free-Port {
    param([int]$Port)
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "⚠️  Freed port $Port" -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
    catch {
        # Port already free
    }
}

function Test-Backend {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3004/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

Write-Header

# Step 1: Check dependencies
Write-Host "Step 1: Checking dependencies..." -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js and npm found`n" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    npm install
}
else {
    Write-Host "✅ Dependencies already installed`n" -ForegroundColor Green
}

# Step 3: Check ports
Write-Host "Step 3: Checking ports..." -ForegroundColor Cyan
if (Check-Port 3004) {
    Free-Port 3004
}
if (Check-Port 3002) {
    Free-Port 3002
}
Write-Host "✅ Ports 3002 and 3004 available`n" -ForegroundColor Green

# Step 4: Start backend
Write-Host "Step 4: Starting backend server (port 3004)..." -ForegroundColor Cyan
$backendLog = "$env:TEMP\adversiq_backend.log"
$backendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev:server" -RedirectStandardOutput $backendLog -RedirectStandardError "$env:TEMP\adversiq_backend_err.log" -PassThru -NoNewWindow
Write-Host "✅ Backend process started (PID: $($backendProcess.Id))`n" -ForegroundColor Green
Start-Sleep -Seconds 3

# Step 5: Start frontend
Write-Host "Step 5: Starting frontend (port 3002)..." -ForegroundColor Cyan
$frontendLog = "$env:TEMP\adversiq_frontend.log"
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev:vite" -RedirectStandardOutput $frontendLog -RedirectStandardError "$env:TEMP\adversiq_frontend_err.log" -PassThru -NoNewWindow
Write-Host "✅ Frontend process started (PID: $($frontendProcess.Id))`n" -ForegroundColor Green
Start-Sleep -Seconds 3

# Step 6: Wait for system ready
Write-Host "Step 6: Waiting for system to be ready..." -ForegroundColor Cyan
$maxRetries = 30
$retry = 0
while ($retry -lt $maxRetries) {
    if (Test-Backend) {
        Write-Host "`n✅ Backend is ready`n" -ForegroundColor Green
        break
    }
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 1
    $retry++
}

if ($retry -eq $maxRetries) {
    Write-Host "`n❌ Backend failed to respond" -ForegroundColor Red
    exit 1
}

# Step 7: System Status
Write-Host "Step 7: System Status" -ForegroundColor Cyan
$health = Invoke-WebRequest -Uri "http://localhost:3004/api/health" -ErrorAction SilentlyContinue | ConvertFrom-Json
Write-Host "Backend Response:" -ForegroundColor Green
Write-Host ($health | ConvertTo-Json)
Write-Host ""

# Step 8: Welcome message
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              🚀 SYSTEM IS LIVE & READY                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Access Points:" -ForegroundColor Green
Write-Host "  📱 Frontend:         http://localhost:3002" -ForegroundColor Blue
Write-Host "  🔌 Backend API:      http://localhost:3004" -ForegroundColor Blue
Write-Host "  📊 Learning Status:  http://localhost:3004/api/learning-dashboard/metrics`n" -ForegroundColor Blue

Write-Host "Quick Commands:" -ForegroundColor Green
Write-Host "  View Learning Metrics:"
Write-Host "    Invoke-WebRequest http://localhost:3004/api/learning-dashboard/metrics | ConvertFrom-Json`n" -ForegroundColor Blue
Write-Host "  View System Health:"
Write-Host "    Invoke-WebRequest http://localhost:3004/api/health | ConvertFrom-Json`n" -ForegroundColor Blue
Write-Host "  Start Training Data Collection:"
Write-Host "    tsx scripts/collect-training-data.ts`n" -ForegroundColor Blue
Write-Host "  View Telemetry:"
Write-Host "    Get-Content data/omni_node_telemetry.jsonl -Tail 20`n" -ForegroundColor Blue

Write-Host "Press Ctrl+C to stop the system" -ForegroundColor Yellow

# Step 9: Monitoring loop
$monitorInterval = 30
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

while ($true) {
    try {
        Clear-Host
        Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║        ADVERSIQ LIVE MONITORING - $(Get-Date -Format 'HH:mm:ss')                   ║" -ForegroundColor Cyan
        Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

        Write-Host "System Status:" -ForegroundColor Green
        if ($backendProcess.HasExited) {
            Write-Host "  ❌ Backend: STOPPED" -ForegroundColor Red
        }
        else {
            Write-Host "  ✅ Backend (PID $($backendProcess.Id)): RUNNING" -ForegroundColor Green
        }

        if ($frontendProcess.HasExited) {
            Write-Host "  ❌ Frontend: STOPPED" -ForegroundColor Red
        }
        else {
            Write-Host "  ✅ Frontend (PID $($frontendProcess.Id)): RUNNING" -ForegroundColor Green
        }

        # Try to get metrics
        Write-Host "`nLearning Metrics:" -ForegroundColor Green
        try {
            $metrics = Invoke-WebRequest -Uri "http://localhost:3004/api/learning-dashboard/metrics" -ErrorAction SilentlyContinue | ConvertFrom-Json
            Write-Host "  Conversations: $($metrics.totalConversations)" -ForegroundColor Cyan
            Write-Host "  Problems Found: $($metrics.totalProblems)" -ForegroundColor Cyan
            Write-Host "  Success Rate: $($metrics.successRate)%" -ForegroundColor Cyan
            Write-Host "  Confidence: $($metrics.averageConfidence)" -ForegroundColor Cyan
        }
        catch {
            Write-Host "  (metrics loading...)" -ForegroundColor Yellow
        }

        Write-Host "`nLogs:" -ForegroundColor Green
        if (Test-Path $backendLog) {
            $lastBackend = Get-Content $backendLog -Tail 1
            Write-Host "  Backend:  $($lastBackend.Substring(0, [Math]::Min(60, $lastBackend.Length)))" -ForegroundColor Gray
        }
        if (Test-Path $frontendLog) {
            $lastFrontend = Get-Content $frontendLog -Tail 1
            Write-Host "  Frontend: $($lastFrontend.Substring(0, [Math]::Min(60, $lastFrontend.Length)))" -ForegroundColor Gray
        }

        Write-Host "`nNext update in ${monitorInterval}s (Press Ctrl+C to stop)`n" -ForegroundColor Yellow
        Start-Sleep -Seconds $monitorInterval
    }
    catch {
        Write-Host "Error during monitoring: $_" -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
}
