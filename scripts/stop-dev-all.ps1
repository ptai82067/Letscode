<#
Stop dev services started by start-dev-all.ps1.

Behavior:
- Kill processes listening on backend/frontend ports by resolving PIDs from ports
- Kill entire process trees (taskkill /T /F)
- Wait until ports are free (with timeout)
- Run `docker-compose down`
- Fail if ports remain occupied after timeout

Run from repo root:
  powershell -ExecutionPolicy Bypass -File .\scripts\stop-dev-all.ps1
#>

function Stop-ByPortAndWait($port, $timeoutSeconds) {
    try {
        $start = Get-Date
        # find any owning PIDs for the port
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) {
            $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($ownPid in $pids) {
                Write-Host "Killing PID $ownPid (port $port) and its child processes..."
                try {
                    & taskkill /PID $ownPid /T /F > $null 2>&1
                } catch { }
            }
            # Wait until port is free or timeout
            while ((Get-Date) -lt $start.AddSeconds($timeoutSeconds)) {
                $test = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -WarningAction SilentlyContinue
                if (-not ($test -and $test.TcpTestSucceeded)) { return $true }
                Start-Sleep -Milliseconds 500
            }
            return $false
        } else {
            return $true
        }
    } catch {
        return $false
    }
}

Write-Host "== stop-dev-all.ps1: stopping services =="

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Kill backend ports 8080..8090
$backendPorts = 8080..8090
$backendOk = $true
$backendPids = @()
foreach ($p in $backendPorts) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) { $backendPids += ($conns | Select-Object -ExpandProperty OwningProcess -Unique) }
}
$backendPids = $backendPids | Select-Object -Unique
foreach ($procId in $backendPids) {
    Write-Host "Stopping backend PID $procId"
    try { & taskkill /PID $procId /T /F > $null 2>&1 } catch { Write-Warning "taskkill failed for PID $procId" }
}
# Wait until all backend ports are free
foreach ($p in $backendPorts) {
    $res = Stop-ByPortAndWait -port $p -timeoutSeconds 20
    if (-not $res) { $backendOk = $false; Write-Error "Failed to free backend port $p within timeout" }
}

# Kill frontend ports 5173..5185
$frontendPorts = 5173..5185
$frontendOk = $true
$frontendPids = @()
foreach ($p in $frontendPorts) {
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns) { $frontendPids += ($conns | Select-Object -ExpandProperty OwningProcess -Unique) }
}
$frontendPids = $frontendPids | Select-Object -Unique
foreach ($procId in $frontendPids) {
    Write-Host "Stopping frontend PID $procId"
    try { & taskkill /PID $procId /T /F > $null 2>&1 } catch { Write-Warning "taskkill failed for PID $procId" }
}
# Wait until all frontend ports are free
foreach ($p in $frontendPorts) {
    $res = Stop-ByPortAndWait -port $p -timeoutSeconds 15
    if (-not $res) { $frontendOk = $false; Write-Error "Failed to free frontend port $p within timeout" }
}

# Kill Adminer host port 8082 if any process bound
$adminOk = $true
$adminPids = @(Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($procId in $adminPids) {
    Write-Host "Stopping adminer PID $procId"
    try { & taskkill /PID $procId /T /F > $null 2>&1 } catch { Write-Warning "taskkill failed for PID $procId" }
}
if (-not (Stop-ByPortAndWait -port 8082 -timeoutSeconds 15)) { $adminOk = $false; Write-Error "Failed to free Adminer port 8082 within timeout" }

# Bring down docker-compose services (postgres + adminer)
if ((Get-Command docker -ErrorAction SilentlyContinue) -ne $null) {
    try {
        docker-compose down
    } catch { Write-Warning "docker-compose down failed: $_" }
} else { Write-Warning "Docker CLI not found; cannot run docker-compose down." }

if (-not $backendOk -or -not $frontendOk -or -not $adminOk) {
    # As a final fallback, attempt to kill lingering 'main' and 'node' processes whose
    # command line references this repository path.
    $repoPath = (Split-Path -Parent $MyInvocation.MyCommand.Path) -replace "\\scripts$",""
    try {
        $procs = Get-CimInstance Win32_Process | Where-Object { ($_.Name -in @('main.exe','node.exe','node')) -and ($_.CommandLine -and $_.CommandLine -like "*$repoPath*") }
        foreach ($p in $procs) {
            Write-Host "Final fallback killing PID $($p.ProcessId) ($($p.Name))"
            try { & taskkill /PID $($p.ProcessId) /T /F > $null 2>&1 } catch { }
        }
    } catch { }

    # Re-check ports and list remaining owners
    $stillOccupied = @()
    foreach ($p in ($backendPorts + $frontendPorts + 8082)) {
        $t = Test-NetConnection -ComputerName 127.0.0.1 -Port $p -WarningAction SilentlyContinue
        if ($t -and $t.TcpTestSucceeded) {
            $owners = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
            $stillOccupied += @{Port=$p; PIDs=$owners}
        }
    }
    if ($stillOccupied.Count -gt 0) {
        foreach ($o in $stillOccupied) {
            Write-Error ("Port {0} still occupied by PIDs: {1}" -f $o.Port, ($o.PIDs -join ','))
        }
        Write-Error "One or more ports remained occupied after stop; manual intervention required"
        exit 1
    }
}

Write-Host "`nPostgreSQL: STOPPED"
Write-Host "Backend:    STOPPED"
Write-Host "Frontend:   STOPPED"
Write-Host "DB UI:      STOPPED"
