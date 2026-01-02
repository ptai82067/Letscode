<#
Setup prerequisites on Windows for CourseAI development.

What it does:
- Installs VS Code extensions for Docker and Go (if `code` CLI is available).
- If `winget` is available and script is run elevated, optionally installs Docker Desktop and Go.

Usage (run as admin if you want winget installs):
  powershell -ExecutionPolicy Bypass -File .\scripts\setup-prereqs.ps1 [-InstallWithWinget]

Notes:
- Installing Docker Desktop and Go requires admin and user consent; the script will attempt to use winget if requested.
- The script does not change project files.
#>

param(
    [switch]$InstallWithWinget
)

function Has-Command($name) {
    return (Get-Command $name -ErrorAction SilentlyContinue) -ne $null
}

Write-Host "== CourseAI prerequisite installer =="

if (Has-Command code) {
    Write-Host "Installing VS Code extensions..."
    code --install-extension ms-azuretools.vscode-docker --force
    code --install-extension golang.go --force
    Write-Host "Installed Docker and Go extensions for VS Code (if not present)."
} else {
    Write-Warning "VS Code 'code' CLI not found. To install extensions, open VS Code and run: code --install-extension ms-azuretools.vscode-docker"
}

if ($InstallWithWinget) {
    Write-Warning "Automatic install via winget is disabled in this repo by policy. Please install Docker Desktop and Go manually if needed."
}

Write-Host "Done. If you installed Docker Desktop, start it and then run: powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1"

if (-not (Has-Command go)) {
    Write-Warning "Go toolchain not found on PATH. Please install Go manually from https://go.dev/dl/ and restart your shell. Backend will be skipped until Go is available."
} else {
    Write-Host "Go is already installed."
}
