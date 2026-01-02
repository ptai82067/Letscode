# E2E script: create -> get -> update -> delete a lesson
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\e2e-lessons.ps1

$base = 'http://localhost:8080'
$adminUser = 'admin123'
$adminPass = 'admin123'

Write-Output "Starting Lessons E2E against $base"

function ExitWith($code, $msg) {
    Write-Error $msg
    exit $code
}

# Login
$loginBody = @{ username = $adminUser; password = $adminPass } | ConvertTo-Json
try {
    $login = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType 'application/json' -Body $loginBody -ErrorAction Stop
} catch {
    ExitWith 2 "Login failed: $($_.Exception.Message)"
}
$token = $login.token
if (-not $token) { ExitWith 3 "No token returned from login" }
Write-Output "Authenticated; token length: $($token.Length)"

# Build unique slug
$ts = [DateTime]::UtcNow.ToString('yyyyMMddHHmmss')
$slug = "e2e-lesson-$ts"

$payload = @{
    subcourse_id = 'ae99abc0-fae8-44d7-905d-b22d92bbb880'
    title = "E2E Lesson $ts"
    slug = $slug
    status = 'draft'
    block_types = @('text')
    overview = "E2E test lesson created at $ts"
} | ConvertTo-Json -Depth 6

# Create
try {
    $create = Invoke-RestMethod -Method Post -Uri "$base/api/admin/lessons" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $payload -ErrorAction Stop
} catch {
    ExitWith 4 "Create failed: $($_.Exception.Message)"
}
$lessonId = $create.id
if (-not $lessonId) { ExitWith 5 "No lesson id returned from create" }
Write-Output "Created lesson: $lessonId"

# Get
try {
    $got = Invoke-RestMethod -Method Get -Uri "$base/api/admin/lessons/$lessonId" -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
} catch {
    ExitWith 6 "Get failed: $($_.Exception.Message)"
}
Write-Output "GET returned title: $($got.title) and objectives count: $($got.objectives.Count)"

# Update title
$updateBody = @{ title = "E2E Lesson Updated $ts" } | ConvertTo-Json
try {
    $upd = Invoke-RestMethod -Method Put -Uri "$base/api/admin/lessons/$lessonId" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $updateBody -ErrorAction Stop
} catch {
    ExitWith 7 "Update failed: $($_.Exception.Message)"
}
Write-Output "Updated lesson title"

# Confirm update
try {
    $got2 = Invoke-RestMethod -Method Get -Uri "$base/api/admin/lessons/$lessonId" -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
} catch {
    ExitWith 8 "Get after update failed: $($_.Exception.Message)"
}
if ($got2.title -ne "E2E Lesson Updated $ts") { ExitWith 9 "Title did not update: $($got2.title)" }
Write-Output "Update confirmed"

# Delete
try {
    Invoke-RestMethod -Method Delete -Uri "$base/api/admin/lessons/$lessonId" -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
} catch {
    ExitWith 10 "Delete failed: $($_.Exception.Message)"
}
Write-Output "Deleted lesson $lessonId"

# Confirm delete (expect 4xx or empty)
try {
    Invoke-RestMethod -Method Get -Uri "$base/api/admin/lessons/$lessonId" -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
    ExitWith 11 "Lesson still exists after delete"
} catch {
    Write-Output "Confirmed deletion (GET returned error as expected): $($_.Exception.Message)"
}

Write-Output "E2E script completed successfully"
exit 0
