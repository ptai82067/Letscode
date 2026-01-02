$ports=@(8080..8087 + 5173..5185 + 8082)
foreach($p in $ports){
    $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($conns){
        $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
        foreach($ownPid in $pids){
            $proc = Get-Process -Id $ownPid -ErrorAction SilentlyContinue
            $name = if($proc){ $proc.ProcessName } else { 'N/A' }
            Write-Host "Port $p -> PID $ownPid ($name)"
        }
    } else {
        Write-Host "Port $p -> (no listener)"
    }
}
