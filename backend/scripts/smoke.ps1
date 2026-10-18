# Smoke test end-to-end del backend Kooler.
#
# Requisitos:
#   1) Postgres levantado:   docker compose up -d
#   2) Backend corriendo:    npm run start  (o npm run start:dev)
#
# Uso:
#   npm run smoke
#   o bien:  powershell -ExecutionPolicy Bypass -File ./scripts/smoke.ps1
#
# Credenciales demo (creadas por el seed):
#   organizador@icesi.edu.co / Password123!
#   estudiante@icesi.edu.co  / Password123!

param(
  [string]$BaseUrl = "http://localhost:3000/api",
  [string]$OrgEmail = "organizador@icesi.edu.co",
  [string]$StudentEmail = "estudiante@icesi.edu.co",
  [string]$Password = "Password123!"
)

$ErrorActionPreference = "Stop"
$script:fail = 0
$script:pass = 0

function Check {
  param([bool]$Condition, [string]$Message)
  if ($Condition) {
    Write-Host "  [OK]   $Message" -ForegroundColor Green
    $script:pass++
  } else {
    Write-Host "  [FAIL] $Message" -ForegroundColor Red
    $script:fail++
  }
}

function Invoke-Api {
  param($Method, $Path, $Body, $Token)
  $headers = @{}
  if ($Token) { $headers.Authorization = "Bearer $Token" }
  $params = @{ Uri = "$BaseUrl$Path"; Method = $Method; Headers = $headers }
  if ($null -ne $Body) {
    $params.ContentType = "application/json"
    $params.Body = ($Body | ConvertTo-Json -Depth 6)
  }
  return Invoke-RestMethod @params
}

function Get-StatusCode {
  param($Method, $Path, $Body, $Token)
  $headers = @{}
  if ($Token) { $headers.Authorization = "Bearer $Token" }
  $params = @{ Uri = "$BaseUrl$Path"; Method = $Method; Headers = $headers }
  if ($null -ne $Body) {
    $params.ContentType = "application/json"
    $params.Body = ($Body | ConvertTo-Json -Depth 6)
  }
  try {
    Invoke-WebRequest @params | Out-Null
    return 200
  } catch {
    return [int]$_.Exception.Response.StatusCode.value__
  }
}

Write-Host "== Kooler smoke test ($BaseUrl) ==" -ForegroundColor Cyan

# 0. Disponibilidad del backend
try {
  Invoke-WebRequest -Uri "$BaseUrl/activities" -Method Get | Out-Null
} catch {
  Write-Host "No se pudo contactar el backend en $BaseUrl." -ForegroundColor Red
  Write-Host "Levanta Postgres (docker compose up -d) y el backend (npm run start)." -ForegroundColor Yellow
  exit 2
}

# 1. Autenticacion
Write-Host "`n[1] Autenticacion y roles"
$org = Invoke-Api "POST" "/auth/login" @{ email = $OrgEmail; password = $Password } $null
$stu = Invoke-Api "POST" "/auth/login" @{ email = $StudentEmail; password = $Password } $null
$ot = $org.accessToken; $st = $stu.accessToken; $stuId = $stu.user.id
Check ($org.user.role -eq "ORGANIZADOR") "Login organizador (rol=$($org.user.role))"
Check ($stu.user.role -eq "ESTUDIANTE") "Login estudiante (id=$stuId, rol=$($stu.user.role))"

# 2. Actividad (F1)
Write-Host "`n[2] Funcionalidad 1: actividades e inscripciones"
$date = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
$deadline = (Get-Date).AddDays(29).ToString("s")
$act = Invoke-Api "POST" "/activities" @{
  name = "Smoke E2E $(Get-Date -Format 'HHmmss')"
  description = "Verificacion automatica"
  date = $date; startTime = "10:00"; endTime = "12:00"
  capacity = 5; registrationDeadline = $deadline; isCertifiable = $true
} $ot
$aid = $act.id
Check ($act.status -eq "ACTIVE") "Crear actividad (id=$aid, status=$($act.status))"
$enr = Invoke-Api "POST" "/activities/$aid/enroll" @{} $st
Check ([bool]$enr.enrollmentId) "Inscribir estudiante (enrollmentId=$($enr.enrollmentId))"
Check ((Get-StatusCode "POST" "/activities/$aid/enroll" @{} $st) -eq 400) "Inscripcion duplicada rechazada (400)"
Check ((Get-StatusCode "POST" "/activities" @{ name = "x"; description = "x"; date = $date; startTime = "10:00"; endTime = "11:00"; capacity = 1; registrationDeadline = $deadline } $st) -eq 403) "Estudiante no puede crear actividad (403)"

# 3. Sesion y asistencia (F3)
Write-Host "`n[3] Funcionalidad 3: sesiones, asistencia y certificados"
$sess = Invoke-Api "POST" "/activities/$aid/sessions" @{ sessionDate = $date; startTime = "10:00"; endTime = "12:00" } $ot
Check ([bool]$sess.id) "Crear sesion (id=$($sess.id))"
$final = Invoke-Api "PATCH" "/activities/$aid" @{ status = "FINISHED" } $ot
Check ($final.status -eq "FINISHED") "Finalizar actividad"
$att = Invoke-Api "POST" "/activities/$aid/sessions/$($sess.id)/attendance" @{ studentId = $stuId; status = "PRESENT" } $ot
Check ($att.status -eq "PRESENT") "Registrar asistencia (id=$($att.id))"
Check ((Get-StatusCode "POST" "/activities/$aid/sessions/$($sess.id)/attendance" @{ studentId = $stuId; status = "PRESENT" } $st) -eq 403) "Estudiante no puede registrar asistencia (403)"
$elig = Invoke-Api "GET" "/certificates/activities/$aid/eligibility" $null $st
Check ($elig.eligible -eq $true) "Elegibilidad de certificado ($($elig.attendancePercentage)%)"
$certs = @(Invoke-Api "GET" "/certificates" $null $st)
Check ($certs.Count -ge 1) "Certificado emitido (codigo=$($certs[0].certificateCode))"

# 4. Valoraciones e historial (F2)
Write-Host "`n[4] Funcionalidad 2: resenas e historial"
$rev = Invoke-Api "POST" "/reviews" @{ activityId = $aid; rating = 5; comment = "Smoke test" } $st
Check ($rev.rating -eq 5) "Crear resena (id=$($rev.id))"
Check ((Get-StatusCode "POST" "/reviews" @{ activityId = $aid; rating = 5 } $ot) -eq 403) "Organizador no puede calificar (403)"
$pub = Invoke-Api "GET" "/reviews/activity/$aid" $null $null
Check ($pub.total -ge 1) "Resenas publicas (total=$($pub.total), avg=$($pub.average))"
$hist = @(Invoke-Api "GET" "/history" $null $st)
Check ($hist.Count -ge 1) "Historial del estudiante ($($hist.Count) item(s))"
Check ((Get-StatusCode "GET" "/history" $null $ot) -eq 403) "Organizador no accede al historial de estudiante (403)"

# 5. Descarga de PDF
Write-Host "`n[5] Descarga de certificado PDF"
$pdfPath = Join-Path $env:TEMP "kooler-cert-smoke.pdf"
try {
  Invoke-WebRequest -Uri "$BaseUrl/certificates/$($certs[0].id)/download" -Headers @{ Authorization = "Bearer $st" } -OutFile $pdfPath
  $bytes = [System.IO.File]::ReadAllBytes($pdfPath)
  $header = [System.Text.Encoding]::ASCII.GetString($bytes[0..4])
  Check ($header -eq "%PDF-") "PDF valido ($($bytes.Length) bytes)"
} catch {
  Check $false "Descarga de PDF ($($_.Exception.Message))"
}
Check ((Get-StatusCode "GET" "/certificates/$($certs[0].id)/download" $null $ot) -eq 403) "Certificado ajeno bloqueado (403)"

Write-Host "`n== Resultado: $script:pass OK, $script:fail FAIL ==" -ForegroundColor Cyan
if ($script:fail -gt 0) { exit 1 } else { exit 0 }
