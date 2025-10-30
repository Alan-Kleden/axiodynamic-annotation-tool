# ========================================
# AUDIT COMPLET - Annotation Tool
# ========================================
# Date: 2025-10-26
# Objectif: Identifier tous les fichiers, versions, et incohérences
# Usage: .\audit_annotation_tool.ps1

$RootPath = "D:\Hostinger\annotation-tool"

Write-Host "`n=== AUDIT ANNOTATION TOOL ===" -ForegroundColor Cyan
Write-Host "Répertoire racine: $RootPath`n" -ForegroundColor Yellow

# ========================================
# 1. STRUCTURE DE RÉPERTOIRES
# ========================================
Write-Host "1. STRUCTURE DE RÉPERTOIRES" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$directories = Get-ChildItem -Path $RootPath -Directory -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
Write-Host "Nombre total de sous-répertoires: $($directories.Count)`n"

$directories | ForEach-Object {
    $relativePath = $_.FullName.Replace($RootPath, "")
    Write-Host "  [DOSSIER] $relativePath"
}

# ========================================
# 2. FICHIERS JAVASCRIPT/HTML/PHP
# ========================================
Write-Host "`n2. FICHIERS PRINCIPAUX" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$extensions = @("*.html", "*.js", "*.php", "*.css")
$mainFiles = @()

foreach ($ext in $extensions) {
    $files = Get-ChildItem -Path $RootPath -Filter $ext -Recurse -File -ErrorAction SilentlyContinue
    $mainFiles += $files
}

Write-Host "Fichiers trouvés par type:`n"
$mainFiles | Group-Object Extension | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count) fichier(s)"
}

Write-Host "`nListe détaillée:`n"
$mainFiles | Sort-Object Extension, Name | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 2)
    $modified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    $relativePath = $_.FullName.Replace($RootPath, "").Replace("\", "/")
    Write-Host "  $($_.Extension) | ${size} KB | $modified | $relativePath"
}

# ========================================
# 3. FICHIERS CSV (DONNÉES)
# ========================================
Write-Host "`n3. FICHIERS CSV (DONNÉES)" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$csvFiles = Get-ChildItem -Path $RootPath -Filter "*.csv" -Recurse -File -ErrorAction SilentlyContinue

if ($csvFiles.Count -eq 0) {
    Write-Host "  [ATTENTION] AUCUN fichier CSV trouvé!" -ForegroundColor Red
} else {
    Write-Host "Nombre total de fichiers CSV: $($csvFiles.Count)`n"
    
    $csvFiles | Sort-Object Name | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        $modified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $lines = (Get-Content $_.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        $relativePath = $_.FullName.Replace($RootPath, "").Replace("\", "/")
        
        Write-Host "  [CSV] $($_.Name)"
        Write-Host "     Chemin: $relativePath"
        Write-Host "     Taille: ${size} KB | Lignes: $lines | Modifié: $modified"
        
        # Identifier le type de CSV
        if ($_.Name -like "*contact*") {
            Write-Host "     Type: CONTACTS (métadonnées annotateurs)" -ForegroundColor Cyan
        } elseif ($_.Name -like "*annotation*") {
            Write-Host "     Type: ANNOTATIONS (données Fc/Fi)" -ForegroundColor Yellow
            
            # Vérifier le contenu
            $content = Get-Content $_.FullName -First 2 -ErrorAction SilentlyContinue
            if ($content.Count -gt 1) {
                Write-Host "     En-tête: $($content[0])"
                Write-Host "     Exemple: $($content[1])"
            }
        } else {
            Write-Host "     Type: AUTRE" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# ========================================
# 4. FICHIERS JSON
# ========================================
Write-Host "`n4. FICHIERS JSON" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$jsonFiles = Get-ChildItem -Path $RootPath -Filter "*.json" -Recurse -File -ErrorAction SilentlyContinue

if ($jsonFiles.Count -eq 0) {
    Write-Host "  [INFO] Aucun fichier JSON trouvé"
} else {
    Write-Host "Nombre total de fichiers JSON: $($jsonFiles.Count)`n"
    
    $jsonFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 20 | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        $modified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $relativePath = $_.FullName.Replace($RootPath, "").Replace("\", "/")
        
        Write-Host "  [JSON] $($_.Name)"
        Write-Host "     Chemin: $relativePath"
        Write-Host "     Taille: ${size} KB | Modifié: $modified"
        Write-Host ""
    }
    
    if ($jsonFiles.Count -gt 20) {
        Write-Host "  ... et $($jsonFiles.Count - 20) autres fichiers JSON" -ForegroundColor Gray
    }
}

# ========================================
# 5. VERSIONS ET DOUBLONS
# ========================================
Write-Host "`n5. DÉTECTION DE VERSIONS / DOUBLONS" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# Fichiers avec numéros de version
$versionedFiles = $mainFiles + $csvFiles | Where-Object { 
    $_.Name -match "__\d+_" -or $_.Name -match "_v\d+" -or $_.Name -match " \(\d+\)" 
}

if ($versionedFiles.Count -gt 0) {
    Write-Host "[ATTENTION] FICHIERS VERSIONNÉS DÉTECTÉS: $($versionedFiles.Count)`n" -ForegroundColor Yellow
    
    $versionedFiles | Group-Object { $_.Name -replace "__\d+_|_v\d+| \(\d+\)", "" } | ForEach-Object {
        if ($_.Count -gt 1) {
            $groupName = $_.Name
            $versionCount = $_.Count
            Write-Host "  [VERSION] Groupe: $groupName ($versionCount versions)"
            $_.Group | Sort-Object LastWriteTime | ForEach-Object {
                Write-Host "     - $($_.Name) | $($_.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))"
            }
            Write-Host ""
        }
    }
} else {
    Write-Host "[OK] Aucun doublon de version détecté"
}

# ========================================
# 6. FICHIERS data.js
# ========================================
Write-Host "`n6. FICHIERS data.js (EXCERPTS)" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$dataJsFiles = Get-ChildItem -Path $RootPath -Filter "data.js" -Recurse -File -ErrorAction SilentlyContinue

if ($dataJsFiles.Count -eq 0) {
    Write-Host "  [ERREUR] AUCUN fichier data.js trouvé!" -ForegroundColor Red
} else {
    Write-Host "Nombre de fichiers data.js: $($dataJsFiles.Count)`n"
    
    $dataJsFiles | ForEach-Object {
        $relativePath = $_.FullName.Replace($RootPath, "").Replace("\", "/")
        $modified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $size = [math]::Round($_.Length / 1KB, 2)
        
        Write-Host "  [DATA.JS] $relativePath"
        Write-Host "     Taille: ${size} KB | Modifié: $modified"
        
        # Analyser le contenu
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        
        # Compter les excerpts
        $excerptCount = ([regex]::Matches($content, 'id:\s*"C\d+')).Count
        Write-Host "     Excerpts détectés: $excerptCount"
        
        # Vérifier syntaxe
        if ($content -match 'text:\s*`') {
            Write-Host "     Format text: BACKTICKS [OK]" -ForegroundColor Green
        } elseif ($content -match 'text:\s*"') {
            Write-Host "     Format text: GUILLEMETS DOUBLES [ATTENTION]" -ForegroundColor Yellow
        } elseif ($content -match "text:\s*'") {
            Write-Host "     Format text: APOSTROPHES SIMPLES [ATTENTION]" -ForegroundColor Yellow
        }
        
        # Chercher C012 et C013
        if ($content -match 'id:\s*"C012"') {
            if ($content -match 'author:\s*"NitaAnn"') {
                Write-Host "     C012: NitaAnn (poésie) [OK]" -ForegroundColor Green
            } else {
                Write-Host "     C012: Autre auteur [ATTENTION]" -ForegroundColor Yellow
            }
        }
        
        if ($content -match 'id:\s*"C013"') {
            if ($content -match 'author:\s*"Congressional Research Service"') {
                Write-Host "     C013: Congressional Research Service [OK]" -ForegroundColor Green
            } else {
                Write-Host "     C013: Autre auteur [ATTENTION]" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
    }
}

# ========================================
# 7. FICHIERS app.js
# ========================================
Write-Host "`n7. FICHIERS app.js (LOGIQUE)" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$appJsFiles = Get-ChildItem -Path $RootPath -Filter "app.js" -Recurse -File -ErrorAction SilentlyContinue

if ($appJsFiles.Count -eq 0) {
    Write-Host "  [ERREUR] AUCUN fichier app.js trouvé!" -ForegroundColor Red
} else {
    Write-Host "Nombre de fichiers app.js: $($appJsFiles.Count)`n"
    
    $appJsFiles | ForEach-Object {
        $relativePath = $_.FullName.Replace($RootPath, "").Replace("\", "/")
        $modified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $size = [math]::Round($_.Length / 1KB, 2)
        
        Write-Host "  [APP.JS] $relativePath"
        Write-Host "     Taille: ${size} KB | Modifié: $modified"
        
        # Analyser endpoints de sauvegarde
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content -match 'fetch\([''"]([^''"]+)[''"].*save|XMLHttpRequest.*open\([''"]POST[''"],\s*[''"]([^''"]+)') {
            $endpoint = $matches[1]
            Write-Host "     Endpoint sauvegarde: $endpoint" -ForegroundColor Cyan
        } else {
            Write-Host "     [ATTENTION] Endpoint de sauvegarde non détecté" -ForegroundColor Yellow
        }
        
        # Vérifier localStorage
        if ($content -match 'localStorage') {
            Write-Host "     Utilise localStorage: OUI" -ForegroundColor Yellow
        }
        
        Write-Host ""
    }
}

# ========================================
# 8. FICHIERS PHP (SERVEUR)
# ========================================
Write-Host "`n8. SCRIPTS SERVEUR PHP" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$phpFiles = Get-ChildItem -Path $RootPath -Filter "*.php" -Recurse -File -ErrorAction SilentlyContinue

if ($phpFiles.Count -eq 0) {
    Write-Host "  [INFO] Aucun fichier PHP trouvé (peut-être normal si backend différent)"
} else {
    Write-Host "Nombre de fichiers PHP: $($phpFiles.Count)`n"
    
    $phpFiles | ForEach-Object {
        $relativePath = $_.FullName.Replace($RootPath, "").Replace("\", "/")
        $modified = $_.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $size = [math]::Round($_.Length / 1KB, 2)
        
        Write-Host "  [PHP] $relativePath"
        Write-Host "     Taille: ${size} KB | Modifié: $modified"
        
        # Analyser contenu
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content -match 'annotations_consolidated') {
            Write-Host "     Gère: annotations_consolidated [OK]" -ForegroundColor Green
        }
        if ($content -match 'contacts_consolidated') {
            Write-Host "     Gère: contacts_consolidated [OK]" -ForegroundColor Green
        }
        
        Write-Host ""
    }
}

# ========================================
# 9. RÉSUMÉ ET PROBLÈMES IDENTIFIÉS
# ========================================
Write-Host "`n9. RÉSUMÉ ET PROBLÈMES IDENTIFIÉS" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$issues = @()

# Vérifier doublons CSV
$annotationsCsvCount = ($csvFiles | Where-Object { $_.Name -like "*annotation*" }).Count
$contactsCsvCount = ($csvFiles | Where-Object { $_.Name -like "*contact*" }).Count

if ($annotationsCsvCount -gt 1) {
    $issues += "[PROBLÈME] $annotationsCsvCount fichiers annotations_consolidated*.csv détectés (devrait être 1 seul)"
}

if ($contactsCsvCount -gt 1) {
    $issues += "[PROBLÈME] $contactsCsvCount fichiers contacts_consolidated*.csv détectés (devrait être 1 seul)"
}

# Vérifier data.js
if ($dataJsFiles.Count -eq 0) {
    $issues += "[BLOQUANT] Aucun fichier data.js trouvé"
} elseif ($dataJsFiles.Count -gt 1) {
    $issues += "[PROBLÈME] $($dataJsFiles.Count) fichiers data.js détectés (risque de confusion)"
}

# Vérifier app.js
if ($appJsFiles.Count -eq 0) {
    $issues += "[BLOQUANT] Aucun fichier app.js trouvé"
} elseif ($appJsFiles.Count -gt 1) {
    $issues += "[PROBLÈME] $($appJsFiles.Count) fichiers app.js détectés (lequel est actif?)"
}

# Vérifier versions
if ($versionedFiles.Count -gt 0) {
    $issues += "[ATTENTION] $($versionedFiles.Count) fichiers versionnés détectés (nettoyage recommandé)"
}

if ($issues.Count -eq 0) {
    Write-Host "[OK] Aucun problème majeur détecté!" -ForegroundColor Green
} else {
    Write-Host "PROBLÈMES IDENTIFIÉS:`n" -ForegroundColor Red
    $issues | ForEach-Object {
        Write-Host "  $_"
    }
}

# ========================================
# 10. EXPORT RAPPORT
# ========================================
Write-Host "`n10. EXPORT RAPPORT" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$reportPath = Join-Path $RootPath "audit_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

# Générer rapport texte
$report = @"
==============================================
AUDIT ANNOTATION TOOL
==============================================
Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Répertoire: $RootPath

STRUCTURE
---------
Sous-répertoires: $($directories.Count)
Fichiers HTML: $(($mainFiles | Where-Object Extension -eq '.html').Count)
Fichiers JS: $(($mainFiles | Where-Object Extension -eq '.js').Count)
Fichiers PHP: $(($mainFiles | Where-Object Extension -eq '.php').Count)
Fichiers CSS: $(($mainFiles | Where-Object Extension -eq '.css').Count)

DONNÉES
-------
Fichiers CSV: $($csvFiles.Count)
Fichiers JSON: $($jsonFiles.Count)

FICHIERS CLÉS
-------------
data.js: $($dataJsFiles.Count)
app.js: $($appJsFiles.Count)

PROBLÈMES
---------
$($issues -join "`n")

FICHIERS CSV DÉTAILLÉS
----------------------
$($csvFiles | ForEach-Object { "$($_.Name) | $($_.LastWriteTime) | $($_.Length) bytes" } | Out-String)

"@

$report | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "[OK] Rapport exporté: $reportPath" -ForegroundColor Green

Write-Host "`n=== FIN DE L'AUDIT ===" -ForegroundColor Cyan
Write-Host "`nPour déboguer, examinez en priorité:" -ForegroundColor Yellow
Write-Host "  1. Les fichiers CSV d'annotations (versions multiples?)"
Write-Host "  2. Le fichier app.js (endpoint de sauvegarde)"
Write-Host "  3. Le fichier data.js (syntaxe correcte?)"
Write-Host ""