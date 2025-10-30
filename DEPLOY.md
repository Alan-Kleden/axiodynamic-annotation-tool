# 🚀 Guide de Déploiement

## Déploiement sur serveur de production

### 1. Préparation

**Sur votre machine locale :**

```bash
# Cloner le repo
git clone https://github.com/yourusername/axiodynamic-annotation-tool.git
cd axiodynamic-annotation-tool

# Créer les fichiers NON commités
cp api/Logo.jpg.example api/Logo.jpg  # Remplacer par votre logo
cp api/Signature.jpg.example api/Signature_Alan_Kleden.jpg
```

---

### 2. Configuration .htaccess

**Créer `/public_html/.htaccess` sur le serveur :**

```apache
# ==========================================
# Axiodynamic Tool - Configuration Apache
# ==========================================

# Variables d'environnement SMTP
SetEnv SMTP_USER votre-email@domaine.com
SetEnv SMTP_PASSWORD "votre_mot_de_passe_échappé"

# Protection .htaccess
<Files .htaccess>
    Order allow,deny
    Deny from all
</Files>

# Protection fichiers sensibles
<FilesMatch "\.(env|log|bak|config|sql)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Désactiver listing
Options -Indexes

# Protection certificats (optionnel)
<FilesMatch "^certificate_.*\.pdf$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

**⚠️ IMPORTANT :** Échapper les backslashes dans le mot de passe :
```apache
# Si mot de passe : Pass\Word123
SetEnv SMTP_PASSWORD "Pass\\Word123"
```

---

### 3. Upload des fichiers

**Via FTP/SFTP :**

```
/public_html/annotation-tool-multilingual/
├── index.html
├── app.js
├── i18n.js
├── logo.png
├── EN_data.js
├── FR_data.js
├── ES_data.js
├── ZH_data.js
└── api/
    ├── send_certificate.php
    ├── fpdf.php
    ├── Logo.jpg          ← VOTRE LOGO
    ├── Signature_Alan_Kleden.jpg  ← VOTRE SIGNATURE
    └── font/
        ├── helvetica.php
        ├── helveticab.php
        ├── ... (14 fichiers)
```

---

### 4. Permissions

```bash
# Dossier certificates (en écriture)
mkdir /public_html/annotation-tool-multilingual/certificates
chmod 755 /public_html/annotation-tool-multilingual/certificates

# Fichiers PHP (lecture/exécution)
chmod 644 api/*.php

# Logs (écriture si debug activé)
chmod 666 api/*.log  # Uniquement en développement
```

---

### 5. Tests

**A. Test variables d'environnement :**

Uploadez `api/test_env.php` temporairement :
```
https://votre-domaine.com/annotation-tool-multilingual/api/test_env.php
```

Vérifiez que :
- ✅ SMTP_USER affiché
- ✅ SMTP_PASSWORD défini (masqué)

**Supprimez `test_env.php` après test !**

---

**B. Test SMTP :**

Uploadez `api/test_smtp_auth.php` temporairement :
```
https://votre-domaine.com/annotation-tool-multilingual/api/test_smtp_auth.php
```

Vérifiez :
- ✅ Connexion SMTP réussie
- ✅ Authentification OK (code 235)

**Supprimez `test_smtp_auth.php` après test !**

---

**C. Test annotation complète :**

1. Ouvrir : `https://votre-domaine.com/annotation-tool-multilingual/`
2. Choisir une langue
3. Annoter tous les extraits
4. Entrer email valide
5. Soumettre

**Vérifier :**
- ✅ Certificat PDF reçu par email
- ✅ PDF bien formaté (logo + signature)
- ✅ Langue correcte

---

### 6. Nettoyage

**Supprimer fichiers de test :**

```bash
rm api/test_env.php
rm api/test_smtp_auth.php
rm api/diagnostic_certificat.php
rm api/debug_method.log
```

**Désactiver debug en production :**

Dans `send_certificate.php`, commenter :
```php
// file_put_contents($logFile, ...);  // Désactiver en production
```

---

### 7. Monitoring

**Vérifier régulièrement :**

- Taille dossier `/certificates/` (supprimer anciens PDF)
- Logs d'erreur PHP du serveur
- Bounces emails (adresses invalides)

**Rotation des certificats :**

```bash
# Supprimer certificats > 30 jours
find /path/to/certificates/ -name "certificate_*.pdf" -mtime +30 -delete
```

---

### 8. Backup

**Fichiers à sauvegarder régulièrement :**

- ✅ `/api/send_certificate.php` (si modifications)
- ✅ `*_data.js` (extraits de textes)
- ✅ `.htaccess` (credentials)
- ⚠️ **PAS** `/certificates/` (données utilisateur → RGPD)

**Utiliser Git pour le code :**

```bash
git add .
git commit -m "Update: description"
git push origin main
```

---

## Mise à jour

**Pour déployer une nouvelle version :**

```bash
# 1. Pull dernière version
git pull origin main

# 2. Uploader fichiers modifiés via FTP

# 3. Vider cache si nécessaire
# (Apache) : touch .htaccess
# (Navigateurs) : Ctrl+Shift+R

# 4. Tester
```

---

## Rollback

**En cas de problème :**

```bash
# 1. Identifier la dernière version stable
git log --oneline

# 2. Revenir à cette version
git checkout <commit-hash>

# 3. Re-uploader les fichiers

# 4. Retour à main après correction
git checkout main
```

---

## Support

**Problèmes courants :**

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Email non reçu | SMTP mal configuré | Vérifier `.htaccess` |
| PDF vide | Fonts manquants | Vérifier `/font/` (14 fichiers) |
| 500 Internal Error | Erreur PHP | Consulter error logs serveur |
| Cache | Ancien fichier | Ctrl+Shift+R navigateur |

**Logs utiles :**

- Hostinger Panel → Error Logs
- `api/debug_method.log` (si activé)
- Console navigateur (F12)

---

**📧 Contact : ak@alankleden.com**
