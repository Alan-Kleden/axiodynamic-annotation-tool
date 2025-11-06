param(
  [string]$Root = ".",
  [switch]$RemoveI18NGhosts,  # retire les spans i18n invisibles
  [switch]$DryRun,            # simulation: affiche sans supprimer
  [switch]$Quarantine         # au lieu de supprimer, déplacer vers .\.release-trash\<timestamp>\
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $Root

# 0) Quarantaine (si demandée)
$trash = $null
if ($Quarantine) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $trash = Join-Path $env:TEMP ("annotation-tool-release-trash\$stamp")
  New-Item -ItemType Directory -Force -Path $trash | Out-Null
}

# 1) Inventaire avant nettoyage
$preList = Join-Path $Root "report\pre-clean-filelist.txt"
New-Item -ItemType Directory -Path (Split-Path $preList) -Force | Out-Null
Get-ChildItem -Recurse | Select-Object FullName, Length, LastWriteTime | Out-File -Encoding UTF8 $preList

# 2) Cibles
$toDelete = @()
$toDelete += Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue -Include `
  *.bak.html, *.bak.js, *.bak.css, *.orig, *.rej, *.tmp, *.temp, *.~*, *.swp
$toDelete += Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue -Filter *.bak.*
$toDelete += Get-ChildItem -Recurse -Directory -ErrorAction SilentlyContinue -Filter report
$toDelete += Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue -Include "Fix-LaptopAnnotation.ps1"
$toDelete += Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue -Include ".DS_Store","Thumbs.db"

# 3) Exécuter la stratégie
$seen = @{}
foreach($item in ($toDelete | Sort-Object FullName -Unique)){
  if($seen.ContainsKey($item.FullName)) { continue } else { $seen[$item.FullName]=$true }
  if ($DryRun) {
    Write-Host ("DRY  " + $item.FullName)
    continue
  }
  try {
    if ($Quarantine) {
      $target = Join-Path $trash ($item.FullName -replace "^[A-Za-z]:", "" -replace "^[\\/]", "" -replace "[:\*?\x22<>|]", "_")
      New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
      Move-Item -LiteralPath $item.FullName -Destination $target -Force
      Write-Host ("MV   " + $item.FullName + "  =>  " + $target)
    } else {
      Remove-Item -LiteralPath $item.FullName -Recurse -Force
      Write-Host ("DEL  " + $item.FullName)
    }
  } catch {
    Write-Warning ("Skip " + $item.FullName + " : " + $_.Exception.Message)
  }
}

# 4) Option: retirer les spans i18n fantômes
if ($RemoveI18NGhosts) {
  $htmlFiles = Get-ChildItem -Recurse -File -Include *.html | Where-Object { $_.Name -notmatch '\.bak\.html$' }
  $regex = '<span\s+class="sr-only"\s+data-i18n="(?:quiz\.submit|quiz\.next)".*?</span>\s*'
  foreach($f in $htmlFiles){
    $t = Get-Content -Raw -Encoding UTF8 $f.FullName
    $new = [System.Text.RegularExpressions.Regex]::Replace($t, $regex, "", "IgnoreCase, Singleline")
    if($new -ne $t){
      if ($DryRun) {
        Write-Host ("DRY  EDIT " + $f.FullName + "  (-sr-only i18n)")
      } elseif ($Quarantine) {
        # sauvegarde version avant edit
        $backup = $f.FullName + ".pre-clean.bak.html"
        Copy-Item -LiteralPath $f.FullName -Destination $backup -Force
        Set-Content -Encoding UTF8 -NoNewline -LiteralPath $f.FullName -Value $new
        Write-Host ("EDIT " + $f.FullName + "  (-sr-only i18n)  [backup: " + $backup + "]")
      } else {
        Set-Content -Encoding UTF8 -NoNewline -LiteralPath $f.FullName -Value $new
        Write-Host ("EDIT " + $f.FullName + "  (-sr-only i18n)")
      }
    }
  }
}

# 5) Résumé
Write-Host "`nNettoyage terminé."
Write-Host "Liste avant nettoyage: $preList"
Write-Host "Vérifications:"
Write-Host (" - Backups restants: " + ((Get-ChildItem -Recurse -File -Include *.bak.* | Measure-Object).Count))
if (Test-Path ".\report") {
  Write-Host " - Dossier report:   PRESENT"
} else {
  Write-Host " - Dossier report:   ABSENT"
}
if ($Quarantine) { Write-Host (" - Quarantaine: " + $trash) }

