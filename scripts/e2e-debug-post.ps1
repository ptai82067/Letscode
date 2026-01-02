$base = 'http://localhost:8080'
Write-Output "Debug POST to $base/api/admin/lessons"

$login = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType 'application/json' -Body (ConvertTo-Json @{ username='admin123'; password='admin123' })
$token = $login.token
if (-not $token) { Write-Error "No token"; exit 2 }
$ts = [DateTime]::UtcNow.ToString('yyyyMMddHHmmss')
$payloadObj = @{
    subcourse_id = 'ae99abc0-fae8-44d7-905d-b22d92bbb880'
    title = "E2E Test $ts"
    slug = "e2e-lesson-$ts"
    status = 'draft'
    block_types = @('text')
    overview = 'E2E test'
    objectives = @(@{ title='Obj1'; description='d1'})
}
$payload = $payloadObj | ConvertTo-Json -Depth 8

$client = New-Object System.Net.Http.HttpClient
$req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Post, "$base/api/admin/lessons")
$req.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer',$token)
$req.Content = New-Object System.Net.Http.StringContent($payload, [System.Text.Encoding]::UTF8, 'application/json')
$res = $client.SendAsync($req).Result
Write-Output "Status: $($res.StatusCode)"
$body = $res.Content.ReadAsStringAsync().Result
Write-Output "Body:"
Write-Output $body
