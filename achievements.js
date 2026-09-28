/* ═══════════════════════════════════════════════════════════════
   Shared "hidden achievements" system — used by index.html (Konami
   code) and linux.html (terminal easter eggs). Purely cosmetic,
   stored per-browser in localStorage under "portfolio_achievements".
   ═══════════════════════════════════════════════════════════════ */
"use strict";

const ACHIEVEMENTS = [
  { id: "terminal", name: "Premier contact",       desc: "Ouvrir un terminal pour la première fois",    icon: "🖥️" },
  { id: "sl",       name: "Tout schuss",            desc: "Taper sl au lieu de ls",                      icon: "🚂" },
  { id: "sudo",     name: "Sudo happy",             desc: "Essayer de détruire PortfolioOS avec sudo",   icon: "💣" },
  { id: "cowsay",   name: "Vache curieuse",         desc: "Faire parler une vache dans le terminal",     icon: "🐄" },
  { id: "matrix",   name: "Dans la Matrice",        desc: "Activer l'écran Matrix",                      icon: "🟢" },
  { id: "fortune",  name: "Chasseur de citations",  desc: "Demander une fortune au terminal",            icon: "🥠" },
  { id: "curl",     name: "API whisperer",          desc: "Curler l'endpoint /hire-me",                  icon: "📡" },
  { id: "konami",   name: "Konami Master",          desc: "Entrer le Konami Code sur le site classique", icon: "🎮" },
];

function _achStore() {
  try { return JSON.parse(localStorage.getItem("portfolio_achievements") || "[]"); }
  catch (e) { return []; }
}

function unlockAchievement(id) {
  const unlocked = _achStore();
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  localStorage.setItem("portfolio_achievements", JSON.stringify(unlocked));
  const meta = ACHIEVEMENTS.find(a => a.id === id);
  if (meta && typeof window.onAchievementUnlocked === "function") {
    window.onAchievementUnlocked(meta, unlocked.length);
  }
  return true;
}

function getAchievementProgress() {
  const unlocked = _achStore();
  return { unlocked: unlocked.length, total: ACHIEVEMENTS.length, ids: unlocked };
}

function renderAchievementsHTML() {
  const unlocked = _achStore();
  return ACHIEVEMENTS.map(a => {
    const done = unlocked.includes(a.id);
    return `<div class="achievement-row ${done ? "unlocked" : "locked"}">
      <span class="ach-icon">${done ? a.icon : "🔒"}</span>
      <div class="ach-text">
        <div class="ach-name">${done ? a.name : "???"}</div>
        <div class="ach-desc">${done ? a.desc : "Succès secret non découvert"}</div>
      </div>
    </div>`;
  }).join("");
}
