param([string]$Root=".")
$ErrorActionPreference="Stop"; Set-StrictMode -Version Latest
$Root=(Resolve-Path $Root).Path
$index=Join-Path $Root "index.html"
if(-not (Test-Path $index)){ throw "index.html introuvable: $Root" }
$html = Get-Content $index -Raw -Encoding UTF8

# extraire refs internes (href/src) et ignorer http(s)
$refs = @([regex]::Matches($html,'(src|href)="([^"]+)"') | ForEach-Object { $_.Groups[2].Value }) |
        ForEach-Object { ($_ -split '\?')[0] } | Sort-Object -Unique

$internal = @(
  $refs | Where-Object {
    $_ -notmatch '^(https?:)?//' -and
    $_ -notmatch '^(mailto:|tel:|javascript:)' -and
    $_ -notmatch '^#' -and
    $_ -ne '#'
  }
)

$missing  = @($internal | Where-Object { -not (Test-Path (Join-Path $Root $_)) })

# rapport
$outDir = Join-Path $Root "report"; if(-not (Test-Path $outDir)){ New-Item -ItemType Directory -Path $outDir | Out-Null }
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$refsCsv = Join-Path $outDir "refs-$ts.csv"
$missCsv = Join-Path $outDir "missing-$ts.csv"
$sumTxt  = Join-Path $outDir "summary-$ts.txt"

$internal | ForEach-Object { [pscustomobject]@{Ref=$_} } | Export-Csv $refsCsv -NoTypeInformation -Encoding UTF8
$missing  | ForEach-Object { [pscustomobject]@{Missing=$_} } | Export-Csv $missCsv -NoTypeInformation -Encoding UTF8

$line1 = "INDEX REF COUNT: {0} | MISSING: {1}" -f ($internal | Measure-Object | Select -Expand Count), ($missing | Measure-Object | Select -Expand Count)
$line1 | Set-Content -Encoding UTF8 $sumTxt
Write-Host $line1
Write-Host "Reports in: $outDir"
