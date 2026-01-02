<#
Check whether `go` is available on PATH and help add the common install path to the current session.

Usage:
  powershell -ExecutionPolicy Bypass -File .\scripts\check-go.ps1
#>

function Has-Command($name) { (Get-Command $name -ErrorAction SilentlyContinue) -ne $null }

Write-Host "== check-go.ps1: verify Go toolchain availability =="

if (Has-Command go) {
    Write-Host "Go found:" -NoNewline; go version
    exit 0
}

Write-Warning "'go' not found on PATH in this session."

# Common default install path for Go on Windows
$common = 'C:\Program Files\Go\bin'
if (Test-Path $common) {
    Write-Host "Found Go binaries at: $common"
    $resp = Read-Host "Add '$common' to the current session PATH now? (Y/N)"
    if ($resp.Trim().ToUpper() -eq 'Y') {
        $env:PATH = "$common;" + $env:PATH
        Write-Host "Added to PATH for current session. New 'go' check:"; Start-Sleep -Seconds 1
        if (Has-Command go) { Write-Host "Go available:" -NoNewline; go version; exit 0 }
        else { Write-Warning "Even after adding, 'go' is not available. Try restarting your terminal."; exit 1 }
    } else {
        Write-Host "Skipping session PATH update. To make 'go' available, either restart your shell or add '$common' to your User PATH."
        exit 1
    }
} else {
    Write-Host "No Go binaries found at the common path: $common"
    Write-Host "If you installed Go via the MSI, please restart your PowerShell or sign out/in so the PATH updates take effect."
    Write-Host "To persistently add Go to your User PATH now (powershell elevated not required):"
    Write-Host "  [Environment]::SetEnvironmentVariable('Path', $env:Path + ';C:\Program Files\Go\bin', 'User')"
    Write-Host "After that, restart your PowerShell and run: go version"
    exit 1
}
