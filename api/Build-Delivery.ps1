param([Parameter(Mandatory=$true)][string]$SourceDir,[Parameter(Mandatory=$true)][string]$RepoDir)
$ErrorActionPreference="Stop"; Set-StrictMode -Version Latest
$src=(Resolve-Path $SourceDir).Path; $dst=(Resolve-Path $RepoDir).Path
$report=Join-Path $dst ("build-report-{0}.txt" -f (Get-Date -Format "yyyyMMdd-HHmmss"))

# WHITELIST sans favicon.png
$files=@(
 "index.html","app.js","i18n.js","EN_data.js","FR_data.js","ES_data.js","ZH_data.js",
 "app.css","favicon.ico",
 "README.md","LICENSE","DEPLOY.md","DEBUG_CHECKLIST.md",
 "data\codebook_v1.json",
 "cgu\cgu_fr.html","cgu\cgu_en.html","cgu\cgu_es.html","cgu\cgu_zh.html"
)
@("data","cgu","api")|%{ $p=Join-Path $dst $_; if(-not(Test-Path $p)){ New-Item -ItemType Directory $p|Out-Null } }

# Purge ciblée: ne JAMAIS supprimer api\*.ps1
$existing=Get-ChildItem -LiteralPath $dst -Recurse -File -ErrorAction SilentlyContinue
$keep=$files + @(".git",".gitattributes",".gitignore","README.md","LICENSE","DEPLOY.md","DEBUG_CHECKLIST.md","docs","api\Build-Delivery.ps1")
foreach($f in $existing){
  $rel=$f.FullName.Substring($dst.Length).TrimStart('\')
  if($rel -like "api\*" ){ continue }
  if($keep -notcontains $rel){
    if($rel -like "project-src.zip" -or $rel -like "*.tmp" -or $rel -like "*.log" -or $rel -like "*.bak*"){
      Remove-Item -Force $f.FullName; ("DEL file {0}" -f $rel)|Add-Content $report
    }
  }
}

# Copy whitelist
$missing=@()
foreach($rel in $files){
  $s=Join-Path $src $rel; $d=Join-Path $dst $rel
  if(Test-Path $s){ Copy-Item $s $d -Force; ("COPY {0}" -f $rel)|Add-Content $report }
  else{ $missing+=$rel }
}

# .gitattributes minimal
$gattr=Join-Path $dst ".gitattributes"
if(-not(Test-Path $gattr)){
  @("* text=auto eol=crlf","*.md text eol=lf") | Set-Content -Encoding UTF8 $gattr
  "ADD .gitattributes"|Add-Content $report
}

# .gitignore
$gi=Join-Path $dst ".gitignore"; if(-not(Test-Path $gi)){ New-Item $gi -ItemType File|Out-Null }
@("project-src.zip","_backups/","report/","*.tmp","*.log","*.bak*") | Add-Content $gi

"--- SUMMARY ---"|Add-Content $report
("Missing: {0}" -f ($missing -join ", "))|Add-Content $report
Write-Host "Report: $report"
if($missing.Count -gt 0){ Write-Warning ("Fichiers manquants: {0}" -f ($missing -join ", ")) }
