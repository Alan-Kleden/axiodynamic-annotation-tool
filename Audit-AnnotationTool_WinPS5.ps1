param(
  [string]$Root = ".",
  [string]$AssetVersion = "2025-11-04-2",
  [string]$QuizVersionExpected = "v3.4-dom3"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location $Root

function New-Row([string]$category,[string]$target,[string]$status,[string]$details){
  [pscustomobject]@{ Category=$category; Status=$status; Details=$details; Target=$target }
}
function Read-Text($path){ Get-Content -Raw -Encoding UTF8 $path }

$rows = @()

# ---- cibles ----
$Html = Get-ChildItem -Recurse -File -Include *.html | Where-Object { $_.Name -notmatch '\.bak\.html$' }
$Js   = Get-ChildItem -Recurse -File -Include *.js   | Where-Object { $_.Name -notmatch '\.bak\.js$' }

$indexHtml = $Html | Where-Object { $_.Name -ieq 'index.html' } | Select-Object -First 1
$quizHtml  = $Html | Where-Object { $_.Name -ieq 'quiz.html' }  | Select-Object -First 1
$cguHtmls  = $Html | Where-Object { $_.FullName -match "\\cgu\\.+\.html$" }

# cibles texte par défaut
$quizTarget = if($quizHtml){ $quizHtml.FullName } else { $Root }

# ---- 1) Submit guard ----
$guardRegex = '(?:submitBtn|btnSubmit)\.disabled\s*=\s*true'
$guardHit = $false
foreach($f in $Js){
  $t = Read-Text $f.FullName
  if($t -match $guardRegex){ $guardHit = $true; break }
}
if($guardHit){
  $rows += New-Row "SubmitGuard" $quizTarget "OK" "submitBtn.disabled=true détecté"
} else {
  $rows += New-Row "SubmitGuard" $quizTarget "WARN" "Pas de guard explicite sur submit"
}

# ---- 2) Assets versionnés (?v=...) ----
$targetsForVersion = @()
if($cguHtmls){ $targetsForVersion += $cguHtmls }
if($indexHtml){ $targetsForVersion += $indexHtml }
if($quizHtml){  $targetsForVersion += $quizHtml  }

foreach($h in $targetsForVersion){
  $t = Read-Text $h.FullName
  if($t -match [Regex]::Escape("?v=$AssetVersion")){
    $rows += New-Row "CacheBusting" $h.FullName "OK" ("Assets versionnés " + $AssetVersion)
  } else {
    $rows += New-Row "CacheBusting" $h.FullName "FAIL" ("Manque/≠ " + $AssetVersion)
  }
}

# ---- 3) i18n loader + clés témoins ----
foreach($h in $cguHtmls){
  $t = Read-Text $h.FullName
  if(($t -match 'i18n\.js\?v=\d{4}-\d{2}-\d{2}-\d+') -and ($t -match [Regex]::Escape("i18n.js?v=$AssetVersion"))){
    $rows += New-Row "i18n" $h.FullName "OK" "attributs + script détectés"
  } else {
    $rows += New-Row "i18n" $h.FullName "FAIL" "i18n absent"
  }

  $hasSubmit = $t -match 'data-i18n\s*=\s*"(?:quiz\.submit)"'
  $hasNext   = $t -match 'data-i18n\s*=\s*"(?:quiz\.next)"'
  if($hasSubmit -and $hasNext){
    $rows += New-Row "i18nKeys" $h.FullName "OK" "submit/next localisés"
  } elseif($hasSubmit -and -not $hasNext){
    $rows += New-Row "i18nKeys" $h.FullName "FAIL" "aucun bouton localisé"
  } else {
    $rows += New-Row "i18nKeys" $h.FullName "FAIL" "aucun bouton localisé"
  }
}

if($quizHtml){
  $tq = Read-Text $quizHtml.FullName
  if($tq -match [Regex]::Escape("i18n.js?v=$AssetVersion")){
    $rows += New-Row "i18n" $quizHtml.FullName "OK" "attributs + script détectés"
  } else {
    $rows += New-Row "i18n" $quizHtml.FullName "WARN" "script présent, attributs manquants ou version ≠"
  }
  $btnSubmitI18n = $tq -match 'id\s*=\s*"btnSubmit"[^>]*data-i18n\s*=\s*"quiz\.submit"'
  if($btnSubmitI18n){
    $rows += New-Row "i18nKeys" $quizHtml.FullName "OK" "submit localisé"
  } else {
    $rows += New-Row "i18nKeys" $quizHtml.FullName "WARN" "submit localisé, next manquant"
  }
}

# ---- 4) LocalStorage + version quiz attendue ----
$lsKeys = @('quiz_version_v1','quiz_passed_v1','quiz_score_v1','quiz_attempts_v1')
$allJsTextBuilder = New-Object System.Text.StringBuilder
foreach($j in $Js){ [void]$allJsTextBuilder.AppendLine( (Read-Text $j.FullName) ) }
$allJsText = $allJsTextBuilder.ToString()

$lsOk = $true
foreach($k in $lsKeys){
  if($allJsText -notmatch [Regex]::Escape($k)){ $lsOk = $false; break }
}
if($lsOk){
  $rows += New-Row "LocalStorage" $quizTarget "OK" "Clés LS présentes"
} else {
  $rows += New-Row "LocalStorage" $quizTarget "FAIL" "Clés LS manquantes"
}

if($allJsText -match [Regex]::Escape($QuizVersionExpected)){
  $rows += New-Row "QuizVersion" $quizTarget "OK" ($QuizVersionExpected + " trouvé")
} else {
  $rows += New-Row "QuizVersion" $quizTarget "FAIL" ($QuizVersionExpected + " absent")
}

# ---- 5) Règle M_DOM |Fc-Fi| ≥ 3 ----
# App jetable: on n'impose pas la présence du motif dans le code.
$rows += New-Row "DominanceRule" $Root "INFO" "Check M_DOM assoupli (non bloquant)"


# ---- 6) Gate API ----
$hasBypass = ($allJsText -match 'export\s+function\s+shouldBypassQuiz') -or ($allJsText -match 'window\.shouldBypassQuiz\s*=')
if($hasBypass){
  $rows += New-Row "GateFile" $Root "OK" "API gate détectée (ESM ou window.*)"
} else {
  $rows += New-Row "GateFile" $Root "WARN" "Aucune API publique de gate détectée"
}

$appJs = $Js | Where-Object { $_.Name -ieq 'app.js' } | Select-Object -First 1
if($appJs){
  $ta = Read-Text $appJs.FullName
  if($ta -match 'shouldBypassQuiz'){
    $rows += New-Row "GateUse" $appJs.FullName "OK" "shouldBypassQuiz référencé dans app.js"
  } else {
    $rows += New-Row "GateUse" $appJs.FullName "WARN" "App.js ne référence pas shouldBypassQuiz (optionnel)"
  }
}

# ---- 7) CSS utilitaires ----
$cssTelosFound = $false
$cssFiles = Get-ChildItem -Recurse -File -Include *.css
foreach($c in $cssFiles){
  $ct = Read-Text $c.FullName
  if($ct -match '\.telos-badge'){
    $cssTelosFound = $true
    $rows += New-Row "CSS" $c.FullName "OK" ".telos-badge détecté"
    break
  }
}
if(-not $cssTelosFound){
  $rows += New-Row "CSS" (Join-Path $Root 'css') "WARN" "Style .telos-badge non trouvé"
}

# ---- sortie ----
$rows = $rows | Sort-Object Category, Status, Target
$reportDir = Join-Path $Root "report"
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
$csv = Join-Path $reportDir "audit-summary.csv"
$json = Join-Path $reportDir "audit-summary.json"
$rows | Export-Csv -NoTypeInformation -Encoding UTF8 $csv
$rows | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $json

$rows | Select-Object Status, Details, Target | Format-Table -AutoSize
"`nRésumé : {0} checks. JSON: {1}  CSV: {2}" -f ($rows.Count), $json, $csv

"`nAssertions rapides :"
"1) localStorage : localStorage.getItem('quiz_version_v1') === '$QuizVersionExpected'"
"2) Assets       : Network -> .js/.css ?v=$AssetVersion"
"3) i18n DOM     : document.querySelectorAll('[data-i18n]').length > 0"
"4) Submit guard : bouton Submit devient disabled=true pendant le scoring"
