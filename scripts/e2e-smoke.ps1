$base='http://localhost:8080/api'
$creds = @{username='admin123'; password='admin123'} | ConvertTo-Json
try {
  $login = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Body $creds -ContentType 'application/json' -ErrorAction Stop
} catch {
  Write-Host 'Login failed:' $_.Exception.Message
  exit 2
}
$token = $login.token
Write-Host "Token: $token"
$hdr = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }
$ts = (Get-Date).ToString('yyyyMMddHHmmss')
$progObj = @{ name = "E2E Program $ts"; slug = "e2e-program-$ts"; short_description = "Created by e2e self-test" } | ConvertTo-Json
$createdProg = Invoke-RestMethod -Method Post -Uri "$base/admin/programs" -Body $progObj -Headers $hdr -ContentType 'application/json' -ErrorAction Stop
Write-Host "Created Program ID: $($createdProg.id)"
$subObj = @{ program_id = $createdProg.id; name = "E2E Subcourse $ts"; slug = "e2e-subcourse-$ts"; age_range = "6-8" } | ConvertTo-Json
$createdSub = Invoke-RestMethod -Method Post -Uri "$base/admin/subcourses" -Body $subObj -Headers $hdr -ContentType 'application/json' -ErrorAction Stop
Write-Host "Created Subcourse ID: $($createdSub.id)"
$lesObj = @{ subcourse_id = $createdSub.id; title = "E2E Lesson $ts"; slug = "e2e-lesson-$ts"; overview = "Auto-created lesson" } | ConvertTo-Json
$createdLes = Invoke-RestMethod -Method Post -Uri "$base/admin/lessons" -Body $lesObj -Headers $hdr -ContentType 'application/json' -ErrorAction Stop
Write-Host "Created Lesson ID: $($createdLes.id)"
Write-Host '--- Fetch programs list ---'
$all = Invoke-RestMethod -Method Get -Uri "$base/admin/programs" -Headers $hdr
$all | ConvertTo-Json -Depth 5 | Write-Host
Write-Host '--- Fetch program subcourses ---'
$ps = Invoke-RestMethod -Method Get -Uri "$base/admin/programs/$($createdProg.id)/subcourses" -Headers $hdr
$ps | ConvertTo-Json -Depth 5 | Write-Host
Write-Host '--- Fetch subcourse lessons ---'
$ls = Invoke-RestMethod -Method Get -Uri "$base/admin/subcourses/$($createdSub.id)/lessons" -Headers $hdr
$ls | ConvertTo-Json -Depth 5 | Write-Host
Write-Host '--- Fetch lesson detail ---'
$ld = Invoke-RestMethod -Method Get -Uri "$base/admin/lessons/$($createdLes.id)" -Headers $hdr
$ld | ConvertTo-Json -Depth 7 | Write-Host
Write-Host 'Smoke test complete.'
