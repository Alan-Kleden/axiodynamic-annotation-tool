// app.js - Logique de l'application d'annotation v3.0
// Nouveautés: 12 excerpts, sauvegarde auto, restauration session, axiotypes

// État global
let currentIndex = 0;
let annotations = [];
let sessionId = null;
let startTime = null;
const STORAGE_KEY = 'annotation_session';

// Génération ID de session unique
function generateSessionId() {
    return 'ANN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Sauvegarder la session dans localStorage
function saveSession() {
    const sessionData = {
        sessionId: sessionId,
        currentIndex: currentIndex,
        annotations: annotations,
        startTime: startTime,
        lastSaved: new Date().toISOString()
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        console.log('✅ Session sauvegardée:', sessionData.sessionId);
    } catch (e) {
        console.error('❌ Erreur sauvegarde:', e);
    }
}

// Charger une session existante
function loadSession() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const sessionData = JSON.parse(saved);
            console.log('📂 Session trouvée:', sessionData.sessionId);
            return sessionData;
        }
    } catch (e) {
        console.error('❌ Erreur chargement:', e);
    }
    return null;
}

// Supprimer la session
function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Session supprimée');
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('Version: 3.0 - 12 excerpts, sauvegarde auto, axiotypes');
    
    // Vérifier s'il existe une session en cours
    const savedSession = loadSession();
    
    if (savedSession && savedSession.annotations.length > 0) {
        // Proposer de reprendre
        showResumeDialog(savedSession);
    } else {
        // Nouvelle session
        sessionId = generateSessionId();
        console.log('Nouvelle session:', sessionId);
    }
});

// Afficher dialogue "Reprendre la session"
function showResumeDialog(savedSession) {
    const completed = savedSession.annotations.length;
    const total = EXCERPTS.length;
    
    const message = `Vous avez une session en cours (${completed}/${total} extraits annotés). Voulez-vous continuer ?`;
    
    if (confirm(message)) {
        // Reprendre
        sessionId = savedSession.sessionId;
        currentIndex = savedSession.currentIndex;
        annotations = savedSession.annotations;
        startTime = savedSession.startTime;
        
        // Aller directement à l'annotation
        document.getElementById('welcomePage').classList.add('hidden');
        document.getElementById('annotationPage').classList.remove('hidden');
        loadExcerpt(currentIndex);
        updateProgress();
        
        console.log('▶️ Session reprise:', sessionId);
    } else {
        // Recommencer
        clearSession();
        sessionId = generateSessionId();
        console.log('🔄 Nouvelle session:', sessionId);
    }
}

// Démarrer l'annotation
function startAnnotation() {
    document.getElementById('welcomePage').classList.add('hidden');
    document.getElementById('annotationPage').classList.remove('hidden');
    startTime = Date.now();
    loadExcerpt(0);
    updateProgress();
}

// Charger un extrait
function loadExcerpt(index) {
    currentIndex = index;
    const excerpt = EXCERPTS[index];
    
    // Mettre à jour l'interface
    document.getElementById('actorName').textContent = excerpt.author || excerpt.actor;
    document.getElementById('excerptNum').textContent = `${index + 1}/${EXCERPTS.length}`;
    
    // Afficher axiotype si disponible
    const actorNameElem = document.getElementById('actorName');
    if (excerpt.axiotype) {
        actorNameElem.innerHTML = `
            ${excerpt.author} 
            <span class="axiotype-badge axiotype-${excerpt.axiotype.toLowerCase()}">${excerpt.axiotype}</span>
        `;
    }
    
    // Afficher telos et institution
    let telosHTML = excerpt.telos;
    if (excerpt.institution) {
        telosHTML = `<strong>${excerpt.institution}</strong><br>${excerpt.telos}`;
    }
    document.getElementById('telosText').innerHTML = telosHTML;
    
    document.getElementById('excerptText').textContent = excerpt.text;
    
    // Créer les boutons
    createButtons('fcButtons', 'fc');
    createButtons('fiButtons', 'fi');
    
    // Réinitialiser le commentaire
    document.getElementById('commentBox').value = '';
    
    // Charger annotation existante si présente
    const existingAnnotation = annotations[index];
    if (existingAnnotation) {
        setButtonSelected('fcButtons', existingAnnotation.fc);
        setButtonSelected('fiButtons', existingAnnotation.fi);
        document.getElementById('commentBox').value = existingAnnotation.comment || '';
        // Réactiver le bouton Suivant si annotation complète
        document.getElementById('nextButton').disabled = false;
    }
    
    // Boutons navigation
    document.getElementById('prevButton').disabled = (index === 0);
    if (!existingAnnotation) {
        document.getElementById('nextButton').disabled = true; // Désactivé pour nouveau
    }
    
    updateProgress();
}

// Créer les boutons de notation 0-5
function createButtons(containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 0; i <= 5; i++) {
        const button = document.createElement('button');
        button.className = 'rating-btn';
        button.textContent = i;
        button.onclick = () => selectRating(containerId, type, i);
        container.appendChild(button);
    }
}

// Sélectionner une note
function selectRating(containerId, type, value) {
    setButtonSelected(containerId, value);
    
    // Vérifier si les deux notes sont complètes
    const fcSelected = document.querySelector('#fcButtons .selected');
    const fiSelected = document.querySelector('#fiButtons .selected');
    
    if (fcSelected && fiSelected) {
        document.getElementById('nextButton').disabled = false;
    }
}

// Marquer un bouton comme sélectionné
function setButtonSelected(containerId, value) {
    const buttons = document.querySelectorAll(`#${containerId} .rating-btn`);
    buttons.forEach(btn => {
        if (parseInt(btn.textContent) === value) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

// Soumettre et passer au suivant
async function submitAndNext() {
    const fcButton = document.querySelector('#fcButtons .selected');
    const fiButton = document.querySelector('#fiButtons .selected');
    
    if (!fcButton || !fiButton) {
        alert('Veuillez sélectionner une valeur pour Fc ET Fi');
        return;
    }
    
    const fc = parseInt(fcButton.textContent);
    const fi = parseInt(fiButton.textContent);
    const comment = document.getElementById('commentBox').value.trim();
    
    // Enregistrer l'annotation
    const annotation = {
        excerpt_id: EXCERPTS[currentIndex].id,
        author: EXCERPTS[currentIndex].author || EXCERPTS[currentIndex].actor,
        axiotype: EXCERPTS[currentIndex].axiotype || 'Unknown',
        fc: fc,
        fi: fi,
        comment: comment,
        duration_seconds: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString()
    };
    
    annotations[currentIndex] = annotation;
    
    // Sauvegarder immédiatement dans localStorage
    saveSession();
    
    // Passer au suivant ou terminer
    if (currentIndex < EXCERPTS.length - 1) {
        loadExcerpt(currentIndex + 1);
    } else {
        // Toutes les annotations complètes, envoyer au serveur
        await submitAllAnnotations();
    }
}

// Retour à l'extrait précédent
function previousExcerpt() {
    if (currentIndex > 0) {
        loadExcerpt(currentIndex - 1);
    }
}

// Mettre à jour la barre de progression
function updateProgress() {
    const progress = ((currentIndex + 1) / EXCERPTS.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Soumettre toutes les annotations au serveur
async function submitAllAnnotations() {
    const submitData = {
        session_id: sessionId,
        annotations: annotations.filter(a => a !== undefined),
        completed_at: new Date().toISOString(),
        total_duration_seconds: Math.floor((Date.now() - startTime) / 1000)
    };
    
    try {
        const response = await fetch('api/submit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
        });
        
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Supprimer la session locale après envoi réussi
            clearSession();
            
            // Afficher page de fin
            showCompletionPage();
        } else {
            throw new Error(result.error || 'Erreur serveur');
        }
    } catch (error) {
        console.error('Erreur envoi serveur:', error);
        
        // Garder en localStorage pour retry
        saveSession();
        
        // Afficher page de fin quand même (données sauvegardées localement)
        showCompletionPage();
    }
}

// Afficher la page de fin
function showCompletionPage() {
    document.getElementById('annotationPage').classList.add('hidden');
    document.getElementById('completionPage').classList.remove('hidden');
    document.getElementById('sessionId').textContent = sessionId;
    document.getElementById('progressFill').style.width = '100%';
}

// Afficher un message d'erreur
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// Soumettre les coordonnées du participant
async function submitContact(event) {
    event.preventDefault();
    
    const name = document.getElementById('participantName').value.trim();
    const email = document.getElementById('participantEmail').value.trim();
    const affiliation = document.getElementById('participantAffiliation').value.trim();
    
    // Validation basique
    if (!name || !email) {
        showError('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Veuillez entrer une adresse email valide');
        return;
    }
    
    const submitBtn = document.getElementById('submitContactBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    
    try {
        const contactData = {
            session_id: sessionId,
            name: name,
            email: email,
            affiliation: affiliation || 'Non spécifié',
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch('api/submit_contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Masquer le formulaire et afficher le message de succès
            document.getElementById('contactForm').classList.add('hidden');
            document.getElementById('contactSuccess').classList.remove('hidden');
            
            // Supprimer la session localStorage (annotation terminée)
            clearSession();
        } else {
            throw new Error(result.error || 'Erreur lors de l\'envoi');
        }
    } catch (error) {
        showError('Erreur lors de l\'envoi des coordonnées. Veuillez réessayer.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer mes coordonnées';
        console.error('Erreur:', error);
        
        // Supprimer quand même la session après plusieurs tentatives
        // L'utilisateur a terminé l'annotation, on ne doit pas le bloquer
        setTimeout(() => {
            clearSession();
        }, 10000); // 10 secondes après l'erreur
    }
}
