// app.js - Multilingual Annotation Tool v5.0
// With localStorage, email at the end, and welcome screen

console.log('Version: 5.0 - Multilingual with LocalStorage');

// Global variables
window.currentLanguage = 'en'; // Initialize globally
let currentLanguage = 'en';
let currentIndex = 0;
let excerpts = [];
let annotations = [];
let sessionId = '';
let startTime = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (['en', 'fr', 'es', 'zh'].includes(browserLang)) {
        currentLanguage = browserLang;
        window.currentLanguage = browserLang; // Sync global variable
    }
    
    // Set language selector
    document.getElementById('language-select').value = currentLanguage;
    
    // Load translations
    updateTranslations();
    updateResourceLinks();
    
    // Generate session ID
    sessionId = 'ANN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log('Session:', sessionId);
    
    // Check if there's a saved session
    checkSavedSession();
});
// === Home / Reset helpers (plug-in léger) ===

// Revenir à l'accueil SANS relancer la reprise auto
function returnToHome() {
  // On mémorise que la reprise auto doit être ignorée au prochain load
  sessionStorage.setItem('suppress_resume', '1');
  // On revient visuellement à l'accueil sans toucher aux annotations sauvegardées
  showScreen('welcome');
}
// --- Refaire le quiz (efface les drapeaux du gate) ---
// --- Refaire le quiz (efface les drapeaux du gate) ---
function redoQuiz() {
  // Effacer l'état du quiz via quiz_gate
  if (window.quizGate && typeof window.quizGate.resetQuiz === 'function') {
    window.quizGate.resetQuiz();
  } else {
    // Fallback si quiz_gate pas encore chargé
    localStorage.removeItem('quiz_passed_v1');
    localStorage.removeItem('quiz_score_v1');
    localStorage.removeItem('quiz_attempts_v1');
  }
  
  // Empêcher la reprise auto au reload
  sessionStorage.setItem('suppress_resume', '1');
}

// Effacer complètement la session locale (optionnel)
function resetAllProgress() {
  if (!confirm(t('confirmReset') || 'Effacer la session locale et recommencer ?')) return;
  // Tes helpers existants
  localStorage.clear();
  sessionStorage.clear();
  // Retour propre à l'accueil
  showScreen('welcome');
  // (Optionnel) petit toast
  // showMessage(t('resetDone') || 'Données locales effacées.', 'success');
}

// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    window.currentLanguage = lang; // Make it globally accessible
    updateTranslations();
    updateResourceLinks();
    
    // Reload excerpts for new language
    if (window.EXCERPTS && window.EXCERPTS[lang]) {
        excerpts = window.EXCERPTS[lang];
        console.log(`Loaded ${excerpts.length} excerpts for language: ${lang}`);
    }
    
    // Update current excerpt if on annotation screen
    if (document.getElementById('annotation-screen').classList.contains('active')) {
        loadExcerpt(currentIndex);
    }
}

// Update resource links based on language
function updateResourceLinks() {
    const pdfLink = translations[currentLanguage].pdfLink;
    const videoLink = translations[currentLanguage].videoLink;
    const cguLink = translations[currentLanguage].cguLink;
    
    document.getElementById('pdf-link').href = pdfLink;
    document.getElementById('video-link').href = videoLink;
    document.getElementById('cgu-link').href = cguLink;
    document.getElementById('footer-cgu-link').href = cguLink; // Footer CGU link
}

// Check if there's a saved session in localStorage
function checkSavedSession() {
  // 1) Ne pas proposer la reprise si l'utilisateur vient de demander "Accueil"
  if (sessionStorage.getItem('suppress_resume') === '1') {
    sessionStorage.removeItem('suppress_resume');
    return; // rester sur l'écran d'accueil
  }

  // 2) Politique persistante : 'never' = ne jamais proposer la reprise
  const policy = localStorage.getItem('resume_policy') || 'ask';
  if (policy === 'never') return;

  // 3) Charger la session sauvegardée
  const savedSession = localStorage.getItem('axiodynamic_session');
  if (!savedSession) return;

  let session;
  try {
    session = JSON.parse(savedSession);
  } catch {
    // JSON corrompu → on nettoie
    localStorage.removeItem('axiodynamic_session');
    return;
  }

  // 4) Préparer le message (i18n) puis demander
  const msg =
    (typeof t === 'function' && t('continueSession')) ||
    'Resume your previous session?';

  if (!confirm(msg)) {
    // Refus : on efface la session et on reste à l'accueil
    clearSession();
    return;
  }

  // 5) Reprise acceptée → restaurer l'état et afficher l'annotation
  sessionId       = session.sessionId;
  currentLanguage = session.language;
  currentIndex    = session.currentIndex;
  annotations     = session.annotations;
  startTime       = new Date(session.startTime);

  // UI langage
  const sel = document.getElementById('language-select');
  if (sel) sel.value = currentLanguage;
  changeLanguage(currentLanguage);

  // Aller directement à l'annotation
  showScreen('annotation');
  loadExcerpt(currentIndex);
}


// Start annotation
function startAnnotation() {
    localStorage.removeItem('resume_policy'); // repasser en mode 'ask'

    // Synchronize language variables
    const lang = window.currentLanguage || currentLanguage;
    
    // Load excerpts for current language
    if (window.EXCERPTS && window.EXCERPTS[lang]) {
        excerpts = window.EXCERPTS[lang];
        console.log(`Loaded ${excerpts.length} excerpts for language: ${lang}`);
    } else {
        console.error('EXCERPTS object:', window.EXCERPTS);
        console.error('Requested language:', lang);
        alert('Error: No excerpts available for this language.');
        return;
    }
    
    // Initialize
    currentIndex = 0;
    annotations = [];
    startTime = new Date();
    
    // Save initial state
    saveSessionToLocalStorage();
    
    // Show annotation screen
    showScreen('annotation');
    loadExcerpt(0);
}

// Show a specific screen
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenName + '-screen').classList.add('active');
    
    // Hide language selector on annotation and contact screens
    const langSelector = document.querySelector('.language-selector');
    if (screenName === 'welcome') {
        langSelector.style.display = 'flex';
    } else {
        langSelector.style.display = 'none';
    }
}

// Load excerpt
function loadExcerpt(index) {
    if (index < 0 || index >= excerpts.length) return;
    
    currentIndex = index;
    const excerpt = excerpts[index];
    
    // Update UI
    document.getElementById('current-number').textContent = index + 1;
    document.getElementById('total-number').textContent = excerpts.length;
    document.getElementById('actor-name').textContent = excerpt.author + ' (' + excerpt.institution + ')';
    document.getElementById('document-name').textContent = excerpt.id;
    document.getElementById('telos-text').textContent = excerpt.telos;
    document.getElementById('excerpt-text').textContent = excerpt.text;
    
    // Update progress bar
    const progress = ((index + 1) / excerpts.length) * 100;
    document.getElementById('progress-bar-fill').style.width = progress + '%';
    
    // Load saved annotation if exists
    const savedAnnotation = annotations.find(a => a.excerpt_id === excerpt.id);
    if (savedAnnotation) {
        document.getElementById('fc' + savedAnnotation.fc).checked = true;
        document.getElementById('fi' + savedAnnotation.fi).checked = true;
        document.getElementById('comment').value = savedAnnotation.comment || '';
    } else {
        // Clear previous selections
        document.querySelectorAll('input[name="fc"]').forEach(r => r.checked = false);
        document.querySelectorAll('input[name="fi"]').forEach(r => r.checked = false);
        document.getElementById('comment').value = '';
    }
    
    // Update buttons
    document.getElementById('prev-btn').disabled = (index === 0);
    updateNextButton();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Update next button state
function updateNextButton() {
    const fcSelected = document.querySelector('input[name="fc"]:checked');
    const fiSelected = document.querySelector('input[name="fi"]:checked');
    const nextBtn = document.getElementById('next-btn');
    
    nextBtn.disabled = !(fcSelected && fiSelected);
}

// Listen to rating changes
document.addEventListener('change', (e) => {
    if (e.target.name === 'fc' || e.target.name === 'fi') {
        updateNextButton();
    }
});

// Previous excerpt
function previousExcerpt() {
    if (currentIndex > 0) {
        saveCurrentAnnotation();
        loadExcerpt(currentIndex - 1);
    }
}

// Next excerpt
function nextExcerpt() {
    saveCurrentAnnotation();
    
    if (currentIndex < excerpts.length - 1) {
        // Go to next excerpt
        loadExcerpt(currentIndex + 1);
    } else {
        // All excerpts annotated, go to contact screen
        finishAnnotation();
    }
}

// Save current annotation
function saveCurrentAnnotation() {
    const excerpt = excerpts[currentIndex];
    
    const fcInput = document.querySelector('input[name="fc"]:checked');
    const fiInput = document.querySelector('input[name="fi"]:checked');
    const comment = document.getElementById('comment').value;
    
    if (!fcInput || !fiInput) return;
    
    const annotation = {
        excerpt_id: excerpt.id,
        actor: excerpt.actor,
        telos: excerpt.telos,
        fc: parseInt(fcInput.value),
        fi: parseInt(fiInput.value),
        comment: comment,
        timestamp: new Date().toISOString(),
        duration_seconds: Math.floor((new Date() - startTime) / 1000)
    };
    
    // Remove previous annotation for this excerpt if exists
    annotations = annotations.filter(a => a.excerpt_id !== excerpt.id);
    
    // Add new annotation
    annotations.push(annotation);
    
    // Save to localStorage
    saveSessionToLocalStorage();
    
    console.log('Annotation saved:', annotation);
}

// Save session to localStorage
function saveSessionToLocalStorage() {
    const session = {
        sessionId: sessionId,
        language: currentLanguage,
        currentIndex: currentIndex,
        annotations: annotations,
        startTime: startTime.toISOString(),
        lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('axiodynamic_session', JSON.stringify(session));
}

// Clear session from localStorage
function clearSession() {
    localStorage.removeItem('axiodynamic_session');
}

// Finish annotation
function finishAnnotation() {
    // Calculate total time
    const endTime = new Date();
    const totalMinutes = Math.floor((endTime - startTime) / 1000 / 60);
    
    // Update completion stats
    document.getElementById('total-annotations').textContent = annotations.length;
    document.getElementById('total-time').textContent = totalMinutes;
    
    // Show contact screen
    showScreen('contact');
        if (localStorage.getItem('cert_sent_v1') === '1') {
    showCertSentUI();
    }

}

// Submit contact information
async function submitContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const affiliation = document.getElementById('affiliation').value.trim() || 'Non spécifié';
    const consentCertificate = document.getElementById('consent-certificate').checked;
    const consentNewsletter = document.getElementById('consent-newsletter').checked;
    
    // Validation
    if (!name || !email) {
        showMessage(t('errorMissingFields'), 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage(t('errorInvalidEmail'), 'error');
        return;
    }
     
    if (!consentCertificate) {
        showMessage(t('errorMissingConsent'), 'error');
        return;
    }
    
    // Prepare data
    const contactData = {
        session_id: sessionId,
        name: name,
        email: email,
        affiliation: affiliation,
        consent_certificate: consentCertificate,
        consent_newsletter: consentNewsletter,
        language: currentLanguage,
        timestamp: new Date().toISOString()
    };
    
    const annotationsData = {
        session_id: sessionId,
        language: currentLanguage,
        annotations: annotations,
        timestamp: new Date().toISOString()
    };
    
    // Disable submit button
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = t('sending') || 'Sending...';
    
    try {
        // Save contact
        await fetch('api/submit_contact.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        
        // Save annotations
        await fetch('api/submit.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(annotationsData)
        });
        
    try {
        const resp = await fetch('api/send_certificate.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                email: email,
                affiliation: affiliation,
                session_id: sessionId,
                language: currentLanguage
            })
        });

        // Even if resp is not 200, we continue UI but log it.
        if (!resp.ok) console.warn('send_certificate.php returned', resp.status);

        // Mark certificate as sent and switch UI now
        localStorage.setItem('cert_sent_v1', '1');
        showCertSentUI();                 // hides form, shows green success block
        if (typeof showMessage === 'function') {
            showMessage(t('successMessage'), 'success');
        }

        console.log('Certificate sent');
    } catch (certError) {
        console.error('Certificate sending failed:', certError);
        // Don't block the user flow if certificate fails
    }
        
        // Success
        showMessage(t('successMessage'), 'success');
        
        // Clear localStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Hide form
        document.getElementById('contact-form').style.display = 'none';
        
        console.log('Submission successful');
        
    } catch (error) {
        console.error('Submission error:', error);
        showMessage('Error: Could not submit data. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = t('submitButton');
    }
}

// Show message
function showMessage(message, type) {
    const container = document.getElementById('message-container');
    const className = type === 'success' ? 'success-message' : 'error-message';
    container.innerHTML = `<div class="${className}">${message}</div>`;
    
    // Scroll to message
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

    // Validate email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    function showCertSentUI() {
    const block = document.getElementById('cert-block');
    const sent  = document.getElementById('cert-sent');
        if (block) block.style.display = 'none';
        if (sent) {
            // garantit la langue active
            if (typeof t === 'function') {
            const span = sent.querySelector('[data-i18n="successMessage"]');
            if (span) span.textContent = t('successMessage');
            }
            sent.style.display = 'block';
        }
    }

console.log('App initialized');
