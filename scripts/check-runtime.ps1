Write-Host "=== Runtime status checks ==="

Write-Host "\n1) Docker / Postgres container"
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $c = docker ps --filter "name=courseai_postgres" --format "{{.Names}}" 2>$null
    if ($c) { Write-Host "-> Postgres container running:" $c } else { Write-Host "-> Postgres container NOT running" }
} else {
    Write-Host "-> Docker not available on this machine"
}

Write-Host "\n2) Backend (port 8080)"
try {
    $b = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue
    if ($b.TcpTestSucceeded) { Write-Host "-> Backend reachable on port 8080" } else { Write-Host "-> Backend NOT reachable on port 8080" }
} catch {
    Write-Host "-> Backend check failed: $($_.Exception.Message)"
}

Write-Host "\n3) Frontend (port 5173)"
try {
    $f = Test-NetConnection -ComputerName localhost -Port 5173 -WarningAction SilentlyContinue
    if ($f.TcpTestSucceeded) { Write-Host "-> Frontend reachable on port 5173" } else { Write-Host "-> Frontend NOT reachable on port 5173" }
} catch {
    Write-Host "-> Frontend check failed: $($_.Exception.Message)"
}
