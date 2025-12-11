// Dictionnaire bilingue minimal. Tu peux l'étendre facilement.
const I18N = {
    fr: {
      "site.title": "Portfolio",
      brand: "Mon Portfolio",
      "nav.home": "Accueil",
      "nav.projects": "Projets",
      "nav.socials": "Réseaux",
      "nav.contact": "Contact",
      "home.title": "Bonjour, je suis Benjamin Hanquart",
      "home.subtitle": "Développeur orienté code / jeux vidéo. Voici mon travail.",
      "home.ctaProjects": "Voir les projets",
      "home.ctaContact": "Me contacter",
      "home.section.projects.title": "Projets récents",
      "home.section.projects.text": "Un aperçu de mes derniers travaux techniques.",
      "home.section.projects.link": "Parcourir",
      "home.section.skills.title": "Compétences",
      "home.section.socials.title": "Réseaux",
      "home.section.socials.text": "Retrouvez-moi sur les plateformes pro.",
      "home.section.socials.link": "Mes réseaux",
      "projects.title": "Projets",
      "projects.heading": "Mes projets",
      "projects.lead": "Sélection de projets perso et pros.",
      "projects.sample.desc": "Petit jeu roguelike en canvas avec génération procédurale.",
      "projects.sample2.desc": "API Node pour scores de jeu avec JWT & rate limiting.",
      "socials.title": "Réseaux",
      "socials.heading": "Où me trouver",
      "socials.lead": "Suivez mon activité et mes mises à jour.",
      "socials.github": "GitHub",
      "socials.github.desc": "Open‑source & projets",
      "socials.linkedin": "LinkedIn",
      "socials.linkedin.desc": "Parcours & réseau pro",
      "socials.itchio": "Itch.io",
      "socials.itchio.desc": "Jeux et prototypes",
      "socials.twitter": "X/Twitter",
      "socials.twitter.desc": "Actus rapides",
      "contact.title": "Contact",
      "contact.heading": "Me contacter",
      "contact.lead": "Réponse sous 24/48h.",
      "contact.form.name": "Nom",
      "contact.form.email": "Email",
      "contact.form.msg": "Message",
      "contact.form.send": "Envoyer",
      "footer.contact": "Contact"
    },
    en: {
      "site.title": "Portfolio",
      brand: "My Portfolio",
      "nav.home": "Home",
      "nav.projects": "Projects",
      "nav.socials": "Socials",
      "nav.contact": "Contact",
      "home.title": "Hi, I’m Benjamin Hanquart",
      "home.subtitle": "Developer focused on code / video games. Here’s my work.",
      "home.ctaProjects": "View Projects",
      "home.ctaContact": "Contact Me",
      "home.section.projects.title": "Recent Projects",
      "home.section.projects.text": "A snapshot of my latest technical work.",
      "home.section.projects.link": "Browse",
      "home.section.skills.title": "Skills",
      "home.section.socials.title": "Socials",
      "home.section.socials.text": "Find me on professional platforms.",
      "home.section.socials.link": "My Socials",
      "projects.title": "Projects",
      "projects.heading": "My Projects",
      "projects.lead": "Selection of personal and professional work.",
      "projects.sample.desc": "Small canvas roguelike with procedural generation.",
      "projects.sample2.desc": "Node API for game scores with JWT & rate limiting.",
      "socials.title": "Socials",
      "socials.heading": "Where to find me",
      "socials.lead": "Follow my activity and updates.",
      "socials.github": "GitHub",
      "socials.github.desc": "Open-source & projects",
      "socials.linkedin": "LinkedIn",
      "socials.linkedin.desc": "Career & professional network",
      "socials.itchio": "Itch.io",
      "socials.itchio.desc": "Games and prototypes",
      "socials.twitter": "X/Twitter",
      "socials.twitter.desc": "Quick news",
      "contact.title": "Contact",
      "contact.heading": "Contact me",
      "contact.lead": "Reply within 24/48h.",
      "contact.form.name": "Name",
      "contact.form.email": "Email",
      "contact.form.msg": "Message",
      "contact.form.send": "Send",
      "footer.contact": "Contact"
    }
  };
  
  function applyI18n(lang) {
    const dict = I18N[lang] || I18N.fr;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
    const toggle = document.getElementById("lang-toggle");
    if (toggle) toggle.textContent = lang.toUpperCase();
  }
  
  export { applyI18n };
  