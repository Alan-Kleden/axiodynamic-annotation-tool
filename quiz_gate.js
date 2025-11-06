/* quiz_gate.js — v3.4 (modal + anti-bypass + Option B dominance=3 + no target reveal)
   - Modal superposé (#quiz-modal / #quiz-card) avec conteneur #quiz-container
   - Verrou avant annotation tant que le quiz n’est pas validé
   - Chargement codebook JSON (chemin paramétrable)
   - Scoring : catégorie (dominance si |Fc−Fi| >= M_DOM, sinon égalité) + intensité (±1)
   - Cohérence blocage (Fi minimal si “block” explicite)
   - LocalStorage : quizPassed, quizScore, quizAttempts, quizVersion
*/

(function () {
  "use strict";

  // ====== Config ======
  const AUTO_SHOW_ON_LOAD = false; // ne pas forcer l’ouverture au chargement
  const PATH_CODEBOOK = "data/codebook_v1.json";   // Ajustez selon votre arbo
  const LS_KEYS = {
    PASSED: "quiz_passed_v1",
    SCORE: "quiz_score_v1",
    ATTEMPTS: "quiz_attempts_v1",
    VERSION: "quiz_version_v1"
  };
  const QUIZ_VERSION    = "v3.4-dom3";
  const PASS_THRESHOLD  = 0.70;
  const NUM_QUESTIONS   = 6;
  const TOL_FC_FI       = 1;  // |Fc - Fc*|, |Fi - Fi*| tolérés
  const TOL_DELTA       = 1;  // conservé si vous l’utilisiez ailleurs (non requis ici)
  const M_DOM = 3;            // Option B : dominance claire si |Fc−Fi| ≥ 3, sinon ÉGALITÉ
  const MIN_FI_IF_BLOCK = 3;  // si blocage explicite
  const MIN = 0, MAX = 5;

  // Feedback dev : ne JAMAIS activer en prod (révèle les cibles)
  const SHOW_TARGETS = false;

  // ====== Utils ======
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const clamp01 = (v) => Math.max(MIN, Math.min(MAX, v|0));
  const t = (key, fallback) => {
    try {
      if (window.translations) {
        const lang = window.currentLanguage
          || $("#language-select")?.value
          || "fr";
        return window.translations[lang]?.[key]
            || window.translations["en"]?.[key]
            || fallback || key;
      }
    } catch {}
    return fallback || key;
  };
  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function saveLS(k, v){ try{ localStorage.setItem(k, String(v)); }catch{} }
  function getLS(k){ try{ return localStorage.getItem(k); }catch{ return null; } }
  function delLS(k){ try{ localStorage.removeItem(k); }catch{} }

  // Réinitialisation douce (sans gonfler artificiellement les tentatives)
  function clearQuizState(){
    saveLS(LS_KEYS.PASSED, "false");
    saveLS(LS_KEYS.SCORE,  "");
    // on NE touche PAS aux tentatives ici
  }

  // Normalise l’état LS et force un re-quiz si la version a changé
  function normalizeQuizState(){
    if (getLS(LS_KEYS.PASSED)   === null) saveLS(LS_KEYS.PASSED,   "false");
    if (getLS(LS_KEYS.SCORE)    === null) saveLS(LS_KEYS.SCORE,    "");
    if (getLS(LS_KEYS.ATTEMPTS) === null) saveLS(LS_KEYS.ATTEMPTS, "0");
    if (getLS(LS_KEYS.VERSION)  === null) saveLS(LS_KEYS.VERSION,  QUIZ_VERSION);

    const v = getLS(LS_KEYS.VERSION);
    if (v !== QUIZ_VERSION){
      // version mismatch → on impose de repasser le quiz
      saveLS(LS_KEYS.PASSED,  "false");
      saveLS(LS_KEYS.SCORE,   "");
      saveLS(LS_KEYS.VERSION, QUIZ_VERSION);
      console.log("[quiz_gate] version mismatch → reset quiz:", v, "→", QUIZ_VERSION);
    }
  }


  // ====== Catégorisation relationnelle (Option B) ======
  // cat(d) =  1 si dominance Fc (d >= M_DOM)
  //           0 si ÉGALITÉ par défaut (|d| < M_DOM)
  //          -1 si dominance Fi (d <= -M_DOM)
  function cat(d){
    return Math.abs(d) >= M_DOM ? (d > 0 ? 1 : -1) : 0;
  }
  function relLabel(d){
    // étiquette lisible pour le feedback, sans révéler les cibles
    const c = cat(d);
    return c === 1 ? "Fc > Fi" : c === -1 ? "Fc < Fi" : "Fc ≈ Fi";
  }

  // ====== Modal ======
  function createQuizModal() {
    // Backdrop
    let modal = document.getElementById("quiz-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "quiz-modal";
      Object.assign(modal.style, {
        position: "fixed", inset: "0",
        background: "rgba(0,0,0,.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: "9999"
      });
      document.body.appendChild(modal);
    }
    // Card
    let card = document.getElementById("quiz-card");
    if (!card) {
      card = document.createElement("div");
      card.id = "quiz-card";
      Object.assign(card.style, {
        width: "min(920px, 92vw)", maxHeight: "88vh", overflow: "auto",
        background: "#fff", borderRadius: "12px",
        boxShadow: "0 12px 28px rgba(0,0,0,.25)",
        padding: "16px 18px"
      });
      modal.appendChild(card);
    }
    // Container
    let container = document.getElementById("quiz-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "quiz-container";
      card.appendChild(container);
    }
    // Empêche le scroll du fond
    document.documentElement.style.overflow = "hidden";
    return container;
  }
  function destroyQuizModal() {
    const modal = document.getElementById("quiz-modal");
    if (modal) modal.remove();
    document.documentElement.style.overflow = "";
  }

  // ====== État ======
  let codebook = [];
  let quizItems = [];
  let answers = [];

  // ====== Scoring ======
  function scoreOne(item, ans){
    const FcT = clamp01(Number(item.Fc_target));
    const FiT = clamp01(Number(item.Fi_target));
    const Fc  = clamp01(Number(ans.Fc));
    const Fi  = clamp01(Number(ans.Fi));

    const hasBlock = (Array.isArray(item.block_quotes) && item.block_quotes.length>0)
                  || (item.blocker_type && item.blocker_type !== "null");

    const deltaT = FcT - FiT;
    const deltaU = Fc  - Fi;

    // Catégorie stricte selon Option B
    const sameCategory = (cat(deltaT) === cat(deltaU));

    // Intensité : tolérance intra-catégorie ±1 par dimension
    const nearFc = Math.abs(Fc - FcT) <= TOL_FC_FI;
    const nearFi = Math.abs(Fi - FiT) <= TOL_FC_FI;

    // Cohérence “blocage” (si l’item signale un frein explicite)
    const fiLogicOK = hasBlock ? (Fi >= MIN_FI_IF_BLOCK) : true;

    // Structure : strict sur la catégorie, sinon pénalité forte
    let sStruct = sameCategory ? 1 : 0.2;

    // Intensité : identique à votre logique actuelle
    let sIntensity = (nearFc && nearFi) ? 1 : (nearFc || nearFi) ? 0.5 : 0.2;

    // Score final
    let s = 0.6*sStruct + 0.4*sIntensity;
    if (!fiLogicOK) s *= 0.7;

    return Math.max(0, Math.min(1, s));
  }
  function computeScore(){
    const perItem = answers.map(a => {
      const it = quizItems.find(q => q.id === a.id);
      return { id: a.id, s: scoreOne(it, a) };
    });
    const mean = perItem.reduce((acc,x)=>acc+x.s,0) / (perItem.length || 1);
    return { perItem, mean };
  }

  // ====== UI ======
  function renderQuiz(container){
    container.innerHTML = `
      <h2>${t("quiz.title","🎯 Quiz Codebook")}</h2>
      <p>${t("quiz.instructions","Évaluez <strong>Fc</strong> et <strong>Fi</strong> pour chaque mini-texte.")}
      ${t("quiz.reminder","Rappel : si le <em>telos</em> est explicitement empêché, <strong>Fi</strong> ne peut être très bas.")}</p>
    `;


    const form = document.createElement("div");
    form.className = "quiz-form";
    quizItems.forEach((q, idx) => {
      const tipsPro = (q.pro_quotes || []).map(x => `<code>“${x}”</code>`).join(" ");
      const tipsBl  = (q.block_quotes || []).map(x => `<code>“${x}”</code>`).join(" ");
      const card = document.createElement("div");
      card.className = "quiz-card";
      card.dataset.qid = q.id;
      card.innerHTML = `
        <div class="q-header">
          <div class="q-num">${t("quiz.qnum","Q")}${idx+1}/${quizItems.length}</div>
          <div class="q-telos"><strong>${t("quiz.telos","Telos")} :</strong> <span style="color:#dc3545;font-weight:600;font-size:17px;">${q.telos||""}</span></div>
          <div class="q-explicitness">${t("quiz.explicit","Telos explicite")} : ${q.explicitness||"-"}/5</div>
        </div>
        <div class="q-stem" style="color:#003366;font-weight:600;font-size:16px;">${q.stem||""}</div>
        <details class="q-hints">
          <summary>${t("quiz.textual_indices","Indices textuels")}</summary>
          <ul>
            <li><strong>${t("quiz.pro_action","Pro-action (Fc)")} :</strong> ${tipsPro || "—"}</li>
            <li><strong>${t("quiz.block","Blocage (Fi)")} :</strong> ${tipsBl  || "—"}</li>
          </ul>
        </details>
        <div class="q-inputs">
          <label>${t("quiz.fc","Fc")} :
            <input type="range" min="0" max="5" step="1" value="0" class="inp-fc"/>
            <span class="val-fc">0</span>/5
          </label>
          <label>${t("quiz.fi","Fi")} :
            <input type="range" min="0" max="5" step="1" value="0" class="inp-fi"/>
            <span class="val-fi">0</span>/5
          </label>
        </div>
        <div class="q-feedback" aria-live="polite"></div>
      `;
      form.appendChild(card);
    });
    container.appendChild(form);

    const actions = document.createElement("div");
    actions.className = "quiz-actions";
    actions.innerHTML = `
      <button id="btn-quiz-submit" class="primary">${t("validate_quiz")}</button>
      <button id="btn-redo-quiz" class="ghost">${t("retry_quiz")}</button>
    `;

    container.appendChild(actions);

    $$(".quiz-card .inp-fc").forEach(inp => {
      inp.addEventListener("input", e => {
        const v = clamp01(parseInt(e.target.value,10));
        e.target.value = String(v);
        e.target.closest(".quiz-card").querySelector(".val-fc").textContent = String(v);
      });
    });
    $$(".quiz-card .inp-fi").forEach(inp => {
      inp.addEventListener("input", e => {
        const v = clamp01(parseInt(e.target.value,10));
        e.target.value = String(v);
        e.target.closest(".quiz-card").querySelector(".val-fi").textContent = String(v);
      });
    });

    // Soumission : empêcher double-clic et handlers multiples
    const submitBtn = document.getElementById("btn-quiz-submit");
    if (submitBtn){
      submitBtn.onclick = null; // nettoie tout handler résiduel
      submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        submitBtn.disabled = true;            // anti double-clic
        try { onSubmitQuiz(); } finally {     // (items déjà en portée via réponses collectées)
          submitBtn.disabled = false;
        }
      }, { once: true }); // 1 seule exécution pour ce rendu
    }

    // Refaire : reset propre sans impacter ATTEMPTS
    const redoBtn = document.getElementById("btn-redo-quiz");
    if (redoBtn){
      redoBtn.onclick = null;
      redoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        clearQuizState();
        showQuizGate(true);   // reconstruit le quiz dans le modal
      }, { once: true });
    }

  }

  function onSubmitQuiz(){
    answers = $$(".quiz-card").map(card => {
      const id = card.dataset.qid;
      const Fc = clamp01(parseInt(card.querySelector(".inp-fc")?.value || "0",10));
      const Fi = clamp01(parseInt(card.querySelector(".inp-fi")?.value || "0",10));
      return { id, Fc, Fi, card };
    });

    const { perItem, mean } = computeScore();

    perItem.forEach(({ id, s }) => {
      const a  = answers.find(x => x.id===id);
      const it = quizItems.find(x => x.id===id);
      const fb = a.card.querySelector(".q-feedback");
      const ok = s >= 0.7;

      const dU = a.Fc - a.Fi;
      const dT = it.Fc_target - it.Fi_target;

      fb.innerHTML = `
        ${ok ? "✅" : "⚠️"} ${t("quiz.item_score","Score item")} : ${(s*100).toFixed(0)}%
        <ul class="mini">
          <li>${t("quiz.you","Vous")} : ${t("quiz.fc","Fc")}=${a.Fc}, ${t("quiz.fi","Fi")}=${a.Fi}</li>
          <li>${t("quiz.expected_relation","Relation attendue")} : ${relLabel(dT)}</li>
          <li>${t("quiz.your_relation","Votre relation")} : ${relLabel(dU)} (${dU})</li>
          ${SHOW_TARGETS ? `<li style="opacity:.6">[Dev] ${t("quiz.dev_expected","Attendu")} : Fc=${it.Fc_target}, Fi=${it.Fi_target}</li>` : ``}
        </ul>
        ${
          (cat(dT) !== cat(dU) && Math.abs(dU) < M_DOM)
            ? `<div class="hint">${t("quiz.hint_separate","Astuce : écartez Fc et Fi d’au moins")} ${M_DOM} ${t("quiz.hint_points","points dans le bon sens.")}</div>`
            : ``
        }
      `;
      fb.classList.toggle("ok", ok);
      fb.classList.toggle("ko", !ok);
    });

    const passed = mean >= PASS_THRESHOLD;
    // +++ AJOUT : incrémenter le compteur de tentatives à chaque soumission
    const attempts = parseInt(getLS(LS_KEYS.ATTEMPTS) || "0", 10) || 0;
    saveLS(LS_KEYS.ATTEMPTS, String(attempts + 1));
    // --- fin ajout
    saveLS(LS_KEYS.SCORE, mean.toFixed(4));
    saveLS(LS_KEYS.PASSED, passed ? "true" : "false");
    saveLS(LS_KEYS.VERSION, QUIZ_VERSION);

    const container = $("#quiz-container");
    const panel = document.createElement("div");
    panel.className = "quiz-result";
    panel.innerHTML = `
      <hr/>
      <p><strong>${t("quiz.global_score","Score global")} :</strong> ${(mean*100).toFixed(0)}% — ${passed ? "✅" : "❌"}</p>
      <div class="quiz-actions">
        ${passed ? `<button id="btn-go-annot" class="primary">${t("startButton","Commencer")}</button>` : ""}
        <button id="btn-redo" class="ghost">${t("retry_quiz","Refaire le quiz")}</button>
      </div>
    `;
    container.appendChild(panel);

    // Bouton "Commencer l’annotation"
    const go = document.getElementById("btn-go-annot");
    if (go){
      go.onclick = null;
      go.addEventListener("click", (e) => {
        e.preventDefault();
        destroyQuizModal();
        if (typeof window.startAnnotation === 'function') {
          window.startAnnotation();
        } else {
          showAnnotation();
        }
      }, { once: true });
    }

    // Bouton "Refaire"
    const redo = document.getElementById("btn-redo");
    if (redo){
      redo.onclick = null;
      redo.addEventListener("click", (e) => {
        e.preventDefault();
        clearQuizState();
        showQuizGate(true);
      }, { once: true });
    }
  }

  // ====== Vues ======
  function showWelcome(){
    $("#welcome-screen")?.classList.remove("hidden");
    $("#quiz-screen")?.classList.add("hidden");
    $("#annotation-screen")?.classList.add("hidden");
  }
  function showQuizGate(force=false){
    const must = force || getLS(LS_KEYS.PASSED) !== "true";
    if (must) {
      $("#annotation-screen")?.classList.add("hidden");
      const host = createQuizModal(); // crée modal + #quiz-container
      host.innerHTML = "";            // reset
      buildQuiz();                    // rend dans #quiz-container
    } else {
      showAnnotation();
    }
  }
  function showAnnotation(){
    const ok = getLS(LS_KEYS.PASSED) === "true";
    if (!ok) { showQuizGate(true); return; }
    destroyQuizModal(); // sécurité
    $("#welcome-screen")?.classList.add("hidden");
    $("#quiz-screen")?.classList.add("hidden");
    $("#annotation-screen")?.classList.remove("hidden");
  }

  function buildQuiz(){
    const container = document.getElementById("quiz-container");
    if (!container) return;
    container.innerHTML = "";
    answers = [];

    const lang = (window.currentLanguage || $("#language-select")?.value || "fr").toLowerCase();
    const pool = codebook.filter(x => (x.lang||"").toLowerCase() === lang);
    const src  = pool.length >= NUM_QUESTIONS ? pool : codebook;
    quizItems  = shuffle(src).slice(0, NUM_QUESTIONS);

    renderQuiz(container);
  }

  // ====== Data ======
  async function loadCodebook(){
    try {
      const res = await fetch(PATH_CODEBOOK, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) throw new Error("Empty codebook");
      codebook = data;
      console.log("[quiz_gate] codebook OK:", PATH_CODEBOOK, "count=", data.length);
    } catch (e) {
      console.error("[quiz_gate] Codebook load failed:", e);
      codebook = []; // vide pour signaler le problème
    }
  }

  // ====== Init ======
  async function init(){
  normalizeQuizState(); // ← NEW : crée/recadre l’état LS et force re-quiz si version ≠
  console.log("[quiz_gate] version:", QUIZ_VERSION, "M_DOM=", M_DOM); // ← NEW

  // Garde-fou global sur boutons de démarrage potentiels
  document.addEventListener("click", (e) => {
    const el = (e.target instanceof Element)
      ? e.target.closest("#start-annotation, #btn-start-annotation, [data-role='start-annotation'], [data-action='start-annotation']")
      : null;
    if (!el) return;
    if (getLS(LS_KEYS.PASSED) !== "true") {
      e.preventDefault(); e.stopPropagation();
      showQuizGate(true);
    } else {
      showAnnotation();
    }
  });

  await loadCodebook();
  // Ne pas forcer le quiz au chargement. Laisser l'accueil s’afficher.
  if (document.querySelector("#welcome-screen")) {
    showWelcome();
  }
}

  window.quizGate = { 
    init,
    resetQuiz: () => {
      clearQuizState();
      showQuizGate(true);
    }
  };

  // --- Shim public pour vérification/guards extérieurs (sans ESM) ---
  window.shouldBypassQuiz = function(){
    try {
      return localStorage.getItem("quiz_version_v1") === "v3.4-dom3" &&
             localStorage.getItem("quiz_passed_v1")  === "true";
    } catch(e){ return false; }
  };

  document.addEventListener("DOMContentLoaded", init);
})();

