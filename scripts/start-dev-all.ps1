<#
One-command dev startup for Windows (PowerShell).

What it does:
- Ensure Docker is available and start Postgres via docker-compose.yml
- Wait for Postgres on host 127.0.0.1:5433
- Ensure `go` is available (offers to run `install-go.ps1` if missing)
- Run `go mod download` and start the backend as a background process (logs to ./logs/backend.log)
- Install frontend deps if missing and start Vite dev server as background process (logs to ./logs/frontend.log)

Usage (from repo root):
  powershell -ExecutionPolicy Bypass -File .\scripts\start-dev-all.ps1

Notes:
- Some steps require administrative privileges (installing Go via winget/choco). The script will instruct you when elevation is required.
- Background processes are started via `Start-Process` and logs are written to the `logs/` folder.
#>

function Has-Command($name) { (Get-Command $name -ErrorAction SilentlyContinue) -ne $null }

Write-Host "== start-dev-all.ps1: starting development environment =="

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# ensure logs folder
$logsDir = Join-Path $root '..\logs'
if (-not (Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }
$backendOutLog = Join-Path $logsDir 'backend.out.log'
$backendErrLog = Join-Path $logsDir 'backend.err.log'
$frontendOutLog = Join-Path $logsDir 'frontend.out.log'
$frontendErrLog = Join-Path $logsDir 'frontend.err.log'

Write-Host "1) Docker / Postgres"
$postgresStatus = 'SKIPPED'
$adminerStatus = 'SKIPPED'
if (-not (Has-Command docker)) {
    Write-Error "Docker CLI not found. Please install Docker Desktop and ensure it's running. Aborting start."
    exit 1
}

# Ensure Docker daemon is responsive
Write-Host "Checking Docker daemon (docker info)..."
try {
    $info = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker daemon not available: $info`nPlease start Docker Desktop and try again."
        exit 1
    }
}
catch {
    Write-Error "Docker daemon check failed: $_. Please start Docker Desktop and try again."
    exit 1
}

Write-Host "Starting Postgres via docker-compose..."
try {
    docker-compose up -d | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "docker-compose returned exit code $LASTEXITCODE" }
    $postgresStatus = 'STARTING'
}
catch {
    Write-Error "docker-compose up failed: $_"
    exit 1
}

Write-Host "Waiting for Postgres on 127.0.0.1:5433 (timeout 60s)..."
$start = Get-Date
$ok = $false
while ((Get-Date) -lt $start.AddSeconds(60)) {
    try {
        $res = Test-NetConnection -ComputerName 127.0.0.1 -Port 5433 -WarningAction SilentlyContinue
        if ($res -and $res.TcpTestSucceeded) { Write-Host "Postgres is reachable."; $ok = $true; break }
    }
    catch { }
    Start-Sleep -Seconds 2
}

if ($ok) { $postgresStatus = 'RUNNING' } else { Write-Error "Postgres did not become reachable on 127.0.0.1:5433 within 60s. Check docker logs with: docker logs courseai_postgres"; exit 1 }

# check Adminer UI
Write-Host "Waiting for Adminer on 127.0.0.1:8082 (timeout 30s)..."
$start2 = Get-Date
$ok2 = $false
while ((Get-Date) -lt $start2.AddSeconds(30)) {
    try {
        $r = Test-NetConnection -ComputerName 127.0.0.1 -Port 8082 -WarningAction SilentlyContinue
        if ($r -and $r.TcpTestSucceeded) { Write-Host "Adminer is reachable."; $ok2 = $true; break }
    }
    catch { }
    Start-Sleep -Seconds 2
}
if ($ok2) { $adminerStatus = 'RUNNING' } else { Write-Warning "Adminer did not become reachable on 127.0.0.1:8082 within 30s. Check docker logs with: docker logs courseai_adminer"; $adminerStatus = 'SKIPPED' }

# Create database if it doesn't exist
Write-Host "Creating database 'courseai_db' if it doesn't exist..."
try {
    $createDbCmd = "CREATE DATABASE courseai_db;"
    docker exec courseai_postgres psql -U postgres -c $createDbCmd 2>&1 | Out-Null
    Write-Host "Database setup complete."
}
catch {
    Write-Warning "Database creation had an issue (may be normal if it already exists): $_"
}

Write-Host "2) Ensure Go toolchain"
if (-not (Has-Command go)) {
    Write-Error "Go not found on PATH. Backend cannot be started. Install Go and restart your shell."
    exit 1
}

Write-Host "3) Backend: download modules and start server"
$backendStatus = 'SKIPPED'
$backendDir = Join-Path $root '..\backend'
if (Test-Path $backendDir) {
    Set-Location $backendDir
    if (Has-Command go) {
        Write-Host "Running: go mod download"
        try {
            & go mod download
        }
        catch {
            Write-Warning "go mod download failed: $_"
        }
        # Ensure preferred backend port 8080 is free before starting
        $portTest = Test-NetConnection -ComputerName 127.0.0.1 -Port 8080 -WarningAction SilentlyContinue
        if ($portTest -and $portTest.TcpTestSucceeded) {
            Write-Error "Port 8080 is currently in use. Run .\scripts\stop-dev-all.ps1 and ensure ports are free. Aborting start."
            exit 1
        }

        Write-Host "Starting backend as background process (logs: $backendOutLog , $backendErrLog)"
        try {
            $proc = Start-Process -FilePath "go" -ArgumentList @("run", "cmd/server/main.go") -WorkingDirectory $backendDir -RedirectStandardOutput $backendOutLog -RedirectStandardError $backendErrLog -WindowStyle Hidden -PassThru
            # write PID to logs/backend.pid
            $backendPidFile = Join-Path $logsDir 'backend.pid'
            try { Set-Content -Path $backendPidFile -Value $proc.Id -Encoding ASCII } catch { Write-Warning "Failed to write backend PID: $_" }

            # wait for backend port to appear (up to 10s)
            $ok = $false
            $waitStart = Get-Date
            while ((Get-Date) -lt $waitStart.AddSeconds(10)) {
                $r = Test-NetConnection -ComputerName 127.0.0.1 -Port 8080 -WarningAction SilentlyContinue
                if ($r -and $r.TcpTestSucceeded) { $ok = $true; break }
                Start-Sleep -Milliseconds 500
            }
            if ($ok) { $backendStatus = 'RUNNING' } else { Write-Error "Backend did not start and bind to port 8080 within timeout. Check logs: $backendErrLog"; exit 1 }
        }
        catch {
            Write-Error "Failed to start backend: $_"
            exit 1
        }
    }
    else {
        Write-Error "Go not available in this session. Aborting."
        exit 1
    }
}
else { Write-Warning "Backend directory not found: $backendDir"; $backendStatus = 'SKIPPED' }

Set-Location $root

Write-Host "4) Frontend: install deps (if needed) and start Vite dev server"
$frontendStatus = 'SKIPPED'
$frontendDir = Join-Path $root '..\frontend'
if (Test-Path $frontendDir) {
    if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
        if (Has-Command npm) {
            Write-Host "Installing frontend dependencies (npm install)..."
            Push-Location $frontendDir; npm install; Pop-Location
        }
        else { Write-Warning "npm not found. Skipping frontend install/start." }
    }
    if (Has-Command npm) {
        # Ensure no more than one Vite instance is running (ports 5173..5185)
        $existing = Get-NetTCPConnection -State Listen | Where-Object LocalPort -in (5173..5185) | Select-Object -Unique OwningProcess
        if ($existing.Count -gt 1) {
            Write-Error "Multiple frontend listeners detected on ports 5173..5185. Please stop extra instances before starting. Aborting."
            exit 1
        }
        elseif ($existing.Count -eq 1) {
            $frontendPid = $existing[0].OwningProcess
            Write-Host "Frontend already running (PID $frontendPid). Skipping start."
            $frontendPidFile = Join-Path $logsDir 'frontend.pid'
            try { Set-Content -Path $frontendPidFile -Value $frontendPid -Encoding ASCII } catch { }
            $frontendStatus = 'RUNNING'
        }
        else {
            Write-Host "Starting frontend dev server as background process (logs: $frontendOutLog , $frontendErrLog)"
            try {
                # Use cmd.exe to run npm on Windows so Start-Process can handle redirection reliably
                $npmArgs = "/c npm run dev"
                Start-Process -FilePath "cmd.exe" -ArgumentList $npmArgs -WorkingDirectory $frontendDir -RedirectStandardOutput $frontendOutLog -RedirectStandardError $frontendErrLog -WindowStyle Hidden

                # wait for a listener on 5173..5185 to appear (up to 15s) and capture PID
                $waitStart = Get-Date
                $found = $null
                while ((Get-Date) -lt $waitStart.AddSeconds(15)) {
                    $found = Get-NetTCPConnection -State Listen | Where-Object LocalPort -in (5173..5185) | Select-Object -First 1
                    if ($found) { break }
                    Start-Sleep -Milliseconds 500
                }
                if ($found) {
                    $pid = $found.OwningProcess
                    $frontendPidFile = Join-Path $logsDir 'frontend.pid'
                    try { Set-Content -Path $frontendPidFile -Value $pid -Encoding ASCII } catch { }
                    $frontendStatus = 'RUNNING'
                }
                else {
                    Write-Warning "Frontend did not open a listening port in time. Check logs: $frontendErrLog"
                    $frontendStatus = 'STARTED'
                }
            }
            catch {
                Write-Warning "Failed to start frontend: $_"
                $frontendStatus = 'SKIPPED'
            }
        }
    }
}
else { Write-Warning "Frontend directory not found: $frontendDir"; $frontendStatus = 'SKIPPED' }

# Final summary
if (-not $postgresStatus) { $postgresStatus = 'SKIPPED' }
if (-not $backendStatus) { $backendStatus = 'SKIPPED' }
if (-not $frontendStatus) { $frontendStatus = 'SKIPPED' }
if (-not $adminerStatus) { $adminerStatus = 'SKIPPED' }

Write-Host "`nPostgreSQL: $postgresStatus"
Write-Host "Backend:    $backendStatus"
Write-Host "Frontend:   $frontendStatus"
Write-Host "DB UI:      $adminerStatus"

Write-Host "`nLog files: ..\logs\$(Split-Path $backendOutLog -Leaf) ..\logs\$(Split-Path $backendErrLog -Leaf) ..\logs\$(Split-Path $frontendOutLog -Leaf) ..\logs\$(Split-Path $frontendErrLog -Leaf)"
Write-Host "Frontend: http://localhost:5173   Backend: http://localhost:8080"
