window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');
    
    if (preloader && mainContent) {
        preloader.classList.add('hidden');
        mainContent.classList.remove('hidden-content');
        mainContent.style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // --- GENERAL LOGIC (for all pages) ---

    // Responsive Navbar closing
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.getElementById('navbarNav');
    if (menuToggle) {
        const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
        navLinks.forEach((l) => {
            l.addEventListener('click', () => {
                if (menuToggle.classList.contains('show')) {
                    bsCollapse.toggle();
                }
            });
        });
    }

    // Advanced Scroll-triggered animations
    const animatedElements = document.querySelectorAll('.fade-in-up');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }

    const staggerContainers = document.querySelectorAll('.stagger-children');
    staggerContainers.forEach(container => {
        const children = container.querySelectorAll('.fade-in-up');
        children.forEach((child, index) => {
            child.style.setProperty('--stagger-index', index);
        });
    });
    
    // Theme switcher
    const themeSwitch = document.getElementById('theme-switch-checkbox');
    if(themeSwitch) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.body.classList.add(currentTheme);
            if (currentTheme === 'dark-mode') {
                themeSwitch.checked = true;
            }
        }
        themeSwitch.addEventListener('change', function(e) {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light-mode');
            }
        });
    }

    // Update copyright year dynamically
    const copyrightYearSpan = document.getElementById('copyright-year');
    if (copyrightYearSpan) {
        copyrightYearSpan.textContent = new Date().getFullYear();
    }


    // --- INDEX.HTML SPECIFIC LOGIC ---
    
    // Typing animation
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        const words = ["Étudiant en Informatique", "Développeur Java", "Développeur Web", "Passionné de Technologie"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        function type() {
            const currentWord = words[wordIndex];
            const currentChar = isDeleting ? currentWord.substring(0, charIndex - 1) : currentWord.substring(0, charIndex + 1);
            typingText.textContent = currentChar;
            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(type, 1500);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(type, 500);
            } else {
                isDeleting ? charIndex-- : charIndex++;
                setTimeout(type, isDeleting ? 50 : 100);
            }
        }
        type();
    }

    // Navbar scroll effect for index page
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    // Scroll-to-top button logic
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > window.innerHeight / 2) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Reading progress bar
    const progressBar = document.getElementById('reading-progress');
    if (progressBar) {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
      });
    }

    // Project modal logic
    const openModalButtons = document.querySelectorAll('[data-modal-target]');
    if (openModalButtons.length > 0) {
        const closeModalButtons = document.querySelectorAll('.close-modal-btn');
        function trapFocus(modal) {
            const focusableElements = modal.querySelectorAll('a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            modal.addEventListener('keydown', e => {
                if (e.key !== 'Tab') return;
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            });
        }
        openModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = document.querySelector(button.dataset.modalTarget);
                modal.showModal();
                trapFocus(modal);
            });
        });
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.project-modal');
                modal.close();
            });
        });
        document.querySelectorAll('.project-modal').forEach(modal => {
            modal.addEventListener('click', e => {
                const dialogDimensions = modal.getBoundingClientRect();
                if (e.clientX < dialogDimensions.left || e.clientX > dialogDimensions.right || e.clientY < dialogDimensions.top || e.clientY > dialogDimensions.bottom) {
                    modal.close();
                }
            });
        });
    }

    // Contact form validation and submission with EmailJS
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');

        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Gestion de la limite d'envoi (2 par semaine, reset le lundi)
            const now = new Date();
            const day = now.getDay();
            // Calcul du lundi de la semaine courante
            // Si dimanche (0), on recule de 6 jours. Sinon on recule de (day - 1) jours.
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            
            // On crée une date calée sur ce lundi à 00:00:00
            const mondayDate = new Date(now);
            mondayDate.setDate(diff);
            mondayDate.setHours(0, 0, 0, 0);
            const currentMondayTimestamp = mondayDate.getTime();

            const storedMonday = localStorage.getItem('emailResetDate');
            let emailCount = parseInt(localStorage.getItem('emailCount') || '0');

            // Si c'est une nouvelle semaine (le timestamp du lundi a changé)
            if (!storedMonday || parseInt(storedMonday) !== currentMondayTimestamp) {
                emailCount = 0;
                localStorage.setItem('emailResetDate', currentMondayTimestamp.toString());
                localStorage.setItem('emailCount', '0');
            }

            // Vérification de la limite
            if (emailCount >= 2) {
                formStatus.innerHTML = `<div class="alert alert-warning" role="alert"><strong>Limite atteinte :</strong> Vous ne pouvez envoyer que 2 messages par semaine. Le compteur sera réinitialisé lundi prochain.</div>`;
                return;
            }
            
            // Basic client-side validation
            let isValid = true;
            ['name', 'email', 'message'].forEach(fieldName => {
                const input = contactForm.querySelector(`#${fieldName}`);
                input.classList.remove('is-valid', 'is-invalid');
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.add('is-valid');
                }
            });

            if (!isValid) {
                formStatus.innerHTML = `<div class="alert alert-danger" role="alert">Veuillez corriger les erreurs dans le formulaire avant de soumettre.</div>`;
                return;
            }

            formStatus.innerHTML = `<div class="alert alert-info" role="alert">Envoi en cours...</div>`;

            // EmailJS parameters
            const serviceID = 'service_rgr1e1c';
            const templateID = 'template_ubusx5c';

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    // Incrémenter le compteur après succès
                    let currentCount = parseInt(localStorage.getItem('emailCount') || '0');
                    currentCount++;
                    localStorage.setItem('emailCount', currentCount.toString());

                    if (typeof confetti !== 'undefined') {
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    }
                    formStatus.innerHTML = `<div class="alert alert-success" role="alert"><strong>Merci pour votre message !</strong> Je vous répondrai dès que possible.</div>`;
                    contactForm.reset();
                    ['name', 'email', 'message'].forEach(fieldName => {
                        contactForm.querySelector(`#${fieldName}`).classList.remove('is-valid');
                    });
                }, (err) => {
                    formStatus.innerHTML = `<div class="alert alert-danger" role="alert"><strong>Erreur :</strong> Une erreur s'est produite lors de l'envoi du formulaire. ${JSON.stringify(err)}</div>`;
                });
        });
    }

    // Project filtering logic
    const filterContainer = document.querySelector('#project-filters');
    if (filterContainer) {
        const projectItems = document.querySelectorAll('#project-grid .project-item');
        filterContainer.addEventListener('click', e => {
            if (e.target.tagName !== 'BUTTON') return;
            filterContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            const filter = e.target.dataset.filter;
            projectItems.forEach(item => {
                const categories = item.dataset.category.split(' ');
                const shouldShow = filter === 'all' || categories.includes(filter);
                if (!shouldShow) {
                    item.classList.add('hidden');
                } else {
                    item.classList.remove('hidden');
                }
            });
        });
    }

    // Apply language on load
    if (currentLang !== 'fr') applyLang(currentLang);
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.textContent = currentLang === 'fr' ? 'EN' : 'FR';
});


// Soft skill badge tooltip on click
(function() {
  const tip = document.createElement('div');
  tip.className = 'skill-tooltip-popup';
  tip.style.display = 'none';
  document.body.appendChild(tip);

  document.addEventListener('click', e => {
    const badge = e.target.closest('.soft-skill-badge[data-context]');
    if (badge) {
      tip.textContent = badge.dataset.context;

      // Le tooltip doit vivre dans le même dialog que le badge
      // pour ne pas passer en dessous (les <dialog> sont dans le "top layer")
      const dialog = badge.closest('dialog');
      const container = dialog || document.body;
      if (tip.parentNode !== container) container.appendChild(tip);

      tip.style.display = 'block';
      const rect = badge.getBoundingClientRect();
      let top = rect.bottom + 8;
      let left = rect.left;
      if (left + 275 > window.innerWidth) left = window.innerWidth - 280;
      if (top + 90 > window.innerHeight) top = rect.top - 100;
      tip.style.top = top + 'px';
      tip.style.left = left + 'px';
      e.stopPropagation();
    } else {
      tip.style.display = 'none';
    }
  });
})();

function copyEmail() {
  const email = 'benjamin.hanquart03@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    const btn = document.getElementById('copy-email-btn');
    if (btn) { const orig = btn.innerHTML; btn.innerHTML = '<i class="bi bi-check"></i> Copié !'; btn.classList.replace('btn-outline-secondary','btn-success'); setTimeout(() => { btn.innerHTML = orig; btn.classList.replace('btn-success','btn-outline-secondary'); }, 2000); }
  });
}

function sharePortfolio() {
  const url = 'https://benjaminhanquart.dev/?utm_source=social&utm_medium=share&utm_campaign=portfolio';
  if (navigator.share) {
    navigator.share({ title: 'Portfolio de Benjamin Hanquart', text: 'Découvrez mon portfolio !', url });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('share-btn');
      if (btn) { const orig = btn.innerHTML; btn.innerHTML = '<i class="bi bi-check"></i> Lien copié !'; setTimeout(() => btn.innerHTML = orig, 2000); }
    });
  }
}

// i18n
const TRANSLATIONS = {
  fr: {
    'nav-about': 'À propos',
    'nav-projects': 'Projets',
    'nav-contact': 'Contact',
    'hero-title': 'Benjamin Hanquart',
    'about-title': 'À propos de moi',
    'projects-title': 'Mes Projets',
    'contact-title': 'Me Contacter',
    'filter-all': 'Tous',
  },
  en: {
    'nav-about': 'About',
    'nav-projects': 'Projects',
    'nav-contact': 'Contact',
    'hero-title': 'Benjamin Hanquart',
    'about-title': 'About Me',
    'projects-title': 'My Projects',
    'contact-title': 'Contact Me',
    'filter-all': 'All',
  }
};
let currentLang = localStorage.getItem('portfolioLang') || 'fr';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('portfolioLang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (TRANSLATIONS[lang][key]) el.textContent = TRANSLATIONS[lang][key];
  });
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'fr' ? 'EN' : 'FR';
}

function toggleLang() {
  applyLang(currentLang === 'fr' ? 'en' : 'fr');
}


