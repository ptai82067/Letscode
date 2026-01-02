$ports = @(5173,4173,3000,8080)
foreach($p in $ports){
  $url = "http://localhost:$p/"
  try{
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "FRONTEND OK: $url -> $($r.StatusCode) Length:$($r.RawContentLength)"
  } catch {
    Write-Host "FRONTEND NO: $url -> $($_.Exception.Message)"
  }
}
$base = 'http://localhost:8080/api'
try{
  $prog = Invoke-RestMethod -Method Get -Uri "$base/admin/programs" -ErrorAction Stop
  Write-Host "Programs count: $($prog | Measure-Object).Count"
} catch {
  Write-Host "Programs API error: $($_.Exception.Message)"
}
try{
  $subs = Invoke-RestMethod -Method Get -Uri "$base/admin/subcourses" -ErrorAction Stop
  Write-Host "Subcourses count: $($subs | Measure-Object).Count"
} catch {
  Write-Host "Subcourses API error: $($_.Exception.Message)"
}
try{
  $less = Invoke-RestMethod -Method Get -Uri "$base/admin/lessons" -ErrorAction Stop
  Write-Host "Lessons count: $($less | Measure-Object).Count"
} catch {
  Write-Host "Lessons API error: $($_.Exception.Message)"
}
