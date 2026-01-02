$base = 'http://localhost:8080/api'
$creds = @{ username = 'admin123'; password = 'admin123' } | ConvertTo-Json
try {
  $login = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $creds -ContentType 'application/json' -ErrorAction Stop
  Write-Host "Login OK, token length: $($login.token.Length)"
  $hdr = @{ Authorization = "Bearer $($login.token)" }
  $prog = Invoke-RestMethod -Method Get -Uri "$base/admin/programs" -Headers $hdr -ErrorAction Stop
  $progCount = ($prog | Measure-Object).Count
  Write-Host "Programs count: $progCount"
  $subs = Invoke-RestMethod -Method Get -Uri "$base/admin/subcourses" -Headers $hdr -ErrorAction Stop
  $subsCount = ($subs | Measure-Object).Count
  Write-Host "Subcourses count: $subsCount"
  $less = Invoke-RestMethod -Method Get -Uri "$base/admin/lessons" -Headers $hdr -ErrorAction Stop
  $lessCount = ($less | Measure-Object).Count
  Write-Host "Lessons count: $lessCount"
} catch {
  Write-Host "API/auth error: $($_.Exception.Message)"
  exit 1
}
