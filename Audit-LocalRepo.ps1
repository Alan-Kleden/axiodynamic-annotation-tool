# File: Audit-LocalRepo.ps1
# PowerShell 5.1 compatible

param(
  [string]$Root = ".",
  [string]$ReportDir = ".\report"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-Row([string]$Check,[string]$Status,[string]$Details,[string]$Target="."){
  [PSCustomObject]@{ Check=$Check; Status=$Status; Details=$Details; Target=$Target }
}

# Préparation rapport
if(-not (Test-Path $ReportDir)){ New-Item -ItemType Directory -Path $ReportDir | Out-Null }
$rows = @()

# 1) git présent ?
$gitCmd = $null
try { $gitCmd = Get-Command git -ErrorAction Stop } catch { }
if(-not $gitCmd){
  $rows += New-Row "git" "FAIL" "git introuvable dans PATH"
}

# 2) Contexte repo
$inRepo = $false
if(Test-Path $Root){
  Push-Location $Root
  try{
    if($gitCmd){
      $inRepo = ((git rev-parse --is-inside-work-tree 2>$null) -eq "true")
      if($inRepo){
        $branch = (git rev-parse --abbrev-ref HEAD).Trim()
        $rows += New-Row "branche courante" "OK" $branch

        try { git fetch origin | Out-Null } catch { }

        $headLocal  = ""
        $headRemote = ""
        try { $headLocal  = (git rev-parse HEAD).Trim() } catch { }
        try { $headRemote = (git rev-parse origin/main 2>$null).Trim() } catch { }

        if([string]::IsNullOrWhiteSpace($headRemote)){
          $rows += New-Row "origin/main" "WARN" "Branche origin/main introuvable"
        } else {
          $lr = ""
          try { $lr = (git rev-list --left-right --count origin/main...HEAD).Trim() } catch { }
          if($lr){
            $parts = $lr -split '\s+'
            # format git: LEFT(behind) RIGHT(ahead)
            $behind = $parts[0]
            $ahead  = $parts[1]
            $rows += New-Row "divergence" "INFO" ("ahead:{0} behind:{1}" -f $ahead,$behind)
          }
        }

        $status = git status --porcelain
        if([string]::IsNullOrWhiteSpace($status)){
          $rows += New-Row "working tree" "OK" "propre"
        } else {
          $joined = ($status -join "`n")
          $rows += New-Row "working tree" "WARN" ("modifs en cours`n{0}" -f $joined)
        }
      } else {
        $rows += New-Row "git repo" "FAIL" "Ce dossier n'est pas un dépôt git"
      }
    }
  } finally {
    Pop-Location
  }
} else {
  $rows += New-Row "dossier" "FAIL" "Le chemin Root n'existe pas" $Root
}

# 3) Fichiers attendus (structure app)
$mustExist = @(
  "index.html","app.js","i18n.js",
  "EN_data.js","FR_data.js","ES_data.js","ZH_data.js",
  "api\send_certificate.php","api\submit.php","cgu"
)
foreach($p in $mustExist){
  $full = Join-Path $Root $p
  $ok = Test-Path $full
  if($ok){
    $rows += New-Row ("présence: "+$p) "OK" "found" $full
  } else {
    $rows += New-Row ("présence: "+$p) "FAIL" "missing" $full
  }
}

# 4) Fichiers/dossiers polluants
$pollute = Get-ChildItem -Path $Root -Recurse -File -Include `
  *.bak.*,*.bak,*.tmp,*.old,*.orig,*.rej,*.swp,*.swo,*.DS_Store,desktop.ini `
  -ErrorAction SilentlyContinue
if($pollute -and $pollute.Count -gt 0){
  $rows += New-Row "fichiers polluants" "WARN" (($pollute | Select-Object -Expand FullName) -join "`n")
} else {
  $rows += New-Row "fichiers polluants" "OK" "aucun"
}

foreach($d in @(".release-trash","report")){
  $full = Join-Path $Root $d
  if(Test-Path $full){
    $rows += New-Row ("dossier "+$d) "WARN" "présent" $full
  } else {
    $rows += New-Row ("dossier "+$d) "OK" "absent" $full
  }
}

# 5) Détection BOM UTF-8 dans html/js/css
$textFiles = Get-ChildItem -Path $Root -Recurse -File -Include *.html,*.js,*.css -ErrorAction SilentlyContinue
$bomHits = @()
foreach($f in $textFiles){
  try{
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    if($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF){
      $bomHits += $f.FullName
    }
  } catch { }
}
if($bomHits.Count -gt 0){
  $rows += New-Row "UTF8 BOM" "INFO" ("BOM détecté:`n{0}" -f ($bomHits -join "`n"))
} else {
  $rows += New-Row "UTF8 BOM" "OK" "aucun BOM détecté"
}

# 6) Cache-busting dans index.html
$indexPath = Join-Path $Root "index.html"
if(Test-Path $indexPath){
  $html = Get-Content $indexPath -Raw -ErrorAction SilentlyContinue
  if($html){
    $m = [regex]::Matches($html,'\.(js|css)\?v=\d{4}-\d{2}-\d{2}-\d')
    $rows += New-Row "cache-busting index.html" ($(if($m.Count -gt 0){"OK"}else{"WARN"})) ("assets versionnés: {0}" -f $m.Count) $indexPath
  } else {
    $rows += New-Row "cache-busting index.html" "WARN" "index illisible" $indexPath
  }
} else {
  $rows += New-Row "cache-busting index.html" "FAIL" "index.html manquant" $indexPath
}

# Sauvegarde
$csv  = Join-Path $ReportDir "audit-summary.csv"
$json = Join-Path $ReportDir "audit-summary.json"
$rows | Export-Csv -NoTypeInformation -Encoding UTF8 -Path $csv
$rows | ConvertTo-Json -Depth 5 | Out-File -Encoding UTF8 $json

# Affichage console
$rows | Format-Table -AutoSize
Write-Host "`nRésumé : $($rows.Count) checks. JSON: $json  CSV: $csv"
