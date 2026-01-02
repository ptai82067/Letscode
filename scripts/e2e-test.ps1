<#
Updated E2E test script for CourseAI focused on lesson flows.
Usage: run after backend is running at http://localhost:8080
This script:
 - logs in as admin
 - creates a program and subcourse
 - creates a lesson with nested objectives and a content block
 - fetches the created lesson, updates its title, verifies update
 - deletes the lesson, subcourse, and program
 - prints success/failure for each step
#>

$Base = "http://localhost:8080/api"
$cred = @{ username = 'admin123'; password = 'admin123' }
Write-Host "Logging in..."
$login = Invoke-RestMethod -Uri "$Base/auth/login" -Method Post -Body ($cred | ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop
$token = $login.token
if (-not $token) { Write-Error "Login failed or token missing"; exit 1 }
$headers = @{ Authorization = "Bearer $token" }

function PostJson($url, $obj){ Invoke-RestMethod -Uri $url -Method Post -Body ($obj | ConvertTo-Json -Depth 10) -ContentType 'application/json' -Headers $headers -ErrorAction Stop }
function PutJson($url, $obj){ Invoke-RestMethod -Uri $url -Method Put -Body ($obj | ConvertTo-Json -Depth 10) -ContentType 'application/json' -Headers $headers -ErrorAction Stop }
function Delete($url){ Invoke-RestMethod -Uri $url -Method Delete -Headers $headers -ErrorAction Stop }

try {
    Write-Host "Creating program..."
    $progPayload = @{ name = "E2E Program"; slug = "e2e-program-$(Get-Random)"; status = 'draft' }
    $prog = PostJson "$Base/admin/programs" $progPayload
    Write-Host "Program created: $($prog.id)"

    Write-Host "Creating subcourse..."
    $subPayload = @{ program_id = $prog.id; name = "E2E Subcourse"; slug = "e2e-sub-$(Get-Random)"; status='draft' }
    $sub = PostJson "$Base/admin/subcourses" $subPayload
    Write-Host "Subcourse created: $($sub.id)"

    Write-Host "Creating lesson with nested objectives..."
    $lessonPayload = @{
        subcourse_id = $sub.id
        title = "E2E Lesson"
        slug = "e2e-lesson-$(Get-Random)"
        status = 'draft'
        objectives = @{ knowledge = 'K'; thinking = 'T'; skills = 'S'; attitude = 'A' }
        content_blocks = @( @{ title = 'Block 1'; description = 'Content block' } )
    }
    $lesson = PostJson "$Base/admin/lessons" $lessonPayload
    Write-Host "Lesson created: $($lesson.id)"

    Write-Host "Fetching created lesson..."
    $fetched = Invoke-RestMethod -Uri "$Base/admin/lessons/$($lesson.id)" -Method Get -Headers $headers -ErrorAction Stop
    if ($fetched.id -ne $lesson.id) { throw "Fetched lesson ID mismatch" }
    Write-Host "Fetched lesson OK"

    Write-Host "Updating lesson title..."
    $updatePayload = @{ title = "E2E Lesson Updated" }
    $updated = PutJson "$Base/admin/lessons/$($lesson.id)" $updatePayload
    if ($updated.title -ne "E2E Lesson Updated") { throw "Lesson update failed" }
    Write-Host "Lesson update OK"

    Write-Host "Deleting lesson..."
    Delete "$Base/admin/lessons/$($lesson.id)"
    Write-Host "Lesson deleted"

    Write-Host "Deleting subcourse..."
    Delete "$Base/admin/subcourses/$($sub.id)"
    Write-Host "Subcourse deleted"

    Write-Host "Deleting program..."
    Delete "$Base/admin/programs/$($prog.id)"
    Write-Host "Program deleted"

    Write-Host "E2E lesson flow completed successfully."
} catch {
    Write-Error "E2E failed: $($_.Exception.Message)"
    exit 1
}