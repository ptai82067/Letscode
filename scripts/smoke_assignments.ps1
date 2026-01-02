$ErrorActionPreference = 'Stop'

# =========================
# ASSERT HELPERS
# =========================
function Assert-True($condition, $message) {
    if (-not $condition) {
        Write-Host "❌ ASSERT FAILED: $message" -ForegroundColor Red
        exit 1
    }
    else {
        Write-Host "✅ $message" -ForegroundColor Green
    }
}

function Assert-Equal($actual, $expected, $message) {
    if ($actual -ne $expected) {
        Write-Host "❌ ASSERT FAILED: $message (expected=$expected, actual=$actual)" -ForegroundColor Red
        exit 1
    }
    else {
        Write-Host "✅ $message" -ForegroundColor Green
    }
}

function Assert-Throws($scriptBlock, $expectedMessage) {
    try {
        & $scriptBlock
        Write-Host "❌ ASSERT FAILED: Expected error '$expectedMessage'" -ForegroundColor Red
        exit 1
    }
    catch {
        Assert-True ($_.Exception.Message -match $expectedMessage) `
            "Error contains '$expectedMessage'"
    }
}

# =========================
# BASE
# =========================
$base = 'http://localhost:8080'
Write-Output "Base URL: $base"

# =========================
# ADMIN LOGIN
# =========================
Write-Output "`n== Login as admin =="

$adm = Invoke-RestMethod `
    -Uri "$base/api/auth/login" `
    -Method Post `
    -Body (@{ username = 'admin123'; password = 'admin123' } | ConvertTo-Json) `
    -ContentType 'application/json'

Assert-True ($adm.token) "Admin login returns token"

$hdr = @{ Authorization = "Bearer $($adm.token)" }

# =========================
# FETCH PROGRAM
# =========================
Write-Output "`n== Fetch programs =="

$programs = Invoke-RestMethod `
    -Uri "$base/api/programs" `
    -Headers $hdr `
    -UseBasicParsing

Assert-True ($programs.Count -gt 0) "Programs exist"

$progId = $programs[0].id
Write-Output "Using program id: $progId"

# =========================
# FETCH SUBCOURSE (ADMIN)
# =========================
Write-Output "`n== Fetch subcourses for program (admin) =="

$subcourses = Invoke-RestMethod `
    -Uri "$base/api/admin/programs/$progId/subcourses" `
    -Headers $hdr `
    -UseBasicParsing

Assert-True ($subcourses.Count -gt 0) "Admin can fetch subcourses"

$subId = $subcourses[0].id
Write-Output "Using subcourse id: $subId"

# =========================
# ENSURE TEACHERS
# =========================
Write-Output "`n== Ensure teacher accounts exist =="

$allTeachers = Invoke-RestMethod `
    -Uri "$base/api/admin/teachers" `
    -Headers $hdr `
    -UseBasicParsing

function EnsureTeacher($username, $email) {
    $found = $allTeachers | Where-Object { $_.username -eq $username }
    if ($found) {
        Write-Output "Found teacher $username"
        return $found
    }

    Invoke-RestMethod `
        -Uri "$base/api/admin/teachers" `
        -Method Post `
        -Headers $hdr `
        -Body (@{
            username = $username
            email    = $email
            password = 'pass1234'
        } | ConvertTo-Json) `
        -ContentType 'application/json'
}

$tSub = EnsureTeacher 'teach_sub'  'teach_sub@test.local'
$tProg = EnsureTeacher 'teach_prog' 'teach_prog@test.local'
$tBoth = EnsureTeacher 'teach_both' 'teach_both@test.local'

# =========================
# ASSIGNMENTS
# =========================
Write-Output "`n== Assignments =="

# Clear any previous assignments for the teachers, then set intended assignments
foreach ($t in @($tSub, $tProg, $tBoth)) {
    # clear program and subcourse assignments
    Invoke-RestMethod -Uri "$base/api/admin/teachers/$($t.id)/program-assignments" -Method Put -Headers $hdr -Body (@{ program_ids = @() } | ConvertTo-Json) -ContentType 'application/json' | Out-Null
    Invoke-RestMethod -Uri "$base/api/admin/teachers/$($t.id)/subcourse-assignments" -Method Put -Headers $hdr -Body (@{ subcourse_ids = @() } | ConvertTo-Json) -ContentType 'application/json' | Out-Null
}

# assign specific scopes
Invoke-RestMethod -Uri "$base/api/admin/teachers/$($tSub.id)/subcourse-assignments" -Method Put -Headers $hdr -Body (@{ subcourse_ids = @($subId) } | ConvertTo-Json) -ContentType 'application/json' | Out-Null
Invoke-RestMethod -Uri "$base/api/admin/teachers/$($tProg.id)/program-assignments" -Method Put -Headers $hdr -Body (@{ program_ids = @($progId) } | ConvertTo-Json) -ContentType 'application/json' | Out-Null
Invoke-RestMethod -Uri "$base/api/admin/teachers/$($tBoth.id)/program-assignments" -Method Put -Headers $hdr -Body (@{ program_ids = @($progId) } | ConvertTo-Json) -ContentType 'application/json' | Out-Null
Invoke-RestMethod -Uri "$base/api/admin/teachers/$($tBoth.id)/subcourse-assignments" -Method Put -Headers $hdr -Body (@{ subcourse_ids = @($subId) } | ConvertTo-Json) -ContentType 'application/json' | Out-Null

# =========================
# TEST AS TEACHER
# =========================
function TestAs($username, $expectSubCount) {
    Write-Output "`n===== Testing as $username ====="

    $login = Invoke-RestMethod `
        -Uri "$base/api/auth/login" `
        -Method Post `
        -Body (@{ username = $username; password = 'pass1234' } | ConvertTo-Json) `
        -ContentType 'application/json'

    Assert-True ($login.token) "$username login OK"

    $th = @{ Authorization = "Bearer $($login.token)" }

    $subs = Invoke-RestMethod `
        -Uri "$base/api/subcourses" `
        -Headers $th `
        -UseBasicParsing

    Assert-Equal $subs.Count $expectSubCount "$username sees correct subcourse count"

    if ($expectSubCount -gt 0) {
        Assert-Equal $subs[0].id $subId "$username sees assigned subcourse only"
    }

    Assert-Throws {
        Invoke-RestMethod `
            -Uri "$base/api/admin/programs/$progId/subcourses" `
            -Headers $th `
            -UseBasicParsing
    } "Access denied"
}

TestAs 'teach_sub'  1
TestAs 'teach_prog' 1
TestAs 'teach_both' 1

Write-Host "`n🎉 ALL SMOKE ASSERTS PASSED" -ForegroundColor Cyan
