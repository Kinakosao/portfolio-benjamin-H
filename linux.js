/* ═══════════════════════════════════════════════════════════════
   PortfolioOS — linux.js
   Terminal emulator + window manager for Benjamin Hanquart's portfolio
   ═══════════════════════════════════════════════════════════════ */

"use strict";

/* ── State ──────────────────────────────────────────────────── */
const state = {
  windows: {}, // id → { el, minimized, maximized, icon, title }
  zCounter: 200,
  focused: null,
  cmdHistory: [],
  historyIdx: -1,
  wallpapers: [
    "radial-gradient(ellipse at 15% 60%, rgba(88,166,255,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(87,171,90,0.07) 0%, transparent 55%), linear-gradient(160deg, #0d1117 0%, #12171f 50%, #0d1117 100%)",
    "radial-gradient(ellipse at 50% 50%, rgba(188,140,255,0.1) 0%, transparent 60%), linear-gradient(135deg, #0a0015 0%, #120020 100%)",
    "radial-gradient(ellipse at 80% 80%, rgba(248,81,73,0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 20%, rgba(227,179,65,0.07) 0%, transparent 50%), linear-gradient(135deg, #1a0a00 0%, #0d1117 100%)",
    "linear-gradient(135deg, #001a0a 0%, #001a14 50%, #0d1117 100%)",
  ],
  wallpaperIdx: 0,
};

/* ── Boot Sequence ──────────────────────────────────────────── */
const BOOT_LINES = [
  ['<span class="info">[  OK  ]</span> Kernel 6.12.74-portfolio chargé', 80],
  ['<span class="info">[  OK  ]</span> Initialisation de la mémoire...', 100],
  ['<span class="info">[  OK  ]</span> Montage de /home/benjamin', 80],
  ['<span class="info">[  OK  ]</span> Démarrage de NetworkManager', 100],
  [
    '<span class="info">[  OK  ]</span> Chargement des données du portfolio...',
    120,
  ],
  [
    '<span class="warn">[WARN ]</span> Trop de passion détectée dans /dev/brain',
    80,
  ],
  [
    '<span class="info">[  OK  ]</span> Démarrage de l\'environnement de bureau...',
    100,
  ],
  ['<span class="ok">[  OK  ]</span> PortfolioOS 24.04 LTS prêt.', 60],
];

function runBoot() {
  const container = document.getElementById("boot-lines");
  const barWrap = document.getElementById("boot-bar-wrap");
  const bar = document.getElementById("boot-bar");
  let delay = 300;

  BOOT_LINES.forEach(([text, gap], i) => {
    setTimeout(() => {
      const line = document.createElement("p");
      line.className = "boot-line";
      line.style.cssText =
        "color:#ccc;line-height:2;font-family:var(--font-mono);font-size:13px;";
      line.innerHTML = text;
      container.appendChild(line);
      requestAnimationFrame(() => line.classList.add("show"));
    }, delay);
    delay += gap;
  });

  setTimeout(() => {
    barWrap.classList.add("show");
    requestAnimationFrame(() => setTimeout(() => bar.classList.add("go"), 50));
  }, delay);

  setTimeout(() => {
    document.getElementById("boot-screen").classList.add("fade-out");
    setTimeout(() => {
      document.getElementById("boot-screen").style.display = "none";
      document.getElementById("desktop").classList.add("show");
      openTerminal();
    }, 700);
  }, delay + 2200);
}

/* ── Clock ──────────────────────────────────────────────────── */
function updateClock() {
  const el = document.getElementById("topbar-clock");
  if (!el) return;
  const now = new Date();
  const days = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  const months = [
    "jan",
    "fév",
    "mar",
    "avr",
    "mai",
    "juin",
    "juil",
    "août",
    "sep",
    "oct",
    "nov",
    "déc",
  ];
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  el.textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${hh}:${mm}`;
}

/* ── Window Manager ─────────────────────────────────────────── */
let winSeq = 0;

function createWindow({ id, title, icon, content, width, height, x, y }) {
  id = id || `win-${++winSeq}`;
  if (state.windows[id]) {
    bringToFront(id);
    return id;
  }

  const container = document.getElementById("windows-container");
  const desktopArea = document.getElementById("desktop-area");
  const dw = desktopArea.offsetWidth;
  const dh = desktopArea.offsetHeight;

  const wx =
    x !== undefined ? x : Math.max(40, (dw - width) / 2 + (winSeq % 5) * 25);
  const wy =
    y !== undefined ? y : Math.max(10, (dh - height) / 2 + (winSeq % 5) * 20);

  const win = document.createElement("div");
  win.className = "window focused";
  win.id = `window-${id}`;
  win.style.cssText = `left:${wx}px;top:${wy}px;width:${width}px;height:${height}px;z-index:${++state.zCounter}`;

  win.innerHTML = `
    <div class="win-titlebar" id="titlebar-${id}">
      <div class="win-controls">
        <button class="win-btn win-close"  title="Fermer">✕</button>
        <button class="win-btn win-min"    title="Réduire">−</button>
        <button class="win-btn win-max"    title="Agrandir">⤢</button>
      </div>
      <span class="win-icon">${icon}</span>
      <span class="win-title">${title}</span>
    </div>
    <div class="win-content">${content}</div>`;

  container.appendChild(win);

  win
    .querySelector(".win-close")
    .addEventListener("click", () => closeWindow(id));
  win
    .querySelector(".win-min")
    .addEventListener("click", () => minimizeWindow(id));
  win
    .querySelector(".win-max")
    .addEventListener("click", () => toggleMaximize(id));
  win.addEventListener("mousedown", () => bringToFront(id));

  makeDraggable(win, id);

  state.windows[id] = {
    el: win,
    minimized: false,
    maximized: false,
    icon,
    title,
  };
  addToTaskbar(id, title, icon);

  // Hide hint when first window opens
  document.getElementById("desktop-hint").classList.add("hidden");

  return id;
}

function closeWindow(id) {
  const w = state.windows[id];
  if (!w) return;
  w.el.remove();
  delete state.windows[id];
  removeFromTaskbar(id);
  if (state.focused === id) state.focused = null;
}

function minimizeWindow(id) {
  const w = state.windows[id];
  if (!w) return;
  w.minimized = !w.minimized;
  w.el.classList.toggle("minimized", w.minimized);
  const btn = document.querySelector(`#tb-btn-${id}`);
  if (btn) btn.classList.toggle("minimized-btn", w.minimized);
}

function toggleMaximize(id) {
  const w = state.windows[id];
  if (!w) return;
  w.maximized = !w.maximized;
  w.el.classList.toggle("maximized", w.maximized);
}

function bringToFront(id) {
  const w = state.windows[id];
  if (!w) return;
  if (state.focused && state.focused !== id) {
    state.windows[state.focused]?.el.classList.remove("focused");
    document
      .querySelector(`#tb-btn-${state.focused}`)
      ?.classList.remove("active");
  }
  w.el.style.zIndex = ++state.zCounter;
  w.el.classList.add("focused");
  state.focused = id;
  const btn = document.querySelector(`#tb-btn-${id}`);
  if (btn) {
    document
      .querySelectorAll(".tb-win-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  }
}

function makeDraggable(winEl, id) {
  const titlebar = document.getElementById(`titlebar-${id}`);
  let dragging = false,
    ox = 0,
    oy = 0;

  titlebar.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("win-btn")) return;
    const w = state.windows[id];
    if (w?.maximized) return;
    dragging = true;
    ox = e.clientX - winEl.offsetLeft;
    oy = e.clientY - winEl.offsetTop;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const area = document
      .getElementById("desktop-area")
      .getBoundingClientRect();
    let nx = e.clientX - ox;
    let ny = e.clientY - oy;
    nx = Math.max(0, Math.min(nx, area.width - winEl.offsetWidth));
    ny = Math.max(0, Math.min(ny, area.height - 40));
    winEl.style.left = nx + "px";
    winEl.style.top = ny + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
}

/* ── Taskbar ────────────────────────────────────────────────── */
function addToTaskbar(id, title, icon) {
  const bar = document.getElementById("taskbar-windows");
  const btn = document.createElement("div");
  btn.className = "tb-win-btn active";
  btn.id = `tb-btn-${id}`;
  btn.innerHTML = `<span class="tb-win-icon">${icon}</span><span class="tb-win-title">${title}</span>`;
  btn.addEventListener("click", () => {
    const w = state.windows[id];
    if (!w) return;
    if (state.focused === id && !w.minimized) {
      minimizeWindow(id);
    } else {
      if (w.minimized) minimizeWindow(id);
      bringToFront(id);
    }
  });
  document
    .querySelectorAll(".tb-win-btn")
    .forEach((b) => b.classList.remove("active"));
  bar.appendChild(btn);
}

function removeFromTaskbar(id) {
  document.getElementById(`tb-btn-${id}`)?.remove();
}

/* ── Terminal ───────────────────────────────────────────────── */
function openTerminal() {
  const id = `terminal-${Date.now()}`;
  const termContent = `
    <div class="terminal-content">
      <div id="term-output-${id}"></div>
      <div id="term-input-row-${id}" class="term-input-row" style="display:flex;align-items:center;margin-top:4px;">
        <span id="term-prompt-display-${id}" class="term-prompt-display" style="color:var(--term-prompt);font-family:var(--font-mono);font-size:13px;flex-shrink:0;white-space:nowrap;"></span>
        <input id="term-input-${id}" class="term-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
               style="flex:1;background:transparent;border:none;outline:none;color:var(--term-cmd);font-family:var(--font-mono);font-size:13px;caret-color:var(--term-prompt);padding-left:4px;">
      </div>
    </div>`;

  createWindow({
    id,
    title: "Terminal — benjamin@portfolio",
    icon: "🖥️",
    content: termContent,
    width: 720,
    height: 460,
  });

  const output = document.getElementById(`term-output-${id}`);
  const input = document.getElementById(`term-input-${id}`);
  const prompt = document.getElementById(`term-prompt-display-${id}`);

  output.style.cssText =
    "flex:1;overflow-y:auto;overflow-x:hidden;font-family:var(--font-mono);font-size:13px;line-height:1.55;padding-bottom:4px;scrollbar-width:thin;scrollbar-color:#333 transparent;";
  prompt.textContent = getPrompt();

  // Welcome message
  appendLine(
    id,
    "┌─────────────────────────────────────────────────────────┐",
    "term-dim",
  );
  appendLine(
    id,
    "│  Bienvenue dans PortfolioOS 24.04 LTS                   │",
    "term-dim",
  );
  appendLine(
    id,
    '│  Tapez <span style="color:var(--term-prompt)">help</span> pour afficher les commandes disponibles.       │',
    "term-dim",
  );
  appendLine(
    id,
    '│  Tapez <span style="color:var(--term-prompt)">open &lt;section&gt;</span> pour naviguer dans le portfolio.   │',
    "term-dim",
  );
  appendLine(
    id,
    "└─────────────────────────────────────────────────────────┘",
    "term-dim",
  );
  appendLine(id, "", "");

  // Input handling
  const history = [];
  let histIdx = -1;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const cmd = input.value.trim();
      appendPromptLine(id, cmd);
      if (cmd) {
        history.unshift(cmd);
        histIdx = -1;
      }
      input.value = "";
      if (cmd) processCommand(id, cmd);
      else appendLine(id, "", "");
      scrollToBottom(id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx];
      } else {
        histIdx = -1;
        input.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const val = input.value.trim();
      const completions = [
        "help",
        "ls",
        "open",
        "neofetch",
        "whoami",
        "pwd",
        "clear",
        "history",
        "echo",
        "date",
        "uname",
        "sudo",
        "man",
        "exit",
        "cat",
        "git",
        "ping",
      ];
      const match = completions.find((c) => c.startsWith(val) && c !== val);
      if (match) input.value = match;
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      document.getElementById(`term-output-${id}`).innerHTML = "";
    }
  });

  // Focus input on click in terminal
  document
    .getElementById(`window-${id}`)
    ?.addEventListener("click", () => input.focus());
  input.focus();
  scrollToBottom(id);
}

function getPrompt() {
  return "benjamin@portfolio:~$ ";
}

function appendLine(termId, html, cls) {
  const out = document.getElementById(`term-output-${termId}`);
  if (!out) return;
  const line = document.createElement("div");
  line.style.cssText =
    "line-height:1.55;white-space:pre-wrap;word-break:break-all;";
  if (cls) line.style.color = varFromCls(cls);
  line.innerHTML = html;
  out.appendChild(line);
  scrollToBottom(termId);
}

function appendPromptLine(termId, cmd) {
  const out = document.getElementById(`term-output-${termId}`);
  if (!out) return;
  const line = document.createElement("div");
  line.style.cssText = "display:flex;line-height:1.55;";
  line.innerHTML = `<span style="color:var(--term-prompt);flex-shrink:0;font-family:var(--font-mono);font-size:13px;">${getPrompt()}</span><span style="color:var(--term-cmd);font-family:var(--font-mono);font-size:13px;">${escHtml(cmd)}</span>`;
  out.appendChild(line);
}

function varFromCls(cls) {
  const map = {
    "term-error": "var(--red)",
    "term-success": "var(--green)",
    "term-info-line": "var(--blue)",
    "term-dim": "var(--text-dim)",
    "term-yellow": "var(--yellow)",
    "term-cyan": "var(--cyan)",
    "term-purple": "var(--purple)",
    "": "var(--term-text)",
  };
  return map[cls] || "var(--term-text)";
}

function scrollToBottom(termId) {
  const out = document.getElementById(`term-output-${termId}`);
  if (out)
    requestAnimationFrame(() => {
      out.scrollTop = out.scrollHeight;
    });
}

function escHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── Command Processor ──────────────────────────────────────── */
function processCommand(termId, raw) {
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Async commands return true to skip the trailing blank line (they add it themselves at the end)
  const cmds = {
    help:     () => cmdHelp(termId),
    ls:       () => cmdLs(termId, args),
    open:     () => cmdOpen(termId, args),
    cat:      () => cmdCat(termId, args),
    neofetch: () => cmdNeofetch(termId),
    whoami:   () => cmdWhoami(termId),
    pwd:      () => cmdPwd(termId),
    clear:    () => cmdClear(termId),
    history:  () => cmdHistory(termId),
    echo:     () => cmdEcho(termId, args),
    date:     () => cmdDate(termId),
    uname:    () => cmdUname(termId, args),
    sudo:     () => { cmdSudo(termId, args); return true; },
    man:      () => cmdMan(termId, args),
    exit:     () => { cmdExit(termId); return true; },
    git:      () => cmdGit(termId, args),
    ping:     () => { cmdPing(termId, args); return true; },
    vim:      () => { cmdVim(termId); return true; },
    nano: () => {
      appendLine(termId, "Ouverture de nano... (appuyez sur ^X pour quitter)", "term-dim");
      setTimeout(() => {
        appendLine(termId, '<span style="color:var(--red)">Bash: nano: commande simulée uniquement</span>', "");
        appendLine(termId, "", "");
      }, 400);
      return true;
    },
    ssh: () => {
      appendLine(termId, "ssh: connect to host benjaminhanquart.dev port 22: Vous êtes déjà sur ce serveur !", "term-error");
    },
    npm: () => cmdNpm(termId, args),
    "./contact.sh": () => { cmdOpen(termId, ["contact"]); },
  };

  if (cmds[cmd]) {
    const isAsync = cmds[cmd]();
    if (!isAsync) appendLine(termId, "", "");
  } else if (cmd === "") {
    appendLine(termId, "", "");
  } else {
    appendLine(termId, `bash: ${escHtml(cmd)}: commande introuvable`, "term-error");
    appendLine(termId, `Tapez <span style="color:var(--term-prompt)">help</span> pour afficher les commandes.`, "term-dim");
    appendLine(termId, "", "");
  }
}

function cmdHelp(id) {
  appendLine(
    id,
    '<span style="color:var(--green);font-weight:700">Commandes disponibles :</span>',
    "",
  );
  appendLine(id, "", "");
  const commands = [
    ["open <section>", "Ouvre une fenêtre  (about, projects, cv, contact)"],
    ["ls [-la]", "Liste les sections disponibles"],
    ["cat <fichier>", "Affiche le contenu d'un fichier"],
    ["neofetch", "Informations système"],
    ["whoami", "Affiche l'utilisateur courant"],
    ["pwd", "Affiche le répertoire courant"],
    ["git log", "Historique du portfolio"],
    ["ping <host>", "Envoie un ping (simulé)"],
    ["echo <texte>", "Affiche un texte"],
    ["date", "Date et heure actuelles"],
    ["uname -a", "Informations système"],
    ["sudo <cmd>", "Exécuter en root (surprenant)"],
    ["clear", "Vider le terminal  (ou Ctrl+L)"],
    ["man <commande>", "Manuel d'une commande"],
    ["exit", "Fermer le terminal"],
  ];
  commands.forEach(([cmd, desc]) => {
    appendLine(
      id,
      `  <span style="color:var(--term-cmd)">${cmd.padEnd(22)}</span><span style="color:var(--text-dim)">${escHtml(desc)}</span>`,
      "",
    );
  });
}

function cmdLs(id, args) {
  const long =
    args.includes("-la") || args.includes("-l") || args.includes("-a");
  if (long) {
    appendLine(id, '<span style="color:var(--text-dim)">total 5</span>', "");
    appendLine(
      id,
      'drwxr-xr-x  2 benjamin portfolio 4096 mai 28 00:00 <span style="color:var(--blue)">./</span>',
      "",
    );
    appendLine(
      id,
      'drwxr-xr-x 18 benjamin portfolio 4096 mai 28 00:00 <span style="color:var(--blue)">../</span>',
      "",
    );
    appendLine(
      id,
      '-rw-r--r--  1 benjamin portfolio  512 mai 28 00:00 <span style="color:var(--green)">about.txt</span>',
      "",
    );
    appendLine(
      id,
      'drwxr-xr-x  3 benjamin portfolio 4096 mai 28 00:00 <span style="color:var(--blue)">projects/</span>',
      "",
    );
    appendLine(
      id,
      '-rw-r--r--  1 benjamin portfolio 8192 mai 28 00:00 <span style="color:var(--red)">CV.pdf</span>',
      "",
    );
    appendLine(
      id,
      '-rwxr-xr-x  1 benjamin portfolio  256 mai 28 00:00 <span style="color:var(--yellow)">contact.sh</span>',
      "",
    );
    appendLine(
      id,
      '-rw-r--r--  1 benjamin portfolio   64 mai 28 00:00 <span style="color:var(--green)">README.md</span>',
      "",
    );
  } else {
    appendLine(
      id,
      '<span style="color:var(--green)">about.txt</span>   <span style="color:var(--blue)">projects/</span>   <span style="color:var(--red)">CV.pdf</span>   <span style="color:var(--yellow)">contact.sh</span>   <span style="color:var(--green)">README.md</span>',
      "",
    );
  }
}

function cmdOpen(id, args) {
  const target = (args[0] || "").toLowerCase();
  const actions = {
    about: () => {
      appendLine(id, "Ouverture de about.txt...", "term-info-line");
      openAboutWindow();
    },
    projects: () => {
      appendLine(id, "Ouverture de projects/...", "term-info-line");
      openProjectsWindow();
    },
    cv: () => {
      appendLine(id, "Ouverture de CV.pdf...", "term-info-line");
      openCVWindow();
    },
    "cv.pdf": () => {
      appendLine(id, "Ouverture de CV.pdf...", "term-info-line");
      openCVWindow();
    },
    contact: () => {
      appendLine(id, "Ouverture de contact.sh...", "term-info-line");
      openContactWindow();
    },
    "contact.sh": () => {
      appendLine(id, "Exécution de contact.sh...", "term-info-line");
      openContactWindow();
    },
    github: () => {
      appendLine(id, "Ouverture de GitHub...", "term-info-line");
      window.open("https://github.com/Kinakosao", "_blank");
    },
    linkedin: () => {
      appendLine(id, "Ouverture de LinkedIn...", "term-info-line");
      window.open(
        "https://www.linkedin.com/in/benjamin-hanquart-692b10288/",
        "_blank",
      );
    },
  };
  if (actions[target]) {
    actions[target]();
  } else if (!target) {
    appendLine(id, "Usage: open <section>", "term-error");
    appendLine(
      id,
      "Sections: about, projects, cv, contact, github, linkedin",
      "term-dim",
    );
  } else {
    appendLine(
      id,
      `open: ${escHtml(target)}: aucun fichier ou dossier de ce type`,
      "term-error",
    );
    appendLine(
      id,
      'Sections disponibles: <span style="color:var(--term-prompt)">about  projects  cv  contact  github  linkedin</span>',
      "",
    );
  }
}

function cmdCat(id, args) {
  const file = (args[0] || "").toLowerCase();
  if (file === "about.txt" || file === "about") {
    appendLine(
      id,
      '<span style="color:var(--green);font-weight:700">═══ about.txt ═══</span>',
      "",
    );
    appendLine(id, "Nom         : Benjamin Hanquart", "");
    appendLine(id, "Formation   : BUT Informatique — IUT de Lille", "");
    appendLine(id, "Localisation: Lille, France", "");
    appendLine(id, "", "");
    appendLine(
      id,
      "Passionné par l'informatique et la création de logiciels",
      "",
    );
    appendLine(
      id,
      "permettant l'automatisation de tâches. Actuellement en",
      "",
    );
    appendLine(id, "2ème année de BUT Informatique.", "");
    appendLine(id, "", "");
    appendLine(
      id,
      '<span style="color:var(--text-dim)">Langages: Java  C  HTML  CSS  JavaScript  SQL</span>',
      "",
    );
  } else if (file === "readme.md" || file === "readme") {
    appendLine(
      id,
      '<span style="color:var(--green);font-weight:700"># PortfolioOS</span>',
      "",
    );
    appendLine(id, "", "");
    appendLine(id, "Portfolio interactif de Benjamin Hanquart.", "");
    appendLine(id, "Inspiré d'un environnement Linux/terminal.", "");
    appendLine(id, "", "");
    appendLine(id, "Tapez `help` pour les commandes.", "term-dim");
  } else if (file === "/etc/passwd") {
    appendLine(id, "root:x:0:0:root:/root:/bin/bash", "term-dim");
    appendLine(
      id,
      "benjamin:x:1000:1000:Benjamin Hanquart:/home/benjamin:/bin/bash",
      "term-dim",
    );
    appendLine(
      id,
      "recruteur:x:1001:1001:Futur recruteur:/home/recruteur:/bin/bash",
      "term-dim",
    );
  } else if (!file) {
    appendLine(id, "Usage: cat <fichier>", "term-error");
  } else {
    appendLine(
      id,
      `cat: ${escHtml(file)}: aucun fichier ou dossier de ce type`,
      "term-error",
    );
  }
}

function cmdNeofetch(id) {
  const out = document.getElementById(`term-output-${id}`);
  if (!out) return;

  const artText = [
    "         .-.-.         ",
    "       ( . . )         ",
    "        | : : |        ",
    "       //     \\\\       ",
    "      (|       |)      ",
    "     /'\\_ _ _/'\\     ",
    "     \\___) (___/      ",
    "                       ",
  ].join("\n");

  const infoLines = [
    `<span style="color:var(--green);font-weight:700">benjamin</span><span style="color:var(--text-dim)">@</span><span style="color:var(--green);font-weight:700">portfolio</span>`,
    `<span style="color:var(--text-dim)">${"─".repeat(30)}</span>`,
    `<span style="color:var(--blue);font-weight:700">OS:</span>          PortfolioOS 24.04 LTS x86_64`,
    `<span style="color:var(--blue);font-weight:700">Host:</span>        benjaminhanquart.dev`,
    `<span style="color:var(--blue);font-weight:700">Kernel:</span>      6.12.74-portfolio`,
    `<span style="color:var(--blue);font-weight:700">Uptime:</span>      ~2 ans de code`,
    `<span style="color:var(--blue);font-weight:700">Shell:</span>       JavaScript ES2023`,
    `<span style="color:var(--blue);font-weight:700">Resolution:</span>  ${window.screen.width}x${window.screen.height}`,
    `<span style="color:var(--blue);font-weight:700">Theme:</span>       PortfolioOS Dark`,
    `<span style="color:var(--blue);font-weight:700">Languages:</span>   Java · C · HTML · CSS · JS · SQL`,
    `<span style="color:var(--blue);font-weight:700">CPU:</span>         Brain™ @ 3.4GHz`,
    `<span style="color:var(--blue);font-weight:700">Memory:</span>      ∞ MiB / ∞ MiB`,
    ``,
    `<span style="background:var(--red)">&nbsp;&nbsp;&nbsp;</span><span style="background:var(--yellow)">&nbsp;&nbsp;&nbsp;</span><span style="background:var(--green)">&nbsp;&nbsp;&nbsp;</span><span style="background:var(--cyan)">&nbsp;&nbsp;&nbsp;</span><span style="background:var(--blue)">&nbsp;&nbsp;&nbsp;</span><span style="background:var(--purple)">&nbsp;&nbsp;&nbsp;</span>`,
  ];

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "display:flex;gap:24px;font-family:var(--font-mono);font-size:12px;line-height:1.75;margin:2px 0;";

  const pre = document.createElement("pre");
  pre.style.cssText = "color:var(--blue);margin:0;flex-shrink:0;";
  pre.textContent = artText;

  const infoDiv = document.createElement("div");
  infoDiv.innerHTML = infoLines.map(l => `<div>${l}</div>`).join("");

  wrapper.appendChild(pre);
  wrapper.appendChild(infoDiv);
  out.appendChild(wrapper);
  scrollToBottom(id);
}

function cmdWhoami(id) {
  appendLine(id, "benjamin", "term-success");
}

function cmdPwd(id) {
  appendLine(id, "/home/benjamin/portfolio", "");
}

function cmdClear(id) {
  const out = document.getElementById(`term-output-${id}`);
  if (out) out.innerHTML = "";
}

function cmdHistory(id) {
  appendLine(
    id,
    '<span style="color:var(--text-dim)">Historique des commandes :</span>',
    "",
  );
  appendLine(id, "(L'historique s'efface à chaque session)", "term-dim");
}

function cmdEcho(id, args) {
  appendLine(id, escHtml(args.join(" ")), "");
}

function cmdDate(id) {
  appendLine(
    id,
    new Date().toLocaleString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    "",
  );
}

function cmdUname(id, args) {
  if (args.includes("-a") || args.includes("-r")) {
    appendLine(
      id,
      "PortfolioOS 6.12.74-portfolio x86_64 GNU/Linux JavaScript-5.0",
      "",
    );
  } else {
    appendLine(id, "PortfolioOS", "");
  }
}

function cmdSudo(id, args) {
  const subcmd = args[0] || "";
  if (
    subcmd === "rm" &&
    args.includes("-rf") &&
    (args.includes("/") || args.includes("/*"))
  ) {
    appendLine(
      id,
      "sudo: Permission refusée (et je t'ai à l'œil 👀)",
      "term-error",
    );
  } else if (!subcmd) {
    appendLine(id, "Usage: sudo <commande>", "term-error");
  } else {
    appendLine(id, `[sudo] Mot de passe pour benjamin: `, "term-dim");
    setTimeout(() => {
      appendLine(id, "benjamin n'est pas dans le fichier sudoers.", "term-error");
      appendLine(id, "Cet incident sera signalé.", "term-dim");
      appendLine(id, "", "");
    }, 800);
  }
}

function cmdMan(id, args) {
  const cmd = args[0] || "";
  const manPages = {
    open: "open <section> — ouvre une fenêtre du portfolio. Sections: about, projects, cv, contact, github, linkedin",
    ls: "ls [-la] — liste les fichiers du portfolio. Option -la pour affichage détaillé.",
    neofetch:
      "neofetch — affiche des informations système dans un style ASCII art.",
    help: "help — affiche la liste des commandes disponibles.",
    sudo: "sudo <cmd> — tente d'exécuter une commande en root. Résultats imprévisibles.",
  };
  if (manPages[cmd]) {
    appendLine(
      id,
      `<span style="color:var(--term-cmd);font-weight:700">MAN(1) — ${cmd.toUpperCase()}</span>`,
      "",
    );
    appendLine(id, manPages[cmd], "");
  } else if (!cmd) {
    appendLine(id, "Quel manuel voulez-vous ? Essayez: man open", "term-dim");
  } else {
    appendLine(id, `Pas de page de manuel pour ${escHtml(cmd)}.`, "term-error");
  }
}

function cmdExit(id) {
  appendLine(id, "Fermeture du terminal...", "term-dim");
  setTimeout(() => closeWindow(id), 400);
}

function cmdGit(id, args) {
  const sub = args[0] || "";
  if (sub === "log") {
    const commits = [
      ["58c39a9", "Correction Bug et ajout d'informations", "2 jours"],
      ["6dda27a", "Mise à jour du CV", "3 jours"],
      ["0f6f66c", "Ajout du système d'envoi de mail", "1 semaine"],
      ["3eafb7c", "Ajout des fichiers de base", "2 semaines"],
      ["90e28d2", "Initial commit — portfolio v1", "1 mois"],
    ];
    commits.forEach(([hash, msg, when]) => {
      appendLine(
        id,
        `<span style="color:var(--yellow)">commit ${hash}</span>`,
        "",
      );
      appendLine(id, `Date:   il y a ${when}`, "term-dim");
      appendLine(id, `    ${escHtml(msg)}`, "");
      appendLine(id, "", "");
    });
  } else if (sub === "status") {
    appendLine(id, "Sur la branche main", "");
    appendLine(id, "Votre branche est à jour avec 'origin/main'.", "");
    appendLine(id, "", "");
    appendLine(
      id,
      "rien à valider, la copie de travail est propre",
      "term-success",
    );
  } else if (sub === "branch") {
    appendLine(id, '* <span style="color:var(--green)">main</span>', "");
  } else {
    appendLine(
      id,
      `git: '${escHtml(sub)}' n'est pas une commande git. Essayez: git log`,
      "term-error",
    );
  }
}

function cmdPing(id, args) {
  const host = args[0] || "benjaminhanquart.dev";
  appendLine(
    id,
    `PING ${escHtml(host)} (127.0.0.1) 56(84) octets de données.`,
    "",
  );
  let count = 0;
  const interval = setInterval(() => {
    const ms = (Math.random() * 8 + 1).toFixed(3);
    appendLine(
      id,
      `64 octets de ${escHtml(host)}: icmp_seq=${++count} ttl=64 temps=${ms} ms`,
      "",
    );
    scrollToBottom(id);
    if (count >= 4) {
      clearInterval(interval);
      appendLine(id, "", "");
      appendLine(id, `--- ${escHtml(host)} statistiques ping ---`, "term-dim");
      appendLine(id, `4 paquets transmis, 4 reçus, 0% paquets perdus`, "term-success");
      appendLine(id, "", "");
    }
  }, 600);
}

function cmdVim(id) {
  appendLine(
    id,
    '<span style="color:var(--yellow)">Ouverture de vim...</span>',
    "",
  );
  setTimeout(() => {
    appendLine(id, "", "");
    appendLine(id, "  ~", "term-dim");
    appendLine(id, "  ~", "term-dim");
    appendLine(
      id,
      '  ~  <span style="color:var(--green)">Bienvenue dans vim !</span>',
      "",
    );
    appendLine(
      id,
      '  ~  <span style="color:var(--text-dim)">Tapez :q! pour quitter (on sait tous que c\'est le plus dur)</span>',
      "",
    );
    appendLine(id, "  ~", "term-dim");
    appendLine(id, '"[No Name]" 0L, 0C', "term-dim");
  }, 300);
  setTimeout(() => {
    appendLine(id, "bash: vim: sessions simulées uniquement — :q! exécuté automatiquement", "term-error");
    appendLine(id, "", "");
  }, 2500);
}

function cmdNpm(id, args) {
  const sub = args[0] || "";
  if (sub === "install") {
    appendLine(id, "npm WARN No package.json found", "term-yellow");
    appendLine(id, "", "");
    appendLine(
      id,
      "added 1337 packages, and audited 1337 packages in 3s",
      "term-success",
    );
    appendLine(id, "", "");
    appendLine(id, "42 packages are looking for funding", "term-dim");
    appendLine(id, "  run npm fund for details", "term-dim");
    appendLine(id, "", "");
    appendLine(id, "found 0 vulnerabilities", "term-success");
  } else {
    appendLine(id, `npm: commande '${escHtml(sub)}' inconnue`, "term-error");
  }
}

/* ── Section Windows ────────────────────────────────────────── */

function openAboutWindow() {
  const content = `
  <div class="about-content">
    <div class="about-header">
      <img src="profile.jpg" alt="Benjamin Hanquart" class="about-photo">
      <div>
        <div class="about-name">Benjamin Hanquart</div>
        <div class="about-role">Étudiant en BUT Informatique</div>
        <div class="about-location">📍 Lille, France</div>
      </div>
    </div>
    <div class="about-section-title">À propos</div>
    <p class="about-text">
      Passionné par l'informatique et la création de logiciels permettant
      l'automatisation de tâches, je suis actuellement en deuxième année de
      BUT Informatique à l'IUT de Lille. Mon portfolio démontre mes compétences
      en développement et ma capacité à relever des défis techniques.
    </p>
    <div class="about-section-title">Compétences</div>
    <div class="skill-tags">
      <span class="skill-tag">Java</span>
      <span class="skill-tag">C</span>
      <span class="skill-tag">HTML5</span>
      <span class="skill-tag">CSS3</span>
      <span class="skill-tag">JavaScript</span>
      <span class="skill-tag">SQL</span>
    </div>
    <div class="about-section-title">Frameworks & Outils</div>
    <div class="skill-tags">
      <span class="skill-tag green">Bootstrap</span>
      <span class="skill-tag green">Tailwind</span>
      <span class="skill-tag green">Git</span>
      <span class="skill-tag green">IntelliJ</span>
      <span class="skill-tag green">VS Code</span>
      <span class="skill-tag green">JavaFX</span>
    </div>
    <div class="about-section-title">Liens</div>
    <div style="display:flex;gap:10px;margin-top:4px;">
      <a href="https://github.com/Kinakosao" target="_blank" class="proj-detail-btn">🐙 GitHub</a>
      <a href="https://www.linkedin.com/in/benjamin-hanquart-692b10288/" target="_blank" class="proj-detail-btn">💼 LinkedIn</a>
    </div>
  </div>`;
  createWindow({
    id: "about",
    title: "about.txt",
    icon: "📋",
    content,
    width: 560,
    height: 520,
  });
}

function openProjectsWindow() {
  const content = `
  <div class="projects-content">
    <div class="projects-layout">
      <div class="proj-sidebar">
        <div class="proj-filters">
          <button class="proj-filter-btn active" data-filter="all">Tous</button>
          <button class="proj-filter-btn" data-filter="java">Java</button>
          <button class="proj-filter-btn" data-filter="typescript">TS</button>
          <button class="proj-filter-btn" data-filter="api">API</button>
          <button class="proj-filter-btn" data-filter="devops">DevOps</button>
        </div>
        <div class="proj-list" id="proj-list">
          <div class="proj-list-item" data-cat="java" data-proj="1">
            <div class="pli-icon">☕</div>
            <div class="pli-info">
              <div class="pli-title">Jeux Java — RISK</div>
              <div class="pli-sub">Java · Agile</div>
            </div>
          </div>
          <div class="proj-list-item" data-cat="java" data-proj="2">
            <div class="pli-icon">🌀</div>
            <div class="pli-info">
              <div class="pli-title">Jeux Java — Labyrinthe</div>
              <div class="pli-sub">Java · JavaFX</div>
            </div>
          </div>
          <div class="proj-list-item" data-cat="java api" data-proj="4">
            <div class="pli-icon">🌿</div>
            <div class="pli-info">
              <div class="pli-title">EcoDrop — API REST</div>
              <div class="pli-sub">Java · REST · JWT</div>
            </div>
          </div>
          <div class="proj-list-item" data-cat="typescript" data-proj="5">
            <div class="pli-icon">🎮</div>
            <div class="pli-info">
              <div class="pli-title">Syck Sai-Vhen</div>
              <div class="pli-sub">TypeScript · WebSocket</div>
            </div>
          </div>
          <div class="proj-list-item" data-cat="devops" data-proj="6">
            <div class="pli-icon">🖥️</div>
            <div class="pli-info">
              <div class="pli-title">Matrix/Synapse</div>
              <div class="pli-sub">DevOps · Linux · nginx</div>
            </div>
          </div>
        </div>
      </div>
      <div class="proj-detail-panel" id="proj-detail">
        <div class="proj-detail-empty" id="proj-detail-empty">
          <span class="arrow">←</span>
          Sélectionnez un projet
        </div>
        <div id="proj-detail-content" style="display:none;"></div>
      </div>
    </div>
  </div>`;
  const id = createWindow({
    id: "projects",
    title: "projects/",
    icon: "📁",
    content,
    width: 780,
    height: 480,
  });
  initProjectsWindow(id);
}

const PROJECT_DETAILS = {
  1: {
    title: "Jeux Java — RISK",
    desc: "Jeu de stratégie en Java fonctionnant entièrement dans un terminal Linux. Développé en groupe selon la méthode agile : sprints, rétrospectives, gestion de backlog.",
    tags: ["Java", "Terminal Linux", "Agile"],
    link: "https://github.com/Kinakosao/Risk-Java-Terminal",
  },
  2: {
    title: "Jeux Java — Labyrinthe",
    desc: "Génération aléatoire de labyrinthes avec plusieurs algorithmes, plusieurs modes de jeu et une interface JavaFX. Gestion des collisions et chronomètre.",
    tags: ["Java", "JavaFX"],
    link: "https://gitlab.univ-lille.fr/sae302/2025/I4_SAE3.3",
  },
  4: {
    title: "EcoDrop — API REST",
    desc: "API REST complète sur le thème de l'écologie. Gestion de points de collecte de déchets, auth JWT avec rôles USER/ADMIN, réponses JSON/XML négociées, leaderboard des 10 meilleurs recycleurs. Déployée sur Tomcat.",
    tags: ["Java", "REST API", "JWT", "SQL", "Tomcat"],
    link: "https://github.com/Kinakosao/SAE4.02",
  },
  5: {
    title: "Syck Sai-Vhen — Shoot-em-up",
    desc: "Shoot-em-up multijoueur en TypeScript avec architecture WebSocket client/serveur. IA ennemis paramétrable, boss final, hitbox, contrôles clavier+souris, top 10 scores. Tous les assets graphiques créés par l'équipe.",
    tags: ["TypeScript", "Node.js", "WebSocket"],
    link: "https://github.com/Kinakosao/JSAE",
  },
  6: {
    title: "Déploiement Matrix/Synapse",
    desc: "Déploiement d'un serveur de messagerie Matrix (Synapse) sur 3 VMs Debian 12 : VM Synapse, VM PostgreSQL, VM Element Web + nginx reverse proxy. Architecture distribuée complète.",
    tags: [
      "Debian Linux",
      "Matrix/Synapse",
      "PostgreSQL",
      "nginx",
      "VirtualBox",
    ],
    link: "https://github.com/Kinakosao/SAE3.03",
  },
};

function initProjectsWindow(winId) {
  setTimeout(() => {
    const win = document.getElementById(`window-${winId}`);
    if (!win) return;

    // Filter buttons
    win.querySelectorAll(".proj-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        win.querySelectorAll(".proj-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        win.querySelectorAll(".proj-list-item").forEach((item) => {
          const show = filter === "all" || item.dataset.cat.split(" ").includes(filter);
          item.classList.toggle("hidden", !show);
        });
      });
    });

    // Project list items — master-detail
    const detContent = win.querySelector("#proj-detail-content");
    const detEmpty = win.querySelector("#proj-detail-empty");
    win.querySelectorAll(".proj-list-item").forEach((item) => {
      item.addEventListener("click", () => {
        win.querySelectorAll(".proj-list-item").forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        const proj = PROJECT_DETAILS[item.dataset.proj];
        if (!proj) return;
        detEmpty.style.display = "none";
        detContent.style.display = "block";
        detContent.innerHTML = `
          <h3>${escHtml(proj.title)}</h3>
          <p>${escHtml(proj.desc)}</p>
          <div class="proj-card-tags">
            ${proj.tags.map((t) => `<span class="proj-card-tag">${escHtml(t)}</span>`).join("")}
          </div>
          <a href="${proj.link}" target="_blank" class="proj-detail-btn">📂 Voir le code source</a>`;
      });
    });
  }, 0);
}

function openCVWindow() {
  const content = `
  <div class="cv-content">
    <div class="cv-header">
      <h2>Mon Parcours</h2>
      <p>Formation, expériences et compétences de Benjamin Hanquart.</p>
      <a href="CV.pdf" class="cv-download-btn" download="CV_Benjamin_Hanquart.pdf">⬇️ Télécharger CV (PDF)</a>
    </div>

    <div class="cv-section-title">Formation</div>
    <div class="timeline">
      <div class="tl-item">
        <div class="tl-title">BUT Informatique</div>
        <div class="tl-place">IUT de Lille, Villeneuve-d'Ascq</div>
        <div class="tl-date">2023 — Présent</div>
        <div class="tl-body">
          <ul>
            <li>Parcours : Réalisation d'Applications (Conception, Développement, Validation)</li>
            <li>Algorithmique · Développement Web · BDD (PL/SQL) · POO (Java/JEE) · Prog. Système (C)</li>
            <li>Projets : gestionnaire de bibliothèque, jeux vidéo Java, portfolio</li>
          </ul>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-title">Baccalauréat Technologique STI2D</div>
        <div class="tl-place">Lycée Jean Prouvé, Lomme</div>
        <div class="tl-date">2023</div>
        <div class="tl-body">Mention Bien.</div>
      </div>
    </div>

    <div class="cv-section-title">Expériences</div>
    <div class="timeline">
      <div class="tl-item">
        <div class="tl-title">Hôte de Caisse</div>
        <div class="tl-place">Carrefour, Lomme</div>
        <div class="tl-date">Février 2025 — Actuellement</div>
        <div class="tl-body">Hôte de caisse, assistant pour machines automatiques.</div>
      </div>
      <div class="tl-item">
        <div class="tl-title">Projet Personnel — Portfolio</div>
        <div class="tl-place">Projet Personnel</div>
        <div class="tl-date">2024</div>
        <div class="tl-body">Création de ce portfolio en HTML, CSS et JavaScript. Design responsive, mode sombre, animations.</div>
      </div>
    </div>

    <div class="cv-section-title">Compétences Techniques</div>
    <div class="skills-grid-win">
      <div class="skill-cat-win">
        <h5>Langages</h5>
        <div class="skill-icons-win">
          <i class="devicon-java-plain-wordmark colored" title="Java"></i>
          <i class="devicon-c-plain-wordmark colored" title="C"></i>
          <i class="devicon-html5-plain-wordmark colored" title="HTML5"></i>
          <i class="devicon-css3-plain-wordmark colored" title="CSS3"></i>
          <i class="devicon-javascript-plain colored" title="JavaScript"></i>
          <i class="devicon-mysql-plain-wordmark colored" title="SQL"></i>
        </div>
      </div>
      <div class="skill-cat-win">
        <h5>Frameworks</h5>
        <div class="skill-icons-win">
          <i class="devicon-bootstrap-plain-wordmark colored" title="Bootstrap"></i>
          <i class="devicon-tailwindcss-plain colored" title="Tailwind"></i>
        </div>
      </div>
      <div class="skill-cat-win">
        <h5>Outils</h5>
        <div class="skill-icons-win">
          <i class="devicon-git-plain-wordmark colored" title="Git"></i>
          <i class="devicon-intellij-plain-wordmark colored" title="IntelliJ"></i>
          <i class="devicon-visualstudio-plain colored" title="VS Code"></i>
          <i class="devicon-npm-original-wordmark colored" title="npm"></i>
        </div>
      </div>
    </div>
  </div>`;
  createWindow({
    id: "cv",
    title: "CV.pdf",
    icon: "📄",
    content,
    width: 660,
    height: 600,
  });
}

function openContactWindow() {
  const content = `
  <div class="contact-content">
    <h3>✉️ Me Contacter</h3>
    <p class="sub">Envoyez-moi un message directement depuis ce formulaire.</p>
    <form id="linux-contact-form" novalidate>
      <div class="cf-group">
        <label class="cf-label">$ nom</label>
        <input class="cf-input" id="cf-name" type="text" placeholder="Votre nom" required>
      </div>
      <div class="cf-group">
        <label class="cf-label">$ email</label>
        <input class="cf-input" id="cf-email" type="email" placeholder="votre@email.com" required>
      </div>
      <div class="cf-group">
        <label class="cf-label">$ message</label>
        <textarea class="cf-textarea" id="cf-message" placeholder="Votre message..." required></textarea>
      </div>
      <button type="submit" class="cf-btn">▶ Envoyer le message</button>
      <div id="cf-status"></div>
    </form>
    <div class="contact-links" style="margin-top:16px;">
      <a href="https://github.com/Kinakosao" target="_blank" class="contact-link">🐙 GitHub</a>
      <a href="https://www.linkedin.com/in/benjamin-hanquart-692b10288/" target="_blank" class="contact-link">💼 LinkedIn</a>
    </div>
  </div>`;
  const id = createWindow({
    id: "contact",
    title: "contact.sh",
    icon: "✉️",
    content,
    width: 520,
    height: 520,
  });
  initContactForm(id);
}

function initContactForm(winId) {
  setTimeout(() => {
    const form = document.getElementById("linux-contact-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("cf-name");
      const email = document.getElementById("cf-email");
      const message = document.getElementById("cf-message");
      const status = document.getElementById("cf-status");

      // Rate limiting (2 per week)
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);
      const mondayTs = monday.getTime();
      const stored = localStorage.getItem("emailResetDate");
      let count = parseInt(localStorage.getItem("emailCount") || "0");
      if (!stored || parseInt(stored) !== mondayTs) {
        count = 0;
        localStorage.setItem("emailResetDate", mondayTs.toString());
        localStorage.setItem("emailCount", "0");
      }
      if (count >= 2) {
        status.className = "cf-status error";
        status.textContent =
          "Limite atteinte : 2 messages max par semaine. Réinitialisation lundi.";
        return;
      }

      let ok = true;
      [name, email, message].forEach((f) => {
        f.classList.remove("invalid");
        if (!f.value.trim()) {
          f.classList.add("invalid");
          ok = false;
        }
      });
      if (!ok) {
        status.className = "cf-status error";
        status.textContent = "Veuillez remplir tous les champs.";
        return;
      }

      status.className = "cf-status info";
      status.textContent = "⏳ Envoi en cours...";
      emailjs.sendForm("service_rgr1e1c", "template_ubusx5c", form).then(
        () => {
          count++;
          localStorage.setItem("emailCount", count.toString());
          status.className = "cf-status success";
          status.textContent =
            "✅ Message envoyé ! Je vous répondrai dès que possible.";
          form.reset();
        },
        (err) => {
          status.className = "cf-status error";
          status.textContent = `❌ Erreur : ${JSON.stringify(err)}`;
        },
      );
    });
  }, 0);
}

/* ── Wallpaper Cycle ────────────────────────────────────────── */
function cycleWallpaper() {
  state.wallpaperIdx = (state.wallpaperIdx + 1) % state.wallpapers.length;
  document.getElementById("desktop-area").style.background =
    state.wallpapers[state.wallpaperIdx];
}

/* ── Context Menu ───────────────────────────────────────────── */
function showContextMenu(x, y) {
  const menu = document.getElementById("context-menu");
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.classList.add("show");
}
function hideContextMenu() {
  document.getElementById("context-menu").classList.remove("show");
}

/* ── Activities Overview ────────────────────────────────────── */
function toggleActivities() {
  const wins = Object.values(state.windows);
  if (wins.length === 0) {
    openTerminal();
    return;
  }
  // Simple: toggle minimize all / restore all
  const anyVisible = wins.some((w) => !w.minimized);
  wins.forEach((w) => {
    if (anyVisible && !w.minimized)
      minimizeWindow(
        Object.keys(state.windows).find((k) => state.windows[k] === w),
      );
    else if (!anyVisible && w.minimized)
      minimizeWindow(
        Object.keys(state.windows).find((k) => state.windows[k] === w),
      );
  });
}

/* ── Dispatch desktop icon / context menu actions ───────────── */
function handleAction(action) {
  switch (action) {
    case "open-terminal":
      openTerminal();
      break;
    case "open-about":
      openAboutWindow();
      break;
    case "open-projects":
      openProjectsWindow();
      break;
    case "open-cv":
      openCVWindow();
      break;
    case "open-contact":
      openContactWindow();
      break;
    case "wallpaper":
      cycleWallpaper();
      break;
  }
}

/* ── Event Listeners ────────────────────────────────────────── */
function initEvents() {
  // Ctrl+Alt+T → new terminal
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key === "t") {
      e.preventDefault();
      openTerminal();
    }
  });

  // Desktop icons (double-click)
  document.querySelectorAll(".desktop-icon").forEach((icon) => {
    let clicks = 0;
    icon.addEventListener("click", () => {
      clicks++;
      if (clicks === 1)
        setTimeout(() => {
          clicks = 0;
        }, 400);
      if (clicks >= 2) {
        clicks = 0;
        handleAction(icon.dataset.action);
      }
    });
    icon.addEventListener("dblclick", () => {
      clicks = 0;
      handleAction(icon.dataset.action);
    });
  });

  // Context menu (right-click on desktop area)
  document
    .getElementById("desktop-area")
    .addEventListener("contextmenu", (e) => {
      if (e.target.closest(".window") || e.target.closest(".desktop-icon"))
        return;
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY);
    });
  document.addEventListener("click", hideContextMenu);
  document
    .getElementById("context-menu")
    .querySelectorAll(".ctx-item")
    .forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        hideContextMenu();
        handleAction(item.dataset.action);
      });
    });

  // Activities button
  document
    .getElementById("activities-btn")
    .addEventListener("click", toggleActivities);
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 60000);
  initEvents();
  runBoot();
});
