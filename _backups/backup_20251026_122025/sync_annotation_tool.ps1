# ========================================
# SYNC ANNOTATION TOOL
# ========================================
# Objectif : Synchroniser le projet depuis Hostinger vers DeFi-Scripts
# Source : D:\Hostinger\annotation-tool
# Destination : G:\Mon Drive\DeFi-Scripts\Annotation_tool
# Date : 2025-10-26

# Chemins
$source = "D:\Hostinger\annotation-tool"
$destination = "G:\Mon Drive\DeFi-Scripts\Annotation_tool"

Write-Host "`n=== SYNCHRONISATION ANNOTATION TOOL ===" -ForegroundColor Cyan
Write-Host "Source      : $source" -ForegroundColor Yellow
Write-Host "Destination : $destination`n" -ForegroundColor Yellow

# ========================================
# 1. VÉRIFICATIONS PRÉLIMINAIRES
# ========================================
Write-Host "1. VÉRIFICATIONS" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# Vérifier que la source existe
if (-not (Test-Path $source)) {
    Write-Host "[ERREUR] Le répertoire source n'existe pas : $source" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Répertoire source trouvé" -ForegroundColor Green

# Créer la destination si elle n'existe pas
if (-not (Test-Path $destination)) {
    Write-Host "[INFO] Création du répertoire destination..." -ForegroundColor Yellow
    New-Item -Path $destination -ItemType Directory -Force | Out-Null
    Write-Host "[OK] Répertoire destination créé" -ForegroundColor Green
} else {
    Write-Host "[OK] Répertoire destination existe" -ForegroundColor Green
}

# ========================================
# 2. SAUVEGARDE AVANT SYNC
# ========================================
Write-Host "`n2. SAUVEGARDE" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$backupDir = Join-Path $destination "_backups"
$backupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $backupDir "backup_$backupTimestamp"

if (Test-Path $destination) {
    # Compter les fichiers existants
    $existingFiles = Get-ChildItem -Path $destination -Recurse -File | Where-Object { $_.FullName -notlike "*_backups*" }
    
    if ($existingFiles.Count -gt 0) {
        Write-Host "[INFO] Création d'une sauvegarde avant synchronisation..." -ForegroundColor Yellow
        
        # Créer le dossier de backup
        if (-not (Test-Path $backupDir)) {
            New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
        }
        
        New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
        
        # Copier les fichiers existants
        Copy-Item -Path "$destination\*" -Destination $backupPath -Recurse -Force -Exclude "_backups"
        
        Write-Host "[OK] Sauvegarde créée : $backupPath" -ForegroundColor Green
        Write-Host "    Fichiers sauvegardés : $($existingFiles.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "[INFO] Pas de fichiers à sauvegarder (destination vide)" -ForegroundColor Gray
    }
}

# ========================================
# 3. EXCLUSIONS
# ========================================
Write-Host "`n3. FICHIERS À EXCLURE" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# Définir les exclusions
$excludePatterns = @(
    "*.log",           # Logs
    "*.tmp",           # Fichiers temporaires
    "*.bak",           # Backups
    "_backups",        # Dossier de sauvegarde
    ".git",            # Git
    "node_modules",    # Node modules
    "__pycache__",     # Python cache
    ".vscode",         # VS Code
    ".idea"            # IntelliJ
)

Write-Host "Patterns exclus :" -ForegroundColor Yellow
$excludePatterns | ForEach-Object {
    Write-Host "  - $_" -ForegroundColor Gray
}

# ========================================
# 4. ANALYSE PRÉ-SYNC
# ========================================
Write-Host "`n4. ANALYSE PRÉ-SYNCHRONISATION" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# Compter les fichiers à copier
$sourceFiles = Get-ChildItem -Path $source -Recurse -File | Where-Object {
    $file = $_
    $excluded = $false
    foreach ($pattern in $excludePatterns) {
        if ($file.FullName -like "*$pattern*") {
            $excluded = $true
            break
        }
    }
    -not $excluded
}

Write-Host "Fichiers à synchroniser : $($sourceFiles.Count)" -ForegroundColor Cyan
Write-Host "Taille totale           : $([math]::Round(($sourceFiles | Measure-Object -Property Length -Sum).Sum / 1MB, 2)) MB`n" -ForegroundColor Cyan

# Afficher les types de fichiers
Write-Host "Répartition par type :" -ForegroundColor Yellow
$sourceFiles | Group-Object Extension | Sort-Object Count -Descending | Select-Object -First 10 | ForEach-Object {
    $ext = if ($_.Name) { $_.Name } else { "(sans extension)" }
    Write-Host "  $ext : $($_.Count) fichier(s)" -ForegroundColor Gray
}

# ========================================
# 5. CONFIRMATION
# ========================================
Write-Host "`n5. CONFIRMATION" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$confirmation = Read-Host "Voulez-vous procéder à la synchronisation ? (O/N)"

if ($confirmation -ne "O" -and $confirmation -ne "o") {
    Write-Host "`n[ANNULÉ] Synchronisation annulée par l'utilisateur" -ForegroundColor Yellow
    exit 0
}

# ========================================
# 6. SYNCHRONISATION
# ========================================
Write-Host "`n6. SYNCHRONISATION EN COURS" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$copiedFiles = 0
$errors = 0

try {
    # Parcourir tous les fichiers sources
    foreach ($file in $sourceFiles) {
        # Calculer le chemin relatif
        $relativePath = $file.FullName.Substring($source.Length)
        $destPath = Join-Path $destination $relativePath
        
        # Créer le dossier de destination si nécessaire
        $destFolder = Split-Path $destPath -Parent
        if (-not (Test-Path $destFolder)) {
            New-Item -Path $destFolder -ItemType Directory -Force | Out-Null
        }
        
        # Copier le fichier
        try {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
            $copiedFiles++
            
            # Afficher la progression tous les 10 fichiers
            if ($copiedFiles % 10 -eq 0) {
                $progress = [math]::Round(($copiedFiles / $sourceFiles.Count) * 100, 1)
                Write-Host "  Progression : $progress% ($copiedFiles / $($sourceFiles.Count))" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "[ERREUR] Impossible de copier : $relativePath" -ForegroundColor Red
            Write-Host "  Détail : $($_.Exception.Message)" -ForegroundColor Red
            $errors++
        }
    }
    
    Write-Host "`n[OK] Synchronisation terminée !" -ForegroundColor Green
    Write-Host "  Fichiers copiés : $copiedFiles" -ForegroundColor Cyan
    if ($errors -gt 0) {
        Write-Host "  Erreurs         : $errors" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n[ERREUR CRITIQUE] La synchronisation a échoué" -ForegroundColor Red
    Write-Host "Détail : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ========================================
# 7. VÉRIFICATION POST-SYNC
# ========================================
Write-Host "`n7. VÉRIFICATION POST-SYNCHRONISATION" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$destFiles = Get-ChildItem -Path $destination -Recurse -File | Where-Object { $_.FullName -notlike "*_backups*" }
Write-Host "Fichiers dans destination : $($destFiles.Count)" -ForegroundColor Cyan

# Comparer les nombres
if ($destFiles.Count -ge $sourceFiles.Count) {
    Write-Host "[OK] Nombre de fichiers cohérent" -ForegroundColor Green
} else {
    Write-Host "[ATTENTION] Moins de fichiers en destination ($($destFiles.Count)) qu'en source ($($sourceFiles.Count))" -ForegroundColor Yellow
}

# ========================================
# 8. FICHIERS CORRIGÉS
# ========================================
Write-Host "`n8. FICHIERS CORRIGÉS DISPONIBLES" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

Write-Host "[INFO] N'oubliez pas de remplacer les fichiers suivants par leurs versions corrigées :" -ForegroundColor Yellow
Write-Host "  1. G:\Mon Drive\DeFi-Scripts\Annotation_tool\api\submit.php" -ForegroundColor Cyan
Write-Host "  2. G:\Mon Drive\DeFi-Scripts\Annotation_tool\js\app.js" -ForegroundColor Cyan
Write-Host "`n  Les fichiers corrigés sont disponibles dans :" -ForegroundColor Yellow
Write-Host "  G:\Mon Drive\DeFi-Scripts\Annotation_tool\" -ForegroundColor Cyan

# ========================================
# 9. RAPPORT FINAL
# ========================================
Write-Host "`n9. RAPPORT FINAL" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$reportPath = Join-Path $destination "sync_report_$backupTimestamp.txt"

$report = @"
==============================================
RAPPORT DE SYNCHRONISATION
==============================================
Date            : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Source          : $source
Destination     : $destination

RÉSULTATS
---------
Fichiers copiés : $copiedFiles
Erreurs         : $errors
Sauvegarde      : $backupPath

FICHIERS PAR TYPE
-----------------
$($sourceFiles | Group-Object Extension | Sort-Object Count -Descending | ForEach-Object { "$($_.Name): $($_.Count)" } | Out-String)

PROCHAINES ÉTAPES
-----------------
1. Vérifier le contenu de : $destination
2. Remplacer submit.php par la version corrigée
3. Remplacer app.js par la version corrigée
4. Tester l'application

"@

$report | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "[OK] Rapport généré : $reportPath" -ForegroundColor Green

# ========================================
# FIN
# ========================================
Write-Host "`n=== SYNCHRONISATION TERMINÉE ===" -ForegroundColor Cyan
Write-Host "`nVos fichiers ont été synchronisés vers :" -ForegroundColor Yellow
Write-Host "$destination`n" -ForegroundColor Cyan

# Proposer d'ouvrir le dossier
$openFolder = Read-Host "Voulez-vous ouvrir le dossier de destination ? (O/N)"
if ($openFolder -eq "O" -or $openFolder -eq "o") {
    explorer $destination
}