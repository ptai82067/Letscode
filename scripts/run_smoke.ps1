$login = curl.exe -s -X POST "http://localhost:8080/api/auth/login" -H "Content-Type: application/json" --data @d:/CousreAI/scripts/smoke_login.json
$token = ($login | ConvertFrom-Json).token
Write-Output "TOKEN:"
Write-Output $token
$response = curl.exe -s -X POST "http://localhost:8080/api/admin/lessons" -H "Content-Type: application/json" -H "Authorization: Bearer $token" --data @d:/CousreAI/scripts/smoke_lesson.json -w "`nHTTPSTATUS:%{http_code}`n"
Write-Output "--- RESPONSE ---"
Write-Output $response
Write-Output "--- LOG TAIL ---"
Get-Content d:/CousreAI/logs/backend.out.log -Tail 200 | ForEach-Object { Write-Output $_ }
