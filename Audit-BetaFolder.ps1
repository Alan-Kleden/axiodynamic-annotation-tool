# Audit-BetaFolder.ps1  (PowerShell 5.1 safe, ASCII only)

param(
  [string]$Root = "."
)

# ---------- utils ----------
function New-ReportFile {
  param([string]$Dir)
  if (-not (Test-Path $Dir)) { New-Item -ItemType Directory -Path $Dir | Out-Null }
  $stamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
  $path  = Join-Path $Dir ("audit-{0}.txt" -f $stamp)
  New-Item -ItemType File -Path $path -Force | Out-Null
  return $path
}

function Write-Row {
  param([string]$Item,[string]$Status,[string]$Msg)
  $line = ("{0,-22} {1,-5} {2}" -f $Item,$Status,$Msg)
  Write-Host $line
  $line | Out-File -FilePath $script:Report -Append -Encoding UTF8
}

# ---------- init ----------
$RootPath = (Resolve-Path $Root).Path
$Report   = New-ReportFile (Join-Path $RootPath "report")

("AUDIT annotation-tool-multilingual-beta") | Out-File -FilePath $Report -Encoding UTF8
("Path: {0}" -f $RootPath)                    | Out-File -FilePath $Report -Append -Encoding UTF8
("Date: {0}" -f (Get-Date))                   | Out-File -FilePath $Report -Append -Encoding UTF8
"".PadLeft(60,"-")                            | Out-File -FilePath $Report -Append -Encoding UTF8

Write-Host ("Auditing: {0}" -f $RootPath)

# ---------- 1) presence ----------
Write-Host "`n[Presence]"
"".PadLeft(60,"-") | Out-File -FilePath $Report -Append -Encoding UTF8
"[Presence]"       | Out-File -FilePath $Report -Append -Encoding UTF8

$Must = @(
  "index.html","app.js","quiz_gate.js","i18n.js",
  "EN_data.js","FR_data.js","ES_data.js","ZH_data.js",
  "data\codebook_v1.json",
  "cgu\cgu_fr.html","cgu\cgu_en.html","cgu\cgu_es.html","cgu\cgu_zh.html"
)
foreach($p in $Must){
  $full = Join-Path $RootPath $p
  if (Test-Path $full) { Write-Row $p "OK" "found" }
  else                 { Write-Row $p "FAIL" "missing" }
}

# ---------- 2) unwanted files/dirs ----------
Write-Host "`n[Unwanted]"
"[Unwanted]" | Out-File -FilePath $Report -Append -Encoding UTF8

$BadFiles = Get-ChildItem -LiteralPath $RootPath -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "*.bak.*" -or $_.Name -like "*.tmp" -or $_.Name -like "*.log" -or $_.Name -eq "desktop.ini" }

if ($BadFiles -and $BadFiles.Count -gt 0) {
  Write-Row "files" "WARN" ("{0} unwanted" -f $BadFiles.Count)
  foreach($bf in $BadFiles){
    ("  - {0}" -f $bf.FullName.Substring($RootPath.Length+1)) | Out-File -FilePath $Report -Append -Encoding UTF8
  }
} else {
  Write-Row "files" "OK" "none"
}

$BadDirs = @(".release-trash","report","_release","_trash","node_modules",".git",".github",".vscode")
foreach($d in $BadDirs){
  $fp = Join-Path $RootPath $d
  if (Test-Path $fp) { Write-Row ("dir {0}" -f $d) "WARN" "present" }
}

# ---------- 3) encoding (BOM) ----------
Write-Host "`n[Encoding]"
"[Encoding]" | Out-File -FilePath $Report -Append -Encoding UTF8

$Scan = Get-ChildItem -LiteralPath $RootPath -Recurse -File -Include *.html,*.js -ErrorAction SilentlyContinue
foreach($f in $Scan){
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $hasBom = $false
  if ($bytes.Length -ge 3) {
    if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { $hasBom = $true }
  }
  $rel = $f.FullName.Substring($RootPath.Length+1)
  if ($hasBom) { Write-Row $rel "WARN" "UTF-8 with BOM" } else { Write-Row $rel "OK" "UTF-8 no BOM (assumed)" }
}

# ---------- 4) index references ----------
Write-Host "`n[index.html checks]"
"[index.html checks]" | Out-File -FilePath $Report -Append -Encoding UTF8

$Index = Join-Path $RootPath "index.html"
if (Test-Path $Index) {
  $html = Get-Content $Index -Raw -Encoding UTF8

  # meta charset
  if ($html -match '(?i)<meta\s+charset\s*=\s*utf-8') {
    Write-Row "meta charset" "OK" "present"
  } else {
    Write-Row "meta charset" "FAIL" "absent"
  }

  $status = $(if ($html -match '(?i)favicon\.(ico|png)') { "OK" } else { "WARN" })
  Write-Row "favicon" $status "referenced?"

  $status = $(if ($html -match '(?i)app\.css') { "OK" } else { "WARN" })
  Write-Row "app.css" $status "referenced?"

  $status = $(if ($html -match '(?i)i18n\.js') { "OK" } else { "FAIL" })
  Write-Row "i18n.js" $status "referenced?"

  $status = $(if ($html -match '(?i)app\.js') { "OK" } else { "FAIL" })
  Write-Row "app.js" $status "referenced?"

  $status = $(if ($html -match '(?i)quiz_gate\.js') { "OK" } else { "FAIL" })
  Write-Row "quiz_gate" $status "referenced?"
} else {
  Write-Row "index.html" "FAIL" "missing"
}


# ---------- 5) git quick info ----------
Write-Host "`n[Git]"
"[Git]" | Out-File -FilePath $Report -Append -Encoding UTF8
$gitDir = Join-Path $RootPath ".git"
if (Test-Path $gitDir) {
  $branch = (git rev-parse --abbrev-ref HEAD 2>$null)
  if (-not $branch) { $branch = "(unknown)" }
  Write-Row "branch" "OK" $branch
  $stat = (git status --porcelain 2>$null)
  if ($stat) {
    Write-Row "working tree" "WARN" "pending changes"
    $lines = $stat -split "`r?`n"
    foreach($l in $lines){ if($l){ ("  - {0}" -f $l) | Out-File -FilePath $Report -Append -Encoding UTF8 } }
  } else {
    Write-Row "working tree" "OK" "clean"
  }
} else {
  Write-Row "git" "INFO" ".git not found"
}

Write-Host "`nReport:"
Write-Host $Report
