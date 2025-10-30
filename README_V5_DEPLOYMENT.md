# 🚀 VERSION 5.0 - Deployment Guide

## ✨ What's New

### Major Changes from v4.x

1. **Welcome Screen Added** ✅
   - Full instructions before starting
   - Resources links (PDF + Video) adapted by language
   - Same UX as French v1

2. **Email Moved to End** ✅
   - Contact form appears AFTER 12 annotations
   - Double GDPR consent (Certificate + Newsletter)
   - No friction at start

3. **LocalStorage Implementation** ✅
   - Progressive save after each annotation
   - Session recovery on page reload
   - Zero data loss

4. **Complete Multilingual** ✅
   - Welcome screen translated (EN/FR/ES/ZH)
   - Resource links adapted per language
   - CGU links adapted per language

---

## 📦 Files to Upload

### New/Modified Files

```
annotation-tool-multilingual/
├── index.html          ✅ REPLACE (905 lines)
├── i18n.js            ✅ REPLACE (420 lines)
├── app.js             ✅ REPLACE (369 lines)
├── EN_data.js         ⚠️  KEEP (already uploaded)
├── FR_data.js         ⚠️  KEEP (already uploaded)
├── ES_data.js         ⚠️  KEEP (already uploaded)
├── ZH_data.js         ⚠️  KEEP (already uploaded)
├── api/
│   ├── submit.php          ⚠️  KEEP (already working)
│   └── submit_contact.php  ⚠️  KEEP (already working)
├── docs/              ✅ ALREADY UPLOADED
│   ├── EN_ANNOTATION_GUIDELINES_v3.1.pdf
│   ├── FR_ANNOTATION_GUIDELINES_v3.1.pdf
│   ├── ES_ANNOTATION_GUIDELINES_v3.1.pdf
│   └── ZH_ANNOTATION_GUIDELINES_v3.1.pdf
└── cgu/               ✅ ALREADY UPLOADED
    ├── cgu_en.html
    ├── cgu_fr.html
    ├── cgu_es.html
    └── cgu_zh.html
```

---

## 🎯 Deployment Steps

### Step 1: Backup Current Version (2 min)

Via Hostinger File Manager:
1. Go to `public_html/annotation-tool-multilingual/`
2. Select: `index.html`, `i18n.js`, `app.js`
3. Right-click → **Compress**
4. Name: `backup_v4_YYYY-MM-DD.zip`
5. Download to your PC

### Step 2: Upload New Files (3 min)

1. Download from `/mnt/user-data/outputs/`:
   - `index.html` (905 lines, ~40 KB)
   - `i18n.js` (420 lines, ~35 KB)
   - `app.js` (369 lines, ~12 KB)

2. Upload to `annotation-tool-multilingual/` (overwrite existing)

### Step 3: Verify Permissions (30 sec)

Ensure these are still correct:
- `data/responses/` → **777** (write access)
- Everything else → **755**

### Step 4: Clear Caches (1 min)

1. **Server cache** (if Hostinger has one):
   - cPanel → Performance → Clear Cache

2. **Browser cache**:
   - `Ctrl + Shift + R` (hard reload)
   - Or open in Incognito mode

### Step 5: Test Complete Flow (10 min)

#### Test 1: Welcome Screen
- [ ] Go to https://alankleden.com/annotation-tool-multilingual/
- [ ] See welcome screen with instructions
- [ ] Click language selector (EN/FR/ES/ZH)
- [ ] Instructions change language
- [ ] Resource buttons display correctly
- [ ] Click PDF button → Opens correct PDF
- [ ] Click Video button → Opens correct YouTube video

#### Test 2: Annotation Flow
- [ ] Click "Start Annotation" button
- [ ] See first excerpt with Fc/Fi rating
- [ ] Select Fc=3, Fi=1
- [ ] Click "Next" → Goes to excerpt 2
- [ ] Close browser tab
- [ ] Reopen URL → Asks to continue session
- [ ] Click "Yes" → Returns to excerpt 2

#### Test 3: LocalStorage
- [ ] Open DevTools (F12) → Application → Local Storage
- [ ] See `axiodynamic_session` with JSON data
- [ ] Complete an annotation → JSON updates immediately

#### Test 4: Contact Form
- [ ] Complete all 12 excerpts
- [ ] See completion screen with stats
- [ ] Fill contact form (test email)
- [ ] Check both consent checkboxes
- [ ] Click "Send and Receive Certificate"
- [ ] See success message
- [ ] Check `data/responses/` → New files created

---

## 🧪 Validation Checklist

### Welcome Screen ✅
- [ ] Title translated
- [ ] Instructions visible
- [ ] Échelle 0-5 explained
- [ ] 2 resource buttons work
- [ ] Start button works

### Language Switching ✅
- [ ] EN/FR/ES/ZH selector works
- [ ] All text updates
- [ ] PDF links change
- [ ] Video links change
- [ ] CGU links change

### Annotation Flow ✅
- [ ] 12 excerpts load
- [ ] Progress bar updates
- [ ] Fc/Fi mandatory
- [ ] Comment optional
- [ ] Previous/Next buttons work
- [ ] Last excerpt → Contact form

### LocalStorage ✅
- [ ] Session saves after each annotation
- [ ] Page reload → Offers to continue
- [ ] "Continue" → Returns to correct excerpt
- [ ] "Start new" → Clears localStorage

### Contact Form ✅
- [ ] Name/Email required
- [ ] Affiliation optional
- [ ] Certificate checkbox required
- [ ] Newsletter checkbox optional
- [ ] Email validation works
- [ ] CGU link works
- [ ] Submission saves to server

### Data Collection ✅
- [ ] `data/responses/annotations_consolidated.csv` updates
- [ ] `data/responses/contacts_consolidated.csv` updates
- [ ] Individual JSON files created
- [ ] `submissions.log` updates
- [ ] `contacts.log` updates

---

## 📊 Expected Behavior

### First Visit
```
1. Welcome screen (EN by default)
2. User reads instructions
3. User clicks resource links (optional)
4. User clicks "Start Annotation"
5. Annotation screen (excerpt 1/12)
```

### During Annotation
```
1. User selects Fc + Fi (mandatory)
2. User adds comment (optional)
3. User clicks "Next"
4. → Annotation saved to localStorage
5. → Next excerpt loads
6. Repeat until 12/12
```

### After 12 Excerpts
```
1. Contact screen appears
2. Shows: 12 annotations, X minutes
3. User fills form + consent
4. User clicks "Send"
5. → Data sent to server
6. → localStorage cleared
7. → Success message
```

### Page Reload (Mid-Session)
```
1. User reloads page
2. Alert: "Continue session?"
3. User clicks "OK"
4. → Returns to last excerpt
5. → Previous annotations preserved
```

---

## 🐛 Troubleshooting

### Issue: Welcome screen not showing
**Fix:** Clear browser cache (Ctrl+Shift+R)

### Issue: Resource links 404
**Check:**
- PDFs in `docs/` folder with exact names
- Video URLs correct in `i18n.js`

### Issue: Language doesn't change
**Check:**
- `i18n.js` uploaded correctly
- Browser console for errors (F12)

### Issue: LocalStorage not working
**Check:**
- Browser allows localStorage (not Private mode)
- Clear old localStorage: `localStorage.clear()`

### Issue: Contact form not submitting
**Check:**
- `api/submit_contact.php` exists
- `api/submit.php` exists
- `data/responses/` has 777 permissions
- Browser console for errors

### Issue: Data not saving to server
**Check:**
- PHP files have correct endpoints
- Network tab shows POST requests
- Server PHP logs for errors

---

## 🔗 Resource Links Validation

### PDF Links
| Language | Expected Path |
|----------|---------------|
| EN | `docs/EN_ANNOTATION_GUIDELINES_v3.1.pdf` |
| FR | `docs/FR_ANNOTATION_GUIDELINES_v3.1.pdf` |
| ES | `docs/ES_ANNOTATION_GUIDELINES_v3.1.pdf` |
| ZH | `docs/ZH_ANNOTATION_GUIDELINES_v3.1.pdf` |

### Video Links
| Language | YouTube URL |
|----------|-------------|
| EN | https://youtu.be/52zzwq6ITrg |
| FR | https://youtu.be/cYTx5p3hu7I |
| ES | https://youtu.be/fyMR9K6uQgk |
| ZH | https://youtu.be/pBfO-YWitJg |

### CGU Links
| Language | Expected Path |
|----------|---------------|
| EN | `cgu/cgu_en.html` |
| FR | `cgu/cgu_fr.html` |
| ES | `cgu/cgu_es.html` |
| ZH | `cgu/cgu_zh.html` |

---

## 📈 Success Metrics

After deployment, verify:

1. **Welcome Screen**: ✅ Instructions visible, resources work
2. **Language Switch**: ✅ All 4 languages work
3. **Annotation Flow**: ✅ 12 excerpts complete
4. **LocalStorage**: ✅ Session recovery works
5. **Contact Form**: ✅ Email collected, data saved
6. **File Generation**: ✅ CSV/JSON files created

---

## 🎉 Post-Deployment

### Announce to Users

**Email template:**

```
Subject: 📊 New Axiodynamic Annotation Tool - Now Live!

Dear participant,

We've upgraded the annotation tool with:
✅ Clear instructions before starting
✅ Resource guides (PDF + Video)
✅ Auto-save (no data loss)
✅ Contact form at the end (no friction)

URL: https://alankleden.com/annotation-tool-multilingual/

Duration: 15-20 minutes
Languages: EN, FR, ES, ZH
Certificate: Sent by email

Thank you for your contribution!
Alan Kleden
```

### Monitor Initial Usage

1. Check `data/responses/` daily for new submissions
2. Monitor email for bug reports
3. Verify certificate emails are sent
4. Track completion rate (12/12 vs dropouts)

---

## 🆘 Support

If issues persist after following this guide:

1. Check browser console (F12) for JavaScript errors
2. Check server PHP error logs
3. Contact Hostinger support for server issues
4. Test in different browsers (Chrome, Firefox, Safari)

**Version:** 5.0  
**Date:** 2025-10-29  
**Status:** Ready for Production ✅

