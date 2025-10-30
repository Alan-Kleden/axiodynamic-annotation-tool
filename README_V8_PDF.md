# VERSION 8.0 - CERTIFICAT PDF PROFESSIONNEL

## 📦 Contenu du package

1. **send_certificate_pdf.php** - Script principal avec génération PDF
2. **tcpdf_minimal.php** - Bibliothèque TCPDF standalone (pas de Composer)
3. **logo.png** - Votre logo (déjà fourni)

## 🎨 Design du certificat PDF

- ✅ Bordure professionnelle
- ✅ Votre logo en haut
- ✅ Titre "CERTIFICAT DE PARTICIPATION"
- ✅ Nom du participant en gros et souligné
- ✅ Texte du projet OSF
- ✅ Affiliation, Session ID, Date
- ✅ Lien OSF cliquable
- ✅ Signature "Alan Kleden, Chercheur"
- ✅ Multilingue (FR/EN/ES/ZH)

## 📧 Email

- ✅ PDF en **pièce jointe** (pas de lien)
- ✅ Email HTML avec bouton
- ✅ FROM: noreply@alankleden.com
- ✅ Taille PDF: ~50 KB

## 🚀 Installation

1. Uploadez les 3 fichiers dans `/api/`
2. Remplacez `send_certificate.php` par `send_certificate_pdf.php`
3. Renommez en `send_certificate.php`
4. Testez !

## ⏱️ Temps de génération

~2-3 secondes par certificat (normal avec TCPDF)

