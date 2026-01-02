<#
Start development environment on Windows (PowerShell).
Runs frontend and backend when available. This script is permissive: it will warn if Docker/Go/Node are missing
but will continue to start any components that are available so you can run a single command:

  powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1

This script does NOT modify project files.
#>

Write-Host "== CourseAI dev starter =="

# Ensure script runs from repository root
Push-Location -LiteralPath (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)
Push-Location ..

function Test-Command($name) {
    return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null
}

Write-Host "Checking Docker..."
if (Test-Command docker) {
    Write-Host "Starting PostgreSQL via docker-compose..."
    docker-compose -f .\docker-compose.yml up -d

    Write-Host "Waiting for Postgres to become ready (container: courseai_postgres)..."
    $tries = 0
    while ($tries -lt 30) {
        # if container not present, break
        $exists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^courseai_postgres$" -Quiet
        if (-not $exists) { Write-Warning "Postgres container not found after startup."; break }
        docker exec courseai_postgres pg_isready -U postgres > $null 2>&1
        if ($LASTEXITCODE -eq 0) { Write-Host "Postgres is ready."; break }
        Start-Sleep -Seconds 2
        $tries++
    }
    if ($tries -ge 30) { Write-Warning "Postgres readiness check timed out. Check container logs." }
} else {
    Write-Warning "Docker not found or not accessible. Skipping Postgres startup. Continue to start available components."
}

Write-Host "Checking Go..."
if (Test-Command go) {
    Write-Host "Starting backend (go run cmd/server/main.go) in background..."
    Push-Location backend
    # Start backend in a new background PowerShell window (minimized)
    Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -NoExit -Command cd `"$(Get-Location)`"; go run cmd/server/main.go" -WorkingDirectory (Get-Location) -WindowStyle Minimized
    Pop-Location
} else {
    Write-Warning "Go not found. Backend will not be started. Install Go 1.21+ to run backend locally."
}

Write-Host "Starting frontend (Vite)..."
Push-Location frontend
if (-Not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..."
    npm install
}
if (Test-Command npm) {
    Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -NoExit -Command cd `"$(Get-Location)`"; npm run dev" -WorkingDirectory (Get-Location) -WindowStyle Minimized
    Write-Host "Frontend dev server launched. Open http://localhost:5173 in your browser."
} else {
    Write-Warning "npm not found. Cannot start frontend. Install Node.js and rerun."
}
Pop-Location

Pop-Location

Write-Host "Done. If any component failed to start, check the warnings above and run the appropriate install steps." 
