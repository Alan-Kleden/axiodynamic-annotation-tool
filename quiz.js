// quiz.js  — i18n minimal
(async function () {
  const getLang = () => (window.i18n?.current || document.documentElement.lang || 'EN').toUpperCase();

  const STR = {
    EN: {
      Fc: "Fc",
      Fi: "Fi",
      Hint: "Hint",
      Reminder: "Reminder:",
      RemText: "Fi = obstacles that truly prevent the telos (mere problem description can increase Fc).",
      Score: (pct, c, n) => `Score: ${pct}% (${c}/${n})`,
      Passed: "Well done! Quiz passed. You can annotate now.",
      Locked: "You reached 3 failures. Try again later.",
      Failed: "Quiz not passed. Review and try again."
    },
    FR: {
      Fc: "Fc",
      Fi: "Fi",
      Hint: "Conseil",
      Reminder: "Rappel :",
      RemText: "Fi = obstacles qui empêchent réellement le telos (la simple description d’un problème peut renforcer Fc).",
      Score: (pct, c, n) => `Score : ${pct}% (${c}/${n})`,
      Passed: "Bravo ! Quiz réussi. Vous pouvez annoter.",
      Locked: "Vous avez atteint 3 échecs. Réessayez plus tard.",
      Failed: "Quiz non validé. Révisez et réessayez."
    },
    ES: {
      Fc: "Fc",
      Fi: "Fi",
      Hint: "Sugerencia",
      Reminder: "Recordatorio:",
      RemText: "Fi = obstáculos que realmente impiden el telos (describir un problema puede aumentar Fc).",
      Score: (pct, c, n) => `Puntuación: ${pct}% (${c}/${n})`,
      Passed: "¡Bien! Prueba superada. Ya puede anotar.",
      Locked: "Ha alcanzado 3 fallos. Inténtelo más tarde.",
      Failed: "Prueba no superada. Revise e inténtelo de nuevo."
    },
    ZH: {
      Fc: "Fc",
      Fi: "Fi",
      Hint: "提示",
      Reminder: "提醒：",
      RemText: "Fi = 真实阻碍目标的因素（仅描述问题可能提升 Fc）。",
      Score: (pct, c, n) => `得分：${pct}% (${c}/${n})`,
      Passed: "通过测验。可继续标注。",
      Locked: "已失败 3 次，请稍后再试。",
      Failed: "未通过。请复习后重试。"
    }
  };

  function t(lang, key){ return (STR[lang] && STR[lang][key]) || STR.EN[key]; }

  async function loadCodebook() {
    const res = await fetch('./data/codebook_v1.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Cannot load data/codebook_v1.json');
    return res.json();
  }

  function pickSix(items) {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 6);
  }

  function renderQuestion(container, q, idx, lang) {
    const row = document.createElement('div');
    row.className = 'card';
    row.innerHTML = `
      <div class="q-stem">${idx+1}. ${q.stem}</div>
      <div class="choices">
        <label>${t(lang,'Fc')} :
          <select data-role="fc">
            ${[0,1,2,3,4,5].map(n=>`<option value="${n}">${n}</option>`).join('')}
          </select>
        </label>
        <label>${t(lang,'Fi')} :
          <select data-role="fi">
            ${[0,1,2,3,4,5].map(n=>`<option value="${n}">${n}</option>`).join('')}
          </select>
        </label>
        <details class="hint"><summary>${t(lang,'Hint')}</summary>
          <div>
            <strong>${t(lang,'Reminder')}</strong> ${t(lang,'RemText')}
          </div>
        </details>
      </div>
    `;
    container.appendChild(row);
    return row;
  }

  function grade(one, fc, fi) {
    const fcOk = Math.abs(fc - one.Fc_target) <= 1;
    const fiOk = Math.abs(fi - one.Fi_target) <= 1;
    return { pass: (fcOk && fiOk), fcOk, fiOk };
  }

  try {
    const lang = getLang();                // EN par défaut
    const codebook = await loadCodebook();
    const pool = codebook.filter(x => (x.lang || 'EN').toUpperCase() === lang);
    if (pool.length < 6) throw new Error('Insufficient codebook entries for this language (>=6)');

    const quizItems = pickSix(pool);
    const host = document.getElementById('quiz');
    const nodes = quizItems.map((q,i)=>renderQuestion(host,q,i,lang));

    const progress = document.getElementById('progress');
    const btn = document.getElementById('btnSubmit');
    const scoreBadge = document.getElementById('score');

    host.addEventListener('change', () => {
      const filled = nodes.filter(n => n.querySelector('select[data-role="fc"]') && n.querySelector('select[data-role="fi"]')).length;
      progress.style.width = Math.round((filled / nodes.length) * 100) + '%';
      btn.disabled = false;
    });

    btn.addEventListener('click', () => {
      let correct = 0;
      nodes.forEach((n, idx) => {
        const q = quizItems[idx];
        const fc = parseInt(n.querySelector('select[data-role="fc"]').value, 10);
        const fi = parseInt(n.querySelector('select[data-role="fi"]').value, 10);
        const g = grade(q, fc, fi);
        if (g.pass) correct += 1;
      });

      const result = window.QuizGate.submitQuizResult(correct, nodes.length);
      const pct = Math.round(result.score*100);
      scoreBadge.textContent = t(lang,'Score')(pct, correct, nodes.length);

      if (result.passed) {
        alert(t(lang,'Passed'));
        window.location.href = "./index.html";
      } else {
        if (window.QuizGate.isLocked()) {
          alert(t(lang,'Locked'));
        } else {
          alert(t(lang,'Failed'));
        }
      }
    });

  } catch (e) {
    console.error(e);
    alert("Quiz load error. Check data/codebook_v1.json.");
  }
})();
