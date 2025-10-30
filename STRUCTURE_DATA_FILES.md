# 🔧 CORRECTION STRUCTURE DATA FILES

## Problème Identifié

Vos fichiers `XX_data.js` actuels utilisent :
```javascript
window.EXCERPTS = [...]  // ❌ Tableau unique
```

Ils doivent utiliser :
```javascript
window.EXCERPTS = window.EXCERPTS || {};
window.EXCERPTS['fr'] = [...]  // ✅ Objet avec clés
```

## Solution

Je vais créer 4 nouveaux fichiers avec la bonne structure :

1. `EN_data.js` → `window.EXCERPTS['en']`
2. `FR_data.js` → `window.EXCERPTS['fr']`
3. `ES_data.js` → `window.EXCERPTS['es']`
4. `ZH_data.js` → `window.EXCERPTS['zh']`

**IMPORTANT :** Ces nouveaux fichiers contiendront les MÊMES 12 excerpts que vous avez actuellement, mais avec la structure correcte pour le multilingue.

## Déploiement

1. Télécharger les 4 nouveaux fichiers
2. Uploader sur le serveur (remplacer les anciens)
3. Vider cache navigateur (Ctrl+Shift+R)
4. Tester

