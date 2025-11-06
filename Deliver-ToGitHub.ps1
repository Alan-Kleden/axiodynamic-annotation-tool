# Deliver-ToGitHub.ps1  (PowerShell 5.1)
param(
  [Parameter(Mandatory=$true)][string]$BetaPath,
  [Parameter(Mandatory=$true)][string]$RepoUrl,          # ex: https://github.com/Alan-Kleden/axiodynamic-annotation-tool.git
  [string]$WorkDir = "$env:TEMP\axio-delivery",
  [switch]$DryRun,                                       # /L pour robocopy
  [string]$CommitMsg = "Release: sync from beta folder"
)

# 0) Préparation
$BetaPath = (Resolve-Path $BetaPath).Path
if(!(Test-Path $WorkDir)){ New-Item -ItemType Directory -Path $WorkDir | Out-Null }
$clone = Join-Path $WorkDir "repo"
if(Test-Path $clone){ Remove-Item -Recurse -Force $clone }

# 1) Clone propre
git --version | Out-Null
git clone $RepoUrl $clone

# 2) Copie contrôlée depuis beta -> clone
# Exclusions fichiers et dossiers
$xf = @("*.bak.*","*.tmp","*.log","desktop.ini")
$xd = @(".git",".github",".vscode","node_modules",".release-trash","report","_release","_trash")

$opts = @("/E","/NFL","/NDL","/NJH","/NJS","/R:1","/W:1")
if($DryRun){ $opts += "/L" }

# construire la ligne robocopy
$cmd = @("robocopy", "`"$BetaPath`"", "`"$clone`"", "*.*") + $opts
foreach($x in $xf){ $cmd += @("/XF",$x) }
foreach($d in $xd){ $cmd += @("/XD",$d) }

Write-Host "== Robocopy =="
Write-Host ($cmd -join " ")
& robocopy $BetaPath $clone *.* @opts @("/XF") @xf @("/XD") @xd | Out-Null

if($DryRun){
  Write-Host "DryRun terminé. Rien n’a été écrit."
  exit 0
}

# 3) Statut, commit, push
Push-Location $clone
git status --porcelain
if((git status --porcelain).Length -gt 0){
  git add -A
  git commit -m $CommitMsg
  git branch -M main 2>$null
  git push origin main
}else{
  Write-Host "Aucun changement à committer."
}
Pop-Location

Write-Host "Livraison terminée."
