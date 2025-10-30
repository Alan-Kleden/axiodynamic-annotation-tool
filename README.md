# 🎯 Axiodynamic Annotation Tool

**Outil d'annotation multilingue pour la recherche en analyse axiodynamique des discours institutionnels.**

[![Version](https://img.shields.io/badge/version-9.3-blue.svg)](https://github.com/yourusername/axiodynamic-annotation-tool)
[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)

---

## 📋 Description

Plateforme web d'annotation permettant d'évaluer deux dimensions axiodynamiques dans des textes institutionnels :

- **Fc (Force conative)** : Volonté d'action vers l'objectif affiché
- **Fi (Force d'opposition)** : Réserves, obstacles ou résistances face à cet objectif

Le système génère automatiquement des **certificats PDF professionnels** envoyés par email aux participants.

---

## ✨ Fonctionnalités

### 🌍 Multilingue
- **4 langues** : Français, English, Español, 中文
- Interface complète traduite
- Échelle de notation adaptée

### 📊 Annotation
- **12 extraits** de textes institutionnels
- Échelle **0-5 étoiles** pour Fc et Fi
- Commentaires optionnels
- Sauvegarde locale (LocalStorage)
- Export JSON des annotations

### 📧 Certificats PDF
- **Génération automatique** avec FPDF
- Design professionnel (logo + signature)
- **Envoi par email** avec pièce jointe
- Multilingue (selon langue de session)

### 🔒 Sécurité
- Variables d'environnement (`.htaccess`)
- Mots de passe **jamais en clair** dans le code
- Protection fichiers sensibles
- CORS configuré

---

## 🚀 Installation

### Prérequis
- **Serveur web** : Apache avec PHP 7.4+
- **SMTP** : Compte email configuré
- **SSL** : Certificat HTTPS (recommandé)

### Étapes

1. **Cloner le repository** (privé)
   ```bash
   git clone https://github.com/yourusername/axiodynamic-annotation-tool.git
   cd axiodynamic-annotation-tool
   ```

2. **Configurer les variables d'environnement**
   
   Créer/éditer `/public_html/.htaccess` :
   ```apache
   SetEnv SMTP_USER votre-email@domaine.com
   SetEnv SMTP_PASSWORD "votre_mot_de_passe"
   ```

3. **Uploader les fichiers**
   ```
   /public_html/annotation-tool-multilingual/
   ├── index.html
   ├── app.js
   ├── i18n.js
   ├── logo.png (votre logo)
   ├── EN_data.js
   ├── FR_data.js
   ├── ES_data.js
   ├── ZH_data.js
   └── api/
       ├── send_certificate.php
       ├── fpdf.php
       ├── Logo.jpg
       ├── Signature_Alan_Kleden.jpg
       └── font/ (14 fichiers)
   ```

4. **Créer le dossier certificates**
   ```bash
   mkdir certificates
   chmod 755 certificates
   ```

5. **Tester**
   - Ouvrir : `https://votre-domaine.com/annotation-tool-multilingual/`
   - Faire une annotation complète
   - Vérifier réception email

---

## 📁 Structure du projet

```
axiodynamic-annotation-tool/
├── .gitignore                  # Fichiers exclus de Git
├── README.md                   # Ce fichier
├── LICENSE                     # Licence privée
│
├── index.html                  # Page principale
├── app.js                      # Logique application
├── i18n.js                     # Traductions
├── logo.png                    # Logo public (placeholder)
│
├── EN_data.js                  # Extraits en anglais
├── FR_data.js                  # Extraits en français
├── ES_data.js                  # Extraits en espagnol
├── ZH_data.js                  # Extraits en chinois
│
├── api/
│   ├── send_certificate.php   # Génération PDF + envoi email
│   ├── fpdf.php                # Bibliothèque PDF
│   ├── font/                   # Polices FPDF (14 fichiers)
│   ├── Logo.jpg                # Logo pour PDF (NON COMMITTÉ)
│   └── Signature_*.jpg         # Signature (NON COMMITÉ)
│
├── certificates/               # PDF générés (NON COMMITTÉ)
│
└── docs/
    ├── DEPLOY.md               # Guide déploiement
    └── SECURITY.md             # Politique sécurité
```

---

## 🔧 Configuration

### Variables d'environnement

Définies dans `.htaccess` (NON committé) :

```apache
SetEnv SMTP_HOST smtp.votrehebergeur.com
SetEnv SMTP_PORT 465
SetEnv SMTP_USER votre-email@domaine.com
SetEnv SMTP_PASSWORD "votre_mot_de_passe"
```

### Personnalisation

**Logo :** Remplacez `api/Logo.jpg` (recommandé : 400x400px, JPG)

**Signature :** Remplacez `api/Signature_Alan_Kleden.jpg` (recommandé : PNG transparent ou JPG blanc)

**Extraits :** Modifiez `FR_data.js`, `EN_data.js`, etc.

---

## 📊 Utilisation

### Pour les participants

1. **Choisir la langue** (FR/EN/ES/ZH)
2. **Lire les instructions**
3. **Annoter 12 extraits** (échelle 0-5)
4. **Entrer email** pour recevoir certificat
5. **Recevoir certificat PDF** par email

### Pour le chercheur

Les annotations sont sauvegardées dans le **LocalStorage** du navigateur participant. 

Pour collecter les données :
- Option A : Intégrer un backend (base de données)
- Option B : Demander aux participants d'exporter leur JSON

---

## 🔒 Sécurité

### Bonnes pratiques appliquées

✅ **Mots de passe** : Variables d'environnement (`.htaccess`)  
✅ **CORS** : Headers configurés  
✅ **Validation** : Input sanitization (PHP)  
✅ **Protection** : Fichiers sensibles bloqués  
✅ **SSL/TLS** : SMTP via port 465 (SSL)  

### Fichiers protégés

- `.htaccess` (credentials)
- `*.log` (debug)
- `certificates/*.pdf` (données personnelles)
- Signatures et logos privés

---

## 🐛 Dépannage

### Email non reçu

1. Vérifier `/api/debug_method.log`
2. Tester SMTP : `php api/test_smtp_auth.php`
3. Vérifier variables env : `php api/test_env.php`

### Certificat non généré

1. Vérifier dossier `/certificates/` existe et est writable
2. Vérifier `/api/font/` contient 14 fichiers `.php`
3. Vérifier `Logo.jpg` est valide (JPEG ou PNG)

### Problème d'affichage

1. Vider cache navigateur : `Ctrl+Shift+R`
2. Tester en navigation privée
3. Vérifier console JavaScript (F12)

---

## 📜 Licence

**© 2025 Alan Kleden - Tous droits réservés**

Ce projet est **privé** et destiné à un usage de recherche académique. Toute redistribution, modification ou utilisation commerciale est interdite sans autorisation écrite.

---

## 👤 Auteur

**Alan Kleden**  
Chercheur en Axiodynamique  
📧 ak@alankleden.com  
🔗 [OSF Project](https://osf.io/rm42h)

---

## 📝 Changelog

### Version 9.3 (2025-10-30)
- ✅ Fix espacement échelle de notation
- ✅ `<strong>` forcé inline
- ✅ Design compact et lisible

### Version 9.0 (2025-10-29)
- ✅ Certificats PDF professionnels
- ✅ Signature manuscrite intégrée
- ✅ Logo redimensionné
- ✅ Sécurisation mots de passe (`.htaccess`)

### Version 7.1 (2025-10-28)
- ✅ Multilingue complet (FR/EN/ES/ZH)
- ✅ Correction syntaxe fichiers de données
- ✅ Interface responsive

### Version 5.0 (2025-10-27)
- 🎉 Version initiale
- ✅ 12 extraits annotables
- ✅ LocalStorage
- ✅ Export JSON

---

## 🙏 Remerciements

- **FPDF** : Bibliothèque PDF légère
- **Hostinger** : Hébergement
- **OSF** : Plateforme de recherche ouverte

---

**⭐ Si ce projet vous aide, n'hésitez pas à laisser une étoile !** (une fois public)
