<#
Check status of Postgres (docker), and ports for backend/frontend.
Does NOT start any services.

Output format (exact):

PostgreSQL: RUNNING | STOPPED
Backend:    RUNNING | STOPPED
Frontend:   RUNNING | STOPPED

Run from repo root:
  powershell -ExecutionPolicy Bypass -File .\scripts\status-dev.ps1
#>

function Has-Command($name) { (Get-Command $name -ErrorAction SilentlyContinue) -ne $null }

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# PostgreSQL: rely only on listening sockets (port 5433)
$pg = 'STOPPED'
try {
    $listener = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object LocalPort -eq 5433 | Select-Object -First 1
    if ($listener) { $pg = 'RUNNING' }
} catch { }

# Backend: find first listening port in 8080..8090 using Get-NetTCPConnection
$backend = 'STOPPED'
$backendAddr = ''
try {
    $bListener = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object LocalPort -in (8080..8090) | Sort-Object LocalPort | Select-Object -First 1
    if ($bListener) {
        $backend = 'RUNNING'
        $port = $bListener.LocalPort
        $backendAddr = "http://localhost:$port"
    }
} catch { }

# Frontend: find first listening Vite port 5173..5185 using Get-NetTCPConnection
$frontend = 'STOPPED'
$frontendAddr = ''
try {
    $fListener = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object LocalPort -in (5173..5185) | Sort-Object LocalPort | Select-Object -First 1
    if ($fListener) {
        $frontend = 'RUNNING'
        $fport = $fListener.LocalPort
        $frontendAddr = "http://localhost:$fport"
    }
} catch { }

# Adminer (DB UI) rely on listening socket 8082
$dbui = 'STOPPED'
$dbuiAddr = ''
try {
    $aListener = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object LocalPort -eq 8082 | Select-Object -First 1
    if ($aListener) { $dbui = 'RUNNING'; $dbuiAddr = 'http://localhost:8082' }
} catch { }

Write-Host "PostgreSQL: $pg"
if ($dbui -eq 'RUNNING') { Write-Host "Adminer:    $dbui ($dbuiAddr)" } else { Write-Host "Adminer:    $dbui" }
if ($backend -eq 'RUNNING') { Write-Host "Backend:    $backend ($backendAddr)" } else { Write-Host "Backend:    $backend" }
if ($frontend -eq 'RUNNING') { Write-Host "Frontend:   $frontend ($frontendAddr)" } else { Write-Host "Frontend:   $frontend" }
