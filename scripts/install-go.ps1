<#
Automatic Go installer for Windows

This script attempts to install Go in the following order:
1. If `go` is already on PATH, do nothing.
2. Use `winget` to install `Go.Go` if available.
3. Use `choco` to install `golang` if available.
4. Fallback: download the latest Windows amd64 MSI from go.dev and run the installer.

Run as admin when possible. The script will try to elevate when running the MSI.
#>

function Has-Command($name) { (Get-Command $name -ErrorAction SilentlyContinue) -ne $null }

Write-Host "== install-go.ps1: ensure Go is installed =="

if (Has-Command go) {
    $path = (Get-Command go).Path
    Write-Host "Go already installed at: $path"
    exit 0
}

if (Has-Command winget) {
    Write-Host "Installing Go via winget..."
    try {
        winget install --id Go.Go -e --accept-package-agreements --accept-source-agreements
    } catch {
        Write-Warning "winget install failed: $_"
    }
    Start-Sleep -Seconds 2
    if (Has-Command go) { Write-Host "Go installed successfully via winget."; exit 0 }
}

if (Has-Command choco) {
    Write-Host "Installing Go via Chocolatey..."
    try {
        choco install golang -y
    } catch {
        Write-Warning "choco install failed: $_"
    }
    Start-Sleep -Seconds 2
    if (Has-Command go) { Write-Host "Go installed successfully via Chocolatey."; exit 0 }
}

Write-Host "No winget/choco found or automated install failed. Attempting to download latest Go MSI..."
try {
    $json = Invoke-RestMethod 'https://go.dev/dl/?mode=json'
    if (-not $json -or $json.Count -eq 0) { throw "No release info from go.dev" }
    $release = $json | Select-Object -First 1
    $file = $release.files | Where-Object { $_.os -eq 'windows' -and $_.arch -eq 'amd64' -and $_.kind -eq 'installer' } | Select-Object -First 1
    if (-not $file -or -not $file.url) { throw "No windows/amd64 installer found in release metadata" }
    $url = "https://go.dev$file.url"
    $tmp = Join-Path $env:TEMP "go-installer.msi"
    Write-Host "Downloading $url to $tmp ..."
    Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing
    Write-Host "Running MSI installer (may prompt for elevation)..."
    $args = '/i', $tmp, '/qn'
    Start-Process msiexec.exe -ArgumentList $args -Wait -Verb RunAs
    Start-Sleep -Seconds 2
    if (Has-Command go) { Write-Host "Go installed successfully."; exit 0 }
    Write-Warning "Installer finished but 'go' not found on PATH. You may need to restart your terminal."; exit 1
} catch {
    Write-Warning "Automatic download/install failed: $_"
    Write-Host "Please install Go manually from https://go.dev/dl/ and ensure 'go' is on your PATH."
    exit 1
}
