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
try {
    $gitVersion = git --version
    Write-Host "   ✓ Git installé : $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ ERREUR : Git n'est pas installé !" -ForegroundColor Red
    Write-Host "   Installez Git depuis : https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# Vérifier qu'on est dans le bon dossier
$currentPath = Get-Location
Write-Host "   Dossier actuel : $currentPath" -ForegroundColor Gray

if (-not (Test-Path "index.html")) {
    Write-Host "   ✗ ERREUR : index.html non trouvé !" -ForegroundColor Red
    Write-Host "   Êtes-vous dans le bon dossier ?" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Fichiers du projet détectés" -ForegroundColor Green

# Vérifier que .gitignore existe
if (-not (Test-Path ".gitignore")) {
    Write-Host "   ✗ ERREUR : .gitignore manquant !" -ForegroundColor Red
    Write-Host "   Extrayez d'abord github-starter-pack.zip" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ .gitignore présent" -ForegroundColor Green

Write-Host ""

# Étape 1 : Initialiser Git
Write-Host "2. Initialisation du repository Git..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "   ⚠ Repository Git déjà initialisé" -ForegroundColor Yellow
    $response = Read-Host "   Voulez-vous réinitialiser ? (o/N)"
    if ($response -eq "o" -or $response -eq "O") {
        Remove-Item -Recurse -Force .git
        Write-Host "   ✓ Repository réinitialisé" -ForegroundColor Green
    } else {
        Write-Host "   → Conservation du repository existant" -ForegroundColor Gray
    }
}

if (-not (Test-Path ".git")) {
    git init
    Write-Host "   ✓ Repository Git initialisé" -ForegroundColor Green
}

Write-Host ""

# Étape 2 : Configurer Git (si nécessaire)
Write-Host "3. Configuration Git..." -ForegroundColor Yellow

$gitUserName = git config user.name
$gitUserEmail = git config user.email

if ([string]::IsNullOrEmpty($gitUserName)) {
    Write-Host "   Configuration Git user.name..." -ForegroundColor Gray
    git config --global user.name "Alan Kleden"
    Write-Host "   ✓ user.name configuré" -ForegroundColor Green
} else {
    Write-Host "   ✓ user.name : $gitUserName" -ForegroundColor Green
}

if ([string]::IsNullOrEmpty($gitUserEmail)) {
    Write-Host "   Configuration Git user.email..." -ForegroundColor Gray
    git config --global user.email "ak@alankleden.com"
    Write-Host "   ✓ user.email configuré" -ForegroundColor Green
} else {
    Write-Host "   ✓ user.email : $gitUserEmail" -ForegroundColor Green
}

Write-Host ""

# Étape 3 : Vérifier les fichiers à ignorer
Write-Host "4. Vérification fichiers sensibles..." -ForegroundColor Yellow

$sensitiveFiles = @(".htaccess", "*.log", "certificates/", "api/debug*.log")
$foundSensitive = $false

foreach ($pattern in $sensitiveFiles) {
    $files = Get-ChildItem -Path . -Filter $pattern -Recurse -ErrorAction SilentlyContinue
    if ($files) {
        Write-Host "   ⚠ Fichier sensible détecté : $pattern" -ForegroundColor Yellow
        $foundSensitive = $true
    }
}

if ($foundSensitive) {
    Write-Host "   → Ces fichiers seront ignorés par .gitignore" -ForegroundColor Gray
} else {
    Write-Host "   ✓ Aucun fichier sensible détecté" -ForegroundColor Green
}

Write-Host ""

# Étape 4 : Ajouter les fichiers
Write-Host "5. Ajout des fichiers au staging..." -ForegroundColor Yellow

git add .
$stagedFiles = git diff --cached --name-only
$stagedCount = ($stagedFiles | Measure-Object -Line).Lines

Write-Host "   ✓ $stagedCount fichiers ajoutés" -ForegroundColor Green
Write-Host ""
Write-Host "   Fichiers qui seront commités :" -ForegroundColor Gray
git diff --cached --name-only | ForEach-Object { Write-Host "     - $_" -ForegroundColor Gray }

Write-Host ""

# Vérification finale avant commit
Write-Host "⚠ VÉRIFICATION CRITIQUE :" -ForegroundColor Yellow
Write-Host "Les fichiers suivants NE doivent PAS apparaître ci-dessus :" -ForegroundColor Yellow
Write-Host "  - .htaccess" -ForegroundColor Red
Write-Host "  - *.log" -ForegroundColor Red
Write-Host "  - certificates/*.pdf" -ForegroundColor Red
Write-Host "  - Signature_Alan_Kleden.jpg (si privée)" -ForegroundColor Red
Write-Host ""

$continue = Read-Host "Tout semble correct ? Continuer ? (O/n)"
if ($continue -eq "n" -or $continue -eq "N") {
    Write-Host "   → Arrêt du script" -ForegroundColor Red
    exit 0
}

Write-Host ""

# Étape 5 : Premier commit
Write-Host "6. Premier commit..." -ForegroundColor Yellow

git commit -m "Initial commit - Annotation Tool v9.3

- Outil d'annotation multilingue (FR/EN/ES/ZH)
- Génération certificats PDF professionnels
- Envoi email automatique avec SMTP
- 12 extraits de textes institutionnels
- Échelles Fc/Fi (0-5)
"

Write-Host "   ✓ Commit créé" -ForegroundColor Green
Write-Host ""

# Étape 6 : Lier au repo GitHub
Write-Host "7. Liaison avec GitHub..." -ForegroundColor Yellow

# Vérifier si remote existe déjà
$existingRemote = git remote get-url origin 2>$null

if ($existingRemote) {
    Write-Host "   ⚠ Remote 'origin' existe déjà : $existingRemote" -ForegroundColor Yellow
    if ($existingRemote -ne $REPO_URL) {
        Write-Host "   → Mise à jour de l'URL" -ForegroundColor Gray
        git remote set-url origin $REPO_URL
        Write-Host "   ✓ URL mise à jour" -ForegroundColor Green
    }
} else {
    git remote add origin $REPO_URL
    Write-Host "   ✓ Remote 'origin' configurée" -ForegroundColor Green
}

Write-Host "   Repository : $REPO_URL" -ForegroundColor Gray
Write-Host ""

# Étape 7 : Push vers GitHub
Write-Host "8. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "   ⚠ Vous allez devoir vous authentifier" -ForegroundColor Yellow
Write-Host ""

try {
    git branch -M main
    git push -u origin main
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ SUCCESS !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Votre code est maintenant sur GitHub :" -ForegroundColor Green
    Write-Host "  → $REPO_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commandes utiles :" -ForegroundColor Yellow
    Write-Host "  git status          # Voir l'état" -ForegroundColor Gray
    Write-Host "  git add .           # Ajouter modifications" -ForegroundColor Gray
    Write-Host "  git commit -m 'msg' # Créer commit" -ForegroundColor Gray
    Write-Host "  git push            # Envoyer vers GitHub" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ ERREUR lors du push" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Causes possibles :" -ForegroundColor Yellow
    Write-Host "  1. Repository GitHub n'existe pas encore" -ForegroundColor Gray
    Write-Host "     → Créez-le sur https://github.com/new" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Problème d'authentification" -ForegroundColor Gray
    Write-Host "     → Utilisez GitHub Desktop ou un token" -ForegroundColor Gray
    Write-Host "     → https://docs.github.com/en/authentication" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Remote mal configurée" -ForegroundColor Gray
    Write-Host "     → Vérifiez : git remote -v" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Erreur complète :" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
