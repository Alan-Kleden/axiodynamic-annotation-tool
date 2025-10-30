# 🚀 DÉPLOIEMENT FINAL - Annotation Tool v7.0

## 📦 Fichiers à uploader sur Hostinger

### Racine `/annotation-tool-multilingual/`
```
✅ index.html (interface principale)
✅ i18n.js (traductions 4 langues)
✅ app.js (logique application)
✅ logo.png (votre logo)
✅ EN_data.js (excerpts anglais)
✅ FR_data.js (excerpts français)
✅ ES_data.js (excerpts espagnol)
✅ ZH_data.js (excerpts chinois)
```

### Dossier `/api/`
```
✅ submit.php (sauvegarde annotations)
✅ submit_contact.php (sauvegarde contacts)
✅ send_certificate.php (envoi certificats par email) ⭐ NOUVEAU
```

### Dossiers à créer
```
📁 /data/responses/ (permissions 777)
📁 /certificates/ (permissions 755)
📁 /cgu/ (déjà existant)
📁 /docs/ (déjà existant)
```

---

## 🔧 ÉTAPE 1 : Configuration Email (FAIT ✅)

Vous avez créé l'alias : `noreply@alankleden.com`

**Vérification :**
- Serveur SMTP : `smtp.hostinger.com`
- Port : `465`
- Cryptage : `SSL`
- Login : `noreply@alankleden.com`
- Mot de passe : `BByD2X\Tvp3gB` ✅

---

## 🚀 ÉTAPE 2 : Upload des fichiers

### A. Fichiers principaux
1. Remplacez **index.html**, **i18n.js**, **app.js** (racine)
2. Uploadez **logo.png** (racine)
3. Remplacez **EN_data.js**, **FR_data.js**, **ES_data.js**, **ZH_data.js**

### B. Nouveau script API
1. Allez dans `/api/`
2. Uploadez **send_certificate.php** ⭐

### C. Créer le dossier certificates
```bash
# Via File Manager ou FTP
mkdir /public_html/annotation-tool-multilingual/certificates
chmod 755 certificates
```

---

## ✅ ÉTAPE 3 : Tester le système

### Test 1 : Welcome screen
1. Ouvrez `https://alankleden.com/annotation-tool-multilingual/`
2. ✅ Vérifiez que la langue FR s'affiche automatiquement
3. ✅ Testez le changement de langue
4. ✅ Cliquez "Commencer l'annotation"

### Test 2 : Annotations
1. ✅ Vérifiez "ACTEUR : Robby Soave (Reason Magazine)"
2. ✅ Progression : "1 sur 12" (en gros, violet)
3. ✅ Annotez les 12 textes
4. ✅ Sélecteur de langue invisible pendant annotations

### Test 3 : Certificat (CRITIQUE)
1. Remplissez le formulaire de contact
2. ✅ Cochez "J'accepte de recevoir le certificat" (sans "Obligatoire")
3. Cliquez "Envoyer"
4. ✅ Message : "Données enregistrées ! Vous recevrez votre certificat..."
5. **Vérifiez votre email** (noreply@alankleden.com ou ak@alankleden.com)
6. ✅ Email reçu avec lien certificat
7. ✅ Certificat HTML avec logo + infos participant

---

## 🐛 DÉPANNAGE

### Email ne part pas
**Problème :** PHP mail() bloqué par Hostinger

**Solution :** Utiliser PHPMailer (bibliothèque SMTP)

1. Connectez-vous en SSH ou File Manager
2. Créez `/api/vendor/` 
3. Téléchargez PHPMailer depuis GitHub
4. Modifiez `send_certificate.php` ligne 155 (je vous fournis le code si besoin)

### Certificat ne génère pas
**Problème :** Dossier `/certificates/` n'existe pas ou permissions

**Solution :**
```bash
cd /public_html/annotation-tool-multilingual/
mkdir certificates
chmod 755 certificates
```

### Logo ne s'affiche pas
**Problème :** Chemin incorrect

**Solution :**
- Uploadez `logo.png` à la racine
- URL correcte : `https://alankleden.com/annotation-tool-multilingual/logo.png`

---

## 📊 VÉRIFICATION DES DONNÉES

### Fichiers générés (après test)
```
/data/responses/
├── annotations_consolidated.csv  ✅
├── contacts_consolidated.csv     ✅
├── ANN_XXXXXXX_annotations.json
└── ANN_XXXXXXX_contact.json

/certificates/
└── certificate_ANN_XXXXXXX.pdf.html  ✅
```

---

## 🎯 CHECKLIST FINALE

- [ ] Tous les fichiers uploadés
- [ ] Dossier `/certificates/` créé (755)
- [ ] Test complet : welcome → annotations → contact
- [ ] Email certificat reçu
- [ ] CGU accessible (footer + formulaire)
- [ ] Données sauvegardées dans `/data/responses/`

---

## 📞 SUPPORT

**Si un problème survient :**

1. **Console F12** → Vérifiez les erreurs JavaScript
2. **Logs PHP** → Hostinger Panel → Error Logs
3. **Email de test** → Envoyez-vous un certificat

**Contact développeur :** Claude (cette conversation)

---

## ✨ AMÉLIORATIONS FUTURES (optionnel)

### Phase 2 : PDF professionnel
- [ ] Intégrer **TCPDF** pour générer de vrais PDFs
- [ ] Ajouter signature numérique
- [ ] QR code avec lien OSF

### Phase 3 : Analytics
- [ ] Tableau de bord admin
- [ ] Statistiques temps/langue
- [ ] Export CSV automatique

### Phase 4 : Multilangue email
- [ ] Templates email par langue
- [ ] Certificat PDF multilingue

---

**Version 7.0 - 2025-10-29**
**Statut : Prêt pour production** ✅
