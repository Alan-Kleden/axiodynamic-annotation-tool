# ==========================================
# Script d'initialisation Git pour Windows
# Annotation Tool - GitHub Setup
# ==========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git Setup - Annotation Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$REPO_NAME = "axiodynamic-annotation-tool"
$GITHUB_USERNAME = "Alan-Kleden"
$REPO_URL = "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Vérifications préalables
Write-Host "1. Vérifications préalables..." -ForegroundColor Yellow

# Vérifier que Git est installé
$gitInstalled = $false
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "   " -NoNewline
        Write-Host "[OK]" -ForegroundColor Green -NoNewline
        Write-Host " Git installé : $gitVersion"
        $gitInstalled = $true
    }
} catch {
    Write-Host "   " -NoNewline
    Write-Host "[ERREUR]" -ForegroundColor Red -NoNewline
    Write-Host " Git n'est pas installé !"
    Write-Host "   Installez Git : https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Vérifier qu'on est dans le bon dossier
$currentPath = Get-Location
Write-Host "   Dossier : $currentPath" -ForegroundColor Gray

if (-not (Test-Path "index.html")) {
    Write-Host "   " -NoNewline
    Write-Host "[ERREUR]" -ForegroundColor Red -NoNewline
    Write-Host " index.html non trouvé ! Mauvais dossier ?"
    exit 1
}
Write-Host "   " -NoNewline
Write-Host "[OK]" -ForegroundColor Green -NoNewline
Write-Host " Fichiers du projet détectés"

# Vérifier que .gitignore existe
if (-not (Test-Path ".gitignore")) {
    Write-Host "   " -NoNewline
    Write-Host "[ERREUR]" -ForegroundColor Red -NoNewline
    Write-Host " .gitignore manquant ! Extrayez github-setup-complete.zip"
    exit 1
}
Write-Host "   " -NoNewline
Write-Host "[OK]" -ForegroundColor Green -NoNewline
Write-Host " .gitignore présent"

Write-Host ""

# Étape 1 : Initialiser Git
Write-Host "2. Initialisation du repository Git..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "   Repository Git déjà initialisé" -ForegroundColor Gray
} else {
    git init
    Write-Host "   " -NoNewline
    Write-Host "[OK]" -ForegroundColor Green -NoNewline
    Write-Host " Repository Git initialisé"
}

Write-Host ""

# Étape 2 : Configurer Git
Write-Host "3. Configuration Git..." -ForegroundColor Yellow

$gitUserName = git config user.name 2>$null
$gitUserEmail = git config user.email 2>$null

if ([string]::IsNullOrEmpty($gitUserName)) {
    git config --global user.name "Alan Kleden"
    Write-Host "   " -NoNewline
    Write-Host "[OK]" -ForegroundColor Green -NoNewline
    Write-Host " user.name configuré"
} else {
    Write-Host "   user.name : $gitUserName" -ForegroundColor Gray
}

if ([string]::IsNullOrEmpty($gitUserEmail)) {
    git config --global user.email "ak@alankleden.com"
    Write-Host "   " -NoNewline
    Write-Host "[OK]" -ForegroundColor Green -NoNewline
    Write-Host " user.email configuré"
} else {
    Write-Host "   user.email : $gitUserEmail" -ForegroundColor Gray
}

Write-Host ""

# Étape 3 : Ajouter les fichiers
Write-Host "4. Ajout des fichiers au staging..." -ForegroundColor Yellow

git add .
$stagedFiles = git diff --cached --name-only 2>$null
$stagedCount = ($stagedFiles | Measure-Object).Count

Write-Host "   " -NoNewline
Write-Host "[OK]" -ForegroundColor Green -NoNewline
Write-Host " $stagedCount fichiers ajoutés"
Write-Host ""
Write-Host "   Fichiers qui seront commités :" -ForegroundColor Gray
git diff --cached --name-only | ForEach-Object { Write-Host "     - $_" -ForegroundColor Gray }

Write-Host ""
Write-Host "   " -NoNewline
Write-Host "[VERIF]" -ForegroundColor Yellow -NoNewline
Write-Host " Ces fichiers NE doivent PAS apparaître :"
Write-Host "     - .htaccess" -ForegroundColor Red
Write-Host "     - *.log" -ForegroundColor Red
Write-Host "     - certificates/*.pdf" -ForegroundColor Red
Write-Host ""

$continue = Read-Host "   Tout OK ? Continuer ? (O/n)"
if ($continue -eq "n" -or $continue -eq "N") {
    Write-Host "   Script arrêté" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Étape 4 : Premier commit
Write-Host "5. Premier commit..." -ForegroundColor Yellow

git commit -m "Initial commit - Annotation Tool v9.3" -m "- Outil annotation multilingue (FR/EN/ES/ZH)" -m "- Certificats PDF professionnels" -m "- Envoi email SMTP" -m "- 12 extraits textes institutionnels" 2>$null

Write-Host "   " -NoNewline
Write-Host "[OK]" -ForegroundColor Green -NoNewline
Write-Host " Commit créé"
Write-Host ""

# Étape 5 : Lier au repo GitHub
Write-Host "6. Liaison avec GitHub..." -ForegroundColor Yellow

$existingRemote = git remote get-url origin 2>$null

if ($existingRemote) {
    Write-Host "   Remote existe : $existingRemote" -ForegroundColor Gray
    if ($existingRemote -ne $REPO_URL) {
        git remote set-url origin $REPO_URL
        Write-Host "   URL mise à jour" -ForegroundColor Gray
    }
} else {
    git remote add origin $REPO_URL
    Write-Host "   " -NoNewline
    Write-Host "[OK]" -ForegroundColor Green -NoNewline
    Write-Host " Remote 'origin' configurée"
}

Write-Host "   Repository : $REPO_URL" -ForegroundColor Cyan
Write-Host ""

# Étape 6 : Push vers GitHub
Write-Host "7. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "   " -NoNewline
Write-Host "[INFO]" -ForegroundColor Cyan -NoNewline
Write-Host " Authentification requise..."
Write-Host ""

git branch -M main

$pushSuccess = $false
git push -u origin main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    $pushSuccess = $true
}

Write-Host ""

if ($pushSuccess) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Votre code est sur GitHub :" -ForegroundColor Green
    Write-Host "  -> $REPO_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commandes utiles :" -ForegroundColor Yellow
    Write-Host "  git status" -ForegroundColor Gray
    Write-Host "  git add ." -ForegroundColor Gray
    Write-Host "  git commit -m 'message'" -ForegroundColor Gray
    Write-Host "  git push" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERREUR lors du push" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Causes possibles :" -ForegroundColor Yellow
    Write-Host "  1. Repository GitHub n'existe pas encore" -ForegroundColor Gray
    Write-Host "     -> Creez-le sur https://github.com/new" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. Probleme d'authentification" -ForegroundColor Gray
    Write-Host "     -> Token : https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  3. Verifiez : git remote -v" -ForegroundColor Gray
    Write-Host ""
}
