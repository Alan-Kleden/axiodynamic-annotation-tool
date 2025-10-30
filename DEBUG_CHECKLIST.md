# 🔍 DEBUG CHECKLIST - Page Vide

## 1. Vérifier que TOUS les fichiers sont sur le serveur

Dans `annotation-tool-multilingual/` vous devez avoir :

```
✅ index.html (nouveau, ~40 KB)
✅ i18n.js (nouveau, ~35 KB)
✅ app.js (nouveau, ~12 KB)
✅ EN_data.js (ancien, gardé)
✅ FR_data.js (ancien, gardé)
✅ ES_data.js (ancien, gardé)
✅ ZH_data.js (ancien, gardé)
```

## 2. Tester dans la Console (F12)

Tapez ces commandes dans la console :

```javascript
window.translations
// Devrait afficher un objet avec en, fr, es, zh

window.EXCERPTS
// Devrait afficher un objet avec en, fr, es, zh

window.currentLanguage
// Devrait afficher "fr" ou "en"

t('welcomeTitle')
// Devrait afficher le titre traduit

document.querySelectorAll('[data-i18n]').length
// Devrait afficher un nombre > 50
```

## 3. Si window.translations = undefined

**Problème :** `i18n.js` ne se charge pas

**Solution :**
1. Vérifiez que `i18n.js` existe sur le serveur
2. Vérifiez les permissions (755)
3. Videz cache serveur + navigateur
4. Ouvrez directement : https://alankleden.com/annotation-tool-multilingual/i18n.js

## 4. Si window.EXCERPTS = undefined

**Problème :** Les fichiers `XX_data.js` ne se chargent pas

**Solution :**
1. Vérifiez que `EN_data.js`, `FR_data.js`, `ES_data.js`, `ZH_data.js` existent
2. NE PAS remplacer ces fichiers (ils sont bons)
3. Ouvrez directement : https://alankleden.com/annotation-tool-multilingual/FR_data.js

## 5. Si tout est undefined

**Problème :** Les scripts ne s'exécutent pas du tout

**Solution :**
1. Vérifiez qu'il n'y a pas de fichier `.htaccess` qui bloque les `.js`
2. Vérifiez les permissions des fichiers JS (755)
3. Testez en navigation privée
4. Essayez un autre navigateur

## 6. Test simple

Créez un fichier `test.html` avec ce contenu :

```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body>
<h1>Test Scripts</h1>
<script src="i18n.js"></script>
<script>
  document.write('<p>Translations loaded: ' + (typeof window.translations !== 'undefined') + '</p>');
  if (window.translations) {
    document.write('<p>EN title: ' + window.translations.en.welcomeTitle + '</p>');
  }
</script>
</body>
</html>
```

Uploadez ce fichier et ouvrez-le. Il devrait afficher :
- Translations loaded: true
- EN title: 🙏 Thank you for participating in this study!

