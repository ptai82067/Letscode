$urls = @(
  'http://localhost:5173/',
  'http://localhost:5173/admin/programs',
  'http://localhost:5173/admin/subcourses',
  'http://localhost:5173/admin/lessons'
)

foreach($u in $urls){
  try{
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "$u -> $($r.StatusCode) len:$($r.RawContentLength)"
  } catch {
    Write-Host "$u -> ERR: $($_.Exception.Message)"
  }
}
