/* =========================================================
   i18n — French is the source language written in the HTML.
   On load, every [data-i18n] element's French content is captured
   so we only need to maintain the English dictionary here.

   <el data-i18n="key">            → innerHTML is translated
   <el data-i18n-attr="attr:key;…"> → attributes are translated
   ========================================================= */

const I18N_STRINGS = {
  // Strings used from JavaScript (no DOM source), both languages
  fr: {
    'js.typing': ["Étudiant en BUT Informatique", "Développeur Java", "Développeur back-end", "Passionné de jeu vidéo", "Futur ingénieur CÉSI"],
    'js.limit': "<strong>Limite atteinte :</strong> vous ne pouvez envoyer que 2 messages par semaine. Le compteur sera réinitialisé lundi prochain. Vous pouvez aussi copier mon adresse e-mail ci-dessous.",
    'js.invalid': "Veuillez corriger les erreurs dans le formulaire avant de l'envoyer.",
    'js.sending': "Envoi en cours…",
    'js.sent': "<strong>Merci pour votre message !</strong> Je vous répondrai dès que possible.",
    'js.error': "<strong>Erreur :</strong> le message n'a pas pu être envoyé. Réessayez plus tard ou écrivez-moi directement à ",
    'js.copied': "Adresse e-mail copiée ✔",
    'js.linkCopied': "Lien copié dans le presse-papiers ✔",
    'js.copyFail': "Impossible de copier automatiquement : ",
    'js.shareTitle': "Portfolio de Benjamin Hanquart",
    'js.shareText': "Découvrez mon portfolio !",
    'js.themeDark': "Thème sombre activé 🌙",
    'js.themeLight': "Thème clair activé ☀️",
    'js.konami': "🎉 Code Konami ! Bien joué.",
    'js.prev': "Projet précédent",
    'js.next': "Projet suivant",
    'js.title': "Benjamin Hanquart — Portfolio",
    'js.titleCv': "Mon CV — Benjamin Hanquart",
    'js.title404': "404 — Page introuvable",
  },
  en: {
    'js.typing': ["Computer Science student", "Java developer", "Back-end developer", "Video game enthusiast", "Future CESI engineer"],
    'js.limit': "<strong>Limit reached:</strong> you can only send 2 messages per week. The counter resets next Monday. You can also copy my email address below.",
    'js.invalid': "Please fix the errors in the form before sending it.",
    'js.sending': "Sending…",
    'js.sent': "<strong>Thanks for your message!</strong> I'll get back to you as soon as possible.",
    'js.error': "<strong>Error:</strong> the message could not be sent. Please try again later or email me directly at ",
    'js.copied': "Email address copied ✔",
    'js.linkCopied': "Link copied to clipboard ✔",
    'js.copyFail': "Couldn't copy automatically: ",
    'js.shareTitle': "Benjamin Hanquart's portfolio",
    'js.shareText': "Check out my portfolio!",
    'js.themeDark': "Dark theme on 🌙",
    'js.themeLight': "Light theme on ☀️",
    'js.konami': "🎉 Konami code! Nice one.",
    'js.prev': "Previous project",
    'js.next': "Next project",
    'js.title': "Benjamin Hanquart — Portfolio",
    'js.titleCv': "My Resume — Benjamin Hanquart",
    'js.title404': "404 — Page not found",

    // ---------- Shared / navigation ----------
    'skip': "Skip to content",
    'brand': "My Portfolio",
    'nav.toggle': "Menu",
    'nav.about': "About",
    'nav.projects': "Projects",
    'nav.contact': "Contact",
    'nav.cv': "Resume",
    'nav.portfolio': "Portfolio",
    'lang.switch': "Passer en français",
    'theme.toggle': "Toggle theme",
    'close': "Close",
    'top': "Back to top",
    'footer.rights': "All rights reserved.",
    'footer.hint': "Tip: <kbd>T</kbd> toggles the theme, <kbd>L</kbd> the language… and try the Konami code 🎮",
    'linux.btn': "Linux mode",
    'linux.title': "Switch to Linux terminal mode",

    // ---------- Hero ----------
    'hero.kicker': "Computer Science degree (BUT) · IUT de Lille",
    'hero.projects': "See my projects",
    'hero.contact': "Contact me",
    'hero.share': "Share my portfolio",
    'hero.scroll': "Scroll down",

    // ---------- About ----------
    'about.title': "About me",
    'about.intro': "Passionate about computing, I'm a third-year student in the BUT Informatique (Bachelor in Computer Science) at IUT de Lille, in the Application Development track. This portfolio traces my journey through the degree with a variety of projects that showcase my technical skills and my ability to take on challenges as part of a team.",
    'about.orientation': "🎯 Career goals",
    'about.internship': "<strong>Internship:</strong> Built a web application for booking and viewing meeting rooms at <strong>Santelys</strong> (Lille), from April&nbsp;13 to June&nbsp;19,&nbsp;2025 — integrating the Microsoft&nbsp;Graph API (Outlook).",
    'about.ambition': "<strong>Ambition:</strong> Join <strong>CESI</strong> (engineering school) after the BUT to deepen my skills.",
    'about.speciality': "<strong>Focus:</strong> <strong>Back-end</strong> development — with a particular interest in video games and automation.",
    'about.photo': "Photo of Benjamin Hanquart",
    'about.hard': "Technical skills",
    'about.soft': "Soft skills",

    // ---------- Soft skills ----------
    'ss.team': "🤝 Teamwork",
    'ss.comm': "💬 Communication",
    'ss.time': "⏱️ Time management",
    'ss.autonomy': "🔍 Autonomy",
    'ss.problem': "🔧 Problem solving",
    'ss.orga': "📐 Organization",
    'ss.orga2': "📋 Organization",
    'ss.adapt': "🔄 Adaptability",
    'ss.research': "📚 Documentation research",
    'ss.rigor': "✏️ Rigor",
    'ss.creativity': "💡 Creativity",
    'ss.initiative': "🚀 Initiative",
    'ss.critical': "🧠 Critical thinking",
    'ss.pair': "🤝 Pair work",
    'ss.split': "📊 Task distribution",
    'ss.unexpected': "⚡ Handling the unexpected",
    'ss.solidarity': "🤝 Team support",
    'ss.help': "🆘 Asking for help",

    // ---------- Projects ----------
    'projects.title': "My Projects",
    'projects.subtitle': "Click a project to learn about my role, the results and what I took away from it.",
    'filter.all': "All",
    'more': "Learn more",
    'source': "Source code",
    'tag.algo': "Algorithms",
    'p1.title': "Java Game — RISK",
    'p1.card': "A Java strategy game running in a Linux terminal, built as a team using Agile methods.",
    'p2.short': "Maze",
    'p2.title': "Java Game — Maze",
    'p2.card': "A JavaFX game with random maze generation and several game modes.",
    'p3.title': "EcoDrop — REST API",
    'p3.card': "A REST API for waste collection: drop-off points, JWT auth and a recyclers leaderboard.",
    'p4.card': "A multiplayer shoot-'em-up in TypeScript/WebSocket with enemy AI, a boss and home-made assets.",
    'p5.title': "Matrix/Synapse deployment",
    'p5.card': "Deploying a Matrix communication server across 3 Debian VMs with PostgreSQL and nginx.",

    // ---------- Modal labels ----------
    'lbl.goals': "🎯 Goals",
    'lbl.role': "👤 My role",
    'lbl.results': "✅ Results",
    'lbl.tech': "🔧 Technical skills",
    'lbl.soft': "💡 Soft skills <small class=\"text-lowercase fw-normal\">(click for context)</small>",
    'lbl.takeaway': "🪞 What I took away",
    'badge.agile': "Agile / Scrum",
    'badge.gen': "Generation algorithms",
    'badge.save': "Serialization / Saving",
    'badge.nego': "JSON/XML negotiation",
    'badge.ai': "AI algorithms",

    // ---------- Modal 1 — RISK ----------
    'm1.badge': "📌 SAÉ 2.01 &mdash; Semester 2 &mdash; Team of 6 students",
    'm1.goals': "Build a playable version of the strategy game RISK in Java, running entirely in a Linux terminal, while applying the Agile method (sprints, backlog, retrospectives) within a team of 6.",
    'm1.role': "Rotating <strong>Scrum Master</strong> and developer. I mainly designed the game systems (combat rules, turn management, territory assignment) and ran the team meetings.",
    'm1.results': "A working game, presented and positively assessed by most of the first-year students.",
    'm1.c1': "I coordinated 5 classmates over several Agile sprints, split the tasks and handled Git merge conflicts.",
    'm1.c2': "As rotating Scrum Master, I ran the daily meetings to keep the group aligned on the sprint priorities.",
    'm1.c3': "I maintained the backlog and broke user stories down into estimable sub-tasks to keep progress tracking clear.",
    'm1.c4': "Mid-sprint, game rule changes required rethinking the architecture: I adapted without blocking the team.",
    'm1.takeaway': "Working with 5 classmates I didn't know at the very start of the degree taught me how crucial communication is in a group project. I discovered Agile in a hands-on way and understood that human coordination is just as demanding as the technical work itself. Today, I wouldn't hesitate to speak up more in meetings and defend my technical proposals with more confidence — shyness sometimes held back ideas that could have benefited the project.",

    // ---------- Modal 2 — Maze ----------
    'm2.badge': "📌 SAÉ 3.02 &mdash; Semester 3 &mdash; Team of 4 students",
    'm2.goals': "Create a maze game with random algorithmic generation, several game modes, and a graphical interface built with JavaFX.",
    'm2.role': "I developed the <strong>core game systems</strong>: player movement logic, wall collision detection, and the <strong>save and load</strong> system for game data.",
    'm2.results': "A complete, working game including every planned feature: maze generation, multiple game modes, a JavaFX GUI and progress saving.",
    'm2.c1': "Facing delays on the graphics, I prioritized the essential features to meet the delivery date.",
    'm2.c2': "I set up intermediate milestones to keep the 4 members in sync on the project's technical dependencies.",
    'm2.c3': "I integrated code from 4 developers working in parallel, resolved Git conflicts and ran regular peer reviews.",
    'm2.c4': "I tracked down a random collision bug in the maze generation by writing targeted unit tests.",
    'm2.c5': "I wrote systematic unit tests and documented every component of the game system to keep the code maintainable for the whole team.",
    'm2.takeaway': "Struggling to agree on features and graphics, combined with accumulating delays, taught me the importance of time management and planning. Not leaving everything until the end is a lesson I now apply to every project. Today, I would set up intermediate validation milestones from the start — a weekly sync meeting would have been enough to catch the drift long before it became blocking.",

    // ---------- Modal 3 — EcoDrop ----------
    'm3.badge': "📌 SAÉ 4.02 &mdash; Semester 4 &mdash; Pair project",
    'm3.goals': "Design and build a complete ecology-themed REST API: management of waste collection points, drop-offs, secure authentication with roles, and a ranking of the top recyclers.",
    'm3.role': "Built the whole API as a pair: designing the endpoint architecture, implementing the CRUD routes, and contributing to <strong>JWT authentication</strong>, the SQL database and <strong>JSON/XML content negotiation</strong>.",
    'm3.results': "A working REST API supporting all CRUD operations, JWT token authentication with USER/ADMIN roles, negotiated JSON/XML responses, and a top-10 recyclers leaderboard. Deployed on Tomcat.",
    'm3.c1': "Developed features in parallel with my partner, syncing daily to avoid code conflicts.",
    'm3.c2': "We assigned endpoints by functional area from the start so we could move forward in parallel without blocking each other.",
    'm3.c3': "I implemented JWT and JSON/XML negotiation on my own, without any formal course on these technologies.",
    'm3.c4': "Tracked progress on a shared Kanban board to stay aligned and anticipate dependencies between our tasks.",
    'm3.takeaway': "The main challenge was mastering JWT authentication and JSON/XML content negotiation at the same time — two new concepts to implement under a tight deadline. This project also taught me that an unbalanced split in a pair can cause blockers at the end: talking early about workload is essential. Today, I would set up regular sync points with my partner to rebalance the workload at the first signs of imbalance, rather than waiting for the problem to become visible.",

    // ---------- Modal 4 — Syck Sai-Vhen ----------
    'm4.badge': "📌 JSAE (tutored project) &mdash; Semester 4 &mdash; Team of 3 students",
    'm4.goals': "Develop a multiplayer shoot-'em-up in TypeScript with a WebSocket client/server architecture, configurable enemy AI, a final boss and a scoring system.",
    'm4.role': "I developed the <strong>enemy artificial intelligence</strong> (behaviors, movement, attack patterns) and the <strong>client-side rendering system</strong>: rendering, entity animation and real-time game state updates over WebSocket.",
    'm4.results': "A complete, working game with every planned feature: WebSocket multiplayer, enemy AI, final boss, hitboxes, scoring, and graphic assets made entirely by the team.",
    'm4.c1': "Facing unexpected absences, I refocused priorities and redistributed tasks during team meetings.",
    'm4.c2': "I took over a module left unfinished by an unavailable member to keep the delivery schedule.",
    'm4.c3': "I partially rewrote the rendering system after poor performance was detected late in development.",
    'm4.c4': "I gave technical support to a teammate struggling with the server-side WebSocket implementation.",
    'm4.c5': "I designed the enemies' attack patterns and helped create the graphic assets, made entirely by the team with no external resources.",
    'm4.c6': "Without being assigned to it, I spontaneously took over an unavailable member's unfinished module to keep the delivery schedule.",
    'm4.takeaway': "Personal setbacks for some members unbalanced the workload. This project taught me the importance of clearly communicating availability and expectations, and of anticipating collective adjustments to keep moving despite the unexpected. Today, I would set up a contingency plan from day one — knowing in advance who can take over which task if someone is unavailable would have avoided last-minute blockers.",

    // ---------- Modal 5 — Matrix ----------
    'm5.badge': "📌 SAÉ 3.03 &mdash; Semester 3 &mdash; Pair project",
    'm5.goals': "Deploy a Matrix instant-messaging server (Synapse) on a distributed architecture of 3 Debian&nbsp;12 VMs: Synapse server, PostgreSQL database, and the Element web client behind an nginx reverse proxy.",
    'm5.role': "Researched and analysed the <strong>technical documentation</strong> (Matrix, Synapse, nginx, PostgreSQL) and helped with <strong>virtual machine configuration</strong> and troubleshooting network interconnection issues.",
    'm5.results': "The architecture was deployed but not working at assessment time, due to an issue with the IUT's server infrastructure that we couldn't identify from our side. According to the teacher, our configuration was technically correct.",
    'm5.c1': "I read and interpreted the official Synapse and nginx documentation, without course material, to configure the architecture.",
    'm5.c2': "I gathered official sources and technical forums to solve network interconnection problems between the VMs.",
    'm5.c3': "We clearly split the roles: networking and VMs for me, Synapse deployment for my teammate.",
    'm5.c4': "After several hours of fruitless debugging, I reached out to the teacher and classmates — a professional step in its own right.",
    'm5.c5': "By cross-checking our observations with the official documentation, I concluded the error came from the IUT infrastructure rather than our configuration — which the teacher confirmed.",
    'm5.takeaway': "Facing a bug we couldn't solve with our resources (infrastructure hosted on the IUT's servers), I learned that it's sometimes necessary to ask for outside help rather than persisting alone. Recognizing your limits and asking for help is a professional skill in its own right. Today, rather than letting my teammate deploy alone on a single VM, I would configure a second machine in parallel on my side — that redundancy would have let us compare configurations and isolate the source of the problem much faster.",

    // ---------- Contact ----------
    'contact.title': "Contact me",
    'contact.subtitle': "A question, an internship or work-study offer? Drop me a line!",
    'contact.copy': "Copy my email",
    'form.name': "Name",
    'form.nameErr': "Please enter your name.",
    'form.email': "Email address",
    'form.emailErr': "Please enter a valid email address.",
    'form.message': "Message",
    'form.messageErr': "Please enter your message.",
    'form.send': "Send message",
    'form.namePh': "Your name",
    'form.messagePh': "Your message here",

    // ---------- Resume page ----------
    'cv.title': "My Journey",
    'cv.subtitle': "A detailed overview of my education, experience and skills.",
    'cv.download': "Download my resume",
    'cv.print': "Print",
    'cv.education': "Education",
    'cv.but.title': "BUT (Bachelor's degree in Technology) — Computer Science",
    'cv.but.date': "2023 – Present",
    'cv.but.l1': "Application Development track: design, development, validation.",
    'cv.but.l2': "Main subjects: advanced algorithms, web development (Vue.js, Node.js), databases (PL/SQL), object-oriented programming (Java/JEE), systems programming (C).",
    'cv.but.l3': "Notable projects: a library management application in Java, video games in Java and TypeScript, a REST API, this portfolio.",
    'cv.bac.title': "Technological Baccalaureate",
    'cv.bac.l1': "Specialty: STI2D (industrial and sustainable development sciences and technologies).",
    'cv.bac.l2': "Honors: <em>Bien</em> (with honors).",
    'cv.experience': "Professional experience",
    'cv.intern.title': "Internship — Web developer",
    'cv.intern.date': "April – June 2025",
    'cv.intern.desc': "Development of a web application for booking and viewing meeting rooms, integrating the Microsoft Graph API (Outlook calendars).",
    'cv.job.title': "Job — Cashier",
    'cv.job.date': "February 2025 – Present",
    'cv.job.desc': "Cashier and self-checkout assistant.",
    'cv.perso.title': "Personal project — Portfolio",
    'cv.perso.inst': "Personal project",
    'cv.perso.desc': "Built this portfolio with HTML, CSS and JavaScript: responsive design, light/dark theme, French/English version, animations and an interactive Linux mode.",
    'cv.skills': "Technical skills",
    'cv.langs': "Languages",
    'cv.frameworks': "Frameworks & libraries",
    'cv.tools': "Tools",

    // ---------- 404 ----------
    '404.text': "Oops! The page you're looking for doesn't exist.",
    '404.back': "Back to home",
  },
};

const I18N_FR_CACHE = { html: {}, attr: {} };
let currentLang = 'fr';
try {
  const saved = localStorage.getItem('portfolioLang');
  if (saved === 'en' || saved === 'fr') currentLang = saved;
} catch (e) { /* storage unavailable */ }

/** Translate a key for JS-generated text. */
function t(key) {
  const dict = I18N_STRINGS[currentLang] || {};
  if (dict[key] !== undefined) return dict[key];
  return I18N_STRINGS.fr[key] !== undefined ? I18N_STRINGS.fr[key] : key;
}

function captureFrench() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (!(key in I18N_FR_CACHE.html)) I18N_FR_CACHE.html[key] = el.innerHTML;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key && !(key in I18N_FR_CACHE.attr) && el.hasAttribute(attr)) {
        I18N_FR_CACHE.attr[key] = el.getAttribute(attr);
      }
    });
  });
}

function applyLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'fr';
  try { localStorage.setItem('portfolioLang', currentLang); } catch (e) {}
  const en = I18N_STRINGS.en;
  const pick = (key, cache) => currentLang === 'en' && en[key] !== undefined ? en[key] : cache[key];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = pick(el.dataset.i18n, I18N_FR_CACHE.html);
    if (val !== undefined && el.innerHTML !== val) el.innerHTML = val;
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      const val = pick(key, I18N_FR_CACHE.attr);
      if (attr && val !== undefined) el.setAttribute(attr, val);
    });
  });

  document.documentElement.lang = currentLang;
  const titleKey = document.body && document.body.dataset.titleKey;
  if (titleKey) document.title = t(titleKey);

  const label = document.querySelector('#lang-toggle .lang-label');
  if (label) label.textContent = currentLang === 'fr' ? 'EN' : 'FR';

  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
}

function toggleLang() {
  applyLang(currentLang === 'fr' ? 'en' : 'fr');
}

document.addEventListener('DOMContentLoaded', () => {
  captureFrench();
  applyLang(currentLang);
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.addEventListener('click', toggleLang);
});
