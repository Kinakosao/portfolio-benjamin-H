// Plausible custom events: safe no-throw shim (queues silently if the analytics
// script is blocked by an ad-blocker or not loaded on this page).
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };

/* =========================================================
   Preloader — hide on full load, with a safety timeout so a slow
   CDN / analytics script never keeps the page hidden.
   ========================================================= */
(function () {
    let revealed = false;
    function reveal() {
        if (revealed) return;
        revealed = true;
        const preloader = document.getElementById('preloader');
        const mainContent = document.getElementById('main-content');
        if (mainContent) mainContent.classList.remove('hidden-content');
        if (preloader) preloader.classList.add('hidden');
        document.dispatchEvent(new Event('contentrevealed'));
    }
    window.addEventListener('load', reveal);
    document.addEventListener('DOMContentLoaded', () => setTimeout(reveal, 1500));
})();

/* =========================================================
   Theme — stored as 'light' | 'dark'; follows the OS until the
   visitor makes an explicit choice.
   ========================================================= */
function getStoredTheme() {
    try {
        const t = localStorage.getItem('theme');
        if (t === 'dark' || t === 'dark-mode') return 'dark';
        if (t === 'light' || t === 'light-mode') return 'light';
    } catch (e) {}
    return null;
}

function setTheme(theme, persist) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    if (persist) {
        try { localStorage.setItem('theme', theme); } catch (e) {}
    }
}

function toggleTheme() {
    const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
    showToast(t(next === 'dark' ? 'js.themeDark' : 'js.themeLight'));
}

(function () {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(getStoredTheme() || (mq.matches ? 'dark' : 'light'), false);
    const onChange = e => { if (!getStoredTheme()) setTheme(e.matches ? 'dark' : 'light', false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
})();

/* =========================================================
   Toast
   ========================================================= */
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* =========================================================
   Clipboard helper with fallback for non-secure contexts
   ========================================================= */
function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
        } catch (err) {
            reject(err);
        } finally {
            ta.remove();
        }
    });
}

const CONTACT_EMAIL = 'benjamin.hanquart03@gmail.com';

function copyEmail() {
    copyText(CONTACT_EMAIL)
        .then(() => {
            plausible('Email Copié');
            showToast(t('js.copied'));
            const btn = document.getElementById('copy-email-btn');
            if (btn) {
                const icon = btn.querySelector('.bi');
                if (icon) icon.className = 'bi bi-check2';
                setTimeout(() => { if (icon) icon.className = 'bi bi-clipboard'; }, 2000);
            }
        })
        .catch(() => showToast(t('js.copyFail') + CONTACT_EMAIL));
}

function sharePortfolio() {
    const url = 'https://benjaminhanquart.dev/?utm_source=social&utm_medium=share&utm_campaign=portfolio';
    if (navigator.share) {
        navigator.share({ title: t('js.shareTitle'), text: t('js.shareText'), url }).catch(() => {});
    } else {
        copyText(url)
            .then(() => showToast(t('js.linkCopied')))
            .catch(() => showToast(t('js.copyFail') + url));
    }
}

/* =========================================================
   Achievements (easter eggs) — see achievements.js
   ========================================================= */
window.onAchievementUnlocked = function (meta) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `<span style="font-size:1.4rem">${meta.icon}</span><div><strong>${t('js.achUnlocked')}</strong><br>${meta.name}</div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
    if (typeof confetti !== 'undefined') confetti({ particleCount: 60, spread: 55, origin: { y: 0.85 } });
    refreshAchievementsUI();
};

function refreshAchievementsUI() {
    if (typeof getAchievementProgress !== 'function') return;
    const progress = getAchievementProgress();
    const badge = document.getElementById('ach-count-badge');
    if (badge) badge.textContent = `${progress.unlocked}/${progress.total}`;
    const list = document.getElementById('achievements-list');
    if (list) list.innerHTML = renderAchievementsHTML();
}

/* =========================================================
   Live GitHub stats on project cards linked to a public repo
   ========================================================= */
function loadGithubStats() {
    const nodes = document.querySelectorAll('[data-github]');
    if (nodes.length === 0) return;

    const timeAgo = (isoDate) => {
        const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
        const en = currentLang === 'en';
        if (days < 1) return en ? 'today' : "aujourd'hui";
        if (days === 1) return en ? '1 day ago' : 'il y a 1 jour';
        if (days < 30) return en ? `${days} days ago` : `il y a ${days} jours`;
        const months = Math.floor(days / 30);
        if (months < 12) return en ? `${months} month(s) ago` : `il y a ${months} mois`;
        const years = Math.floor(months / 12);
        return en ? `${years} year(s) ago` : `il y a ${years} an(s)`;
    };

    const render = (node, data) => {
        node.innerHTML = `
            <span class="gh-stat" title="${t('js.ghStars')}"><i class="bi bi-star-fill"></i> ${data.stars}</span>
            <span class="gh-stat" title="${t('js.ghUpdated')}"><i class="bi bi-clock-history"></i> ${timeAgo(data.updated)}</span>
            ${data.language ? `<span class="gh-stat">${data.language}</span>` : ''}
        `;
    };

    nodes.forEach(async (node) => {
        const repo = node.dataset.github;
        try {
            const cacheKey = `gh-stats:${repo}`;
            let cached = null;
            try { cached = sessionStorage.getItem(cacheKey); } catch (e) {}
            const data = cached ? JSON.parse(cached) : await (async () => {
                const res = await fetch(`https://api.github.com/repos/${repo}`);
                if (!res.ok) throw new Error(`GitHub API ${res.status}`);
                const json = await res.json();
                const trimmed = { stars: json.stargazers_count, updated: json.pushed_at, language: json.language };
                try { sessionStorage.setItem(cacheKey, JSON.stringify(trimmed)); } catch (e) {}
                return trimmed;
            })();
            render(node, data);
            document.addEventListener('langchange', () => render(node, data));
        } catch (e) {
            // Repo private, renamed, or GitHub API rate-limited: fail silently, no badge shown.
            node.remove();
        }
    });
}

/* =========================================================
   Page logic
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Theme button ---
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // --- Keyboard shortcuts (ignored while typing) + Konami code ---
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiPos = 0;
    document.addEventListener('keydown', e => {
        const tag = (e.target.tagName || '').toLowerCase();
        const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
        if (typing || e.ctrlKey || e.metaKey || e.altKey) return;

        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        konamiPos = key === konami[konamiPos] ? konamiPos + 1 : (key === konami[0] ? 1 : 0);
        if (konamiPos === konami.length) {
            konamiPos = 0;
            const isNew = typeof unlockAchievement === 'function' && unlockAchievement('konami');
            if (!isNew) {
                showToast(t('js.konami'));
                if (typeof confetti !== 'undefined') {
                    confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 } });
                }
            }
            return;
        }
        if (document.querySelector('dialog[open]')) return;
        const palette = document.getElementById('cmdk-overlay');
        if (palette && palette.classList.contains('show')) return;
        if (key === 't') toggleTheme();
        else if (key === 'l' && typeof toggleLang === 'function') toggleLang();
    });

    // --- Close mobile menu after clicking a link ---
    const menuToggle = document.getElementById('navbarNav');
    if (menuToggle && window.bootstrap) {
        const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });
        menuToggle.querySelectorAll('.nav-link').forEach(l => {
            l.addEventListener('click', () => {
                if (menuToggle.classList.contains('show')) bsCollapse.hide();
            });
        });
    }

    // --- Scroll-triggered animations ---
    document.querySelectorAll('.stagger-children').forEach(container => {
        container.querySelectorAll('.fade-in-up').forEach((child, index) => {
            child.style.setProperty('--stagger-index', index);
        });
    });
    const animatedElements = document.querySelectorAll('.fade-in-up');
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

    // --- Copyright year ---
    const copyrightYearSpan = document.getElementById('copyright-year');
    if (copyrightYearSpan) copyrightYearSpan.textContent = new Date().getFullYear();

    // --- Typing animation (restarts with the right words on language change) ---
    const typingText = document.getElementById('typing-text');
    if (typingText) {
        let timer;
        function startTyping() {
            clearTimeout(timer);
            const words = t('js.typing');
            if (prefersReducedMotion) {
                typingText.textContent = words[0];
                return;
            }
            let wordIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            (function type() {
                const currentWord = words[wordIndex];
                charIndex += isDeleting ? -1 : 1;
                typingText.textContent = currentWord.substring(0, charIndex);
                if (!isDeleting && charIndex === currentWord.length) {
                    isDeleting = true;
                    timer = setTimeout(type, 1600);
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    timer = setTimeout(type, 400);
                } else {
                    timer = setTimeout(type, isDeleting ? 45 : 90);
                }
            })();
        }
        startTyping();
        document.addEventListener('langchange', startTyping);
    }

    // --- Scroll-dependent UI: navbar, progress bar, back-to-top, active link ---
    const navbar = document.querySelector('.navbar');
    const heroSection = document.getElementById('hero');
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    const progressBar = document.getElementById('reading-progress');
    const sectionLinks = Array.from(document.querySelectorAll('.navbar .nav-link[href^="#"]'));
    const sections = sectionLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    let ticking = false;
    function onScroll() {
        ticking = false;
        const y = window.scrollY;
        if (navbar && heroSection) navbar.classList.toggle('navbar-scrolled', y > 50);
        if (scrollToTopBtn) scrollToTopBtn.classList.toggle('visible', y > window.innerHeight / 2);
        if (progressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + '%';
        }
        if (sections.length) {
            let current = null;
            sections.forEach(sec => {
                if (sec.getBoundingClientRect().top <= 120) current = sec.id;
            });
            sectionLinks.forEach(link => {
                const active = link.getAttribute('href') === '#' + current;
                link.classList.toggle('active', active);
                if (active) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        }
    }
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    document.addEventListener('contentrevealed', onScroll);
    onScroll();

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }

    // --- Share / copy buttons ---
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.addEventListener('click', sharePortfolio);
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) copyBtn.addEventListener('click', copyEmail);

    // --- Modals (projects, tech watch, achievements) ---
    // Project modals also get deep links (/#projet-eco) and previous/next navigation.
    const modalTriggers = Array.from(document.querySelectorAll('[data-modal-target]'));
    const projectTriggers = modalTriggers.filter(b => b.closest('#project-grid'));
    const projectModals = projectTriggers.map(b => document.querySelector(b.dataset.modalTarget)).filter(Boolean);
    const allModals = Array.from(document.querySelectorAll('dialog.project-modal'));
    const slugOf = modal => 'projet-' + modal.id.replace('project-modal-', '');
    let lastTrigger = null;

    function visibleProjectModals() {
        return projectTriggers
            .filter(b => !b.closest('.project-item.hidden'))
            .map(b => document.querySelector(b.dataset.modalTarget))
            .filter(Boolean);
    }

    function openModal(modal, trigger) {
        if (!modal || typeof modal.showModal !== 'function') return;
        document.querySelectorAll('dialog[open]').forEach(d => { if (d !== modal) d.close(); });
        if (trigger) lastTrigger = trigger;
        if (modal.id === 'achievements-modal') refreshAchievementsUI();
        if (!modal.open) modal.showModal();
        document.body.classList.add('modal-open-lock');
        if (projectModals.includes(modal)) history.replaceState(null, '', '#' + slugOf(modal));
    }
    window.openPortfolioModal = selector => openModal(document.querySelector(selector));

    projectModals.forEach(modal => {
        const nav = document.createElement('div');
        nav.className = 'modal-nav';
        nav.innerHTML =
            '<button type="button" class="btn btn-sm btn-outline-secondary" data-dir="-1"><i class="bi bi-arrow-left"></i> <span data-i18n="js.prev"></span></button>' +
            '<button type="button" class="btn btn-sm btn-outline-secondary" data-dir="1"><span data-i18n="js.next"></span> <i class="bi bi-arrow-right"></i></button>';
        modal.querySelector('.modal-content').appendChild(nav);
        nav.addEventListener('click', e => {
            const btn = e.target.closest('button[data-dir]');
            if (!btn) return;
            const list = visibleProjectModals();
            const idx = list.indexOf(modal);
            const next = list[(idx + Number(btn.dataset.dir) + list.length) % list.length];
            if (next && next !== modal) {
                modal.close();
                openModal(next);
            }
        });
    });
    // Fill the prev/next labels (they were injected after the first applyLang)
    const fillNavLabels = () => document.querySelectorAll('.modal-nav [data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    fillNavLabels();
    document.addEventListener('langchange', fillNavLabels);

    allModals.forEach(modal => {
        modal.addEventListener('close', () => {
            if (!document.querySelector('dialog[open]')) {
                document.body.classList.remove('modal-open-lock');
                if (location.hash.startsWith('#projet-')) {
                    history.replaceState(null, '', location.pathname + location.search);
                }
                if (lastTrigger) lastTrigger.focus({ preventScroll: true });
            }
        });
        // Click on the backdrop closes the dialog
        modal.addEventListener('click', e => {
            if (e.target !== modal) return;
            const r = modal.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
                modal.close();
            }
        });
    });

    modalTriggers.forEach(trigger => {
        const open = () => openModal(document.querySelector(trigger.dataset.modalTarget), trigger);
        trigger.addEventListener('click', open);
        if (trigger.tagName !== 'BUTTON') {
            trigger.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                }
            });
        }
    });
    document.querySelectorAll('.close-modal-btn').forEach(button => {
        button.addEventListener('click', () => button.closest('dialog').close());
    });

    function openFromHash() {
        const hash = location.hash.slice(1);
        const target = projectModals.find(m => slugOf(m) === hash);
        if (target) openModal(target);
    }
    document.addEventListener('contentrevealed', openFromHash);
    window.addEventListener('hashchange', openFromHash);

    // --- Soft skill tooltips (click or keyboard) ---
    const tip = document.createElement('div');
    tip.className = 'skill-tooltip-popup';
    tip.setAttribute('role', 'tooltip');
    tip.style.display = 'none';
    document.body.appendChild(tip);

    function hideTip() { tip.style.display = 'none'; }
    function showTip(badge) {
        tip.textContent = badge.dataset.context;
        // The tooltip must live inside the same <dialog> as the badge,
        // otherwise it is rendered below the dialog's top layer.
        const container = badge.closest('dialog') || document.body;
        if (tip.parentNode !== container) container.appendChild(tip);
        tip.style.display = 'block';
        const rect = badge.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        let top = rect.bottom + 8;
        let left = Math.max(8, Math.min(rect.left, window.innerWidth - tipRect.width - 8));
        if (top + tipRect.height > window.innerHeight - 8) top = rect.top - tipRect.height - 8;
        tip.style.top = top + 'px';
        tip.style.left = left + 'px';
    }
    document.querySelectorAll('.soft-skill-badge[data-context]').forEach(badge => {
        badge.setAttribute('tabindex', '0');
        badge.setAttribute('role', 'button');
        badge.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showTip(badge);
            }
        });
        badge.addEventListener('blur', hideTip);
    });
    document.addEventListener('click', e => {
        const badge = e.target.closest('.soft-skill-badge[data-context]');
        if (badge) {
            showTip(badge);
            e.stopPropagation();
        } else {
            hideTip();
        }
    });
    document.addEventListener('close', hideTip, true);
    window.addEventListener('scroll', hideTip, { passive: true });

    // --- Project filtering (with counts) ---
    const filterContainer = document.getElementById('project-filters');
    if (filterContainer) {
        const projectItems = document.querySelectorAll('#project-grid .project-item');
        filterContainer.querySelectorAll('button[data-filter]').forEach(btn => {
            const f = btn.dataset.filter;
            const count = f === 'all'
                ? projectItems.length
                : Array.from(projectItems).filter(i => i.dataset.category.split(' ').includes(f)).length;
            const badge = document.createElement('span');
            badge.className = 'count';
            badge.textContent = count;
            btn.appendChild(badge);
        });
        filterContainer.addEventListener('click', e => {
            const btn = e.target.closest('button[data-filter]');
            if (!btn) return;
            filterContainer.querySelectorAll('button[data-filter]').forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            const filter = btn.dataset.filter;
            projectItems.forEach(item => {
                const show = filter === 'all' || item.dataset.category.split(' ').includes(filter);
                item.classList.toggle('hidden', !show);
            });
        });
    }

    // --- Contact form (EmailJS) ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        const messageField = contactForm.querySelector('#message');
        const charCount = document.getElementById('char-count');
        if (messageField && charCount) {
            messageField.addEventListener('input', () => { charCount.textContent = messageField.value.length; });
        }

        const alertBox = (type, html) => `<div class="alert alert-${type}" role="alert">${html}</div>`;
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Live re-validation once a field has been flagged
        contactForm.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) validateField(input);
            });
        });

        function validateField(input) {
            const value = input.value.trim();
            const ok = input.type === 'email' ? emailRe.test(value) : value.length > 0;
            input.classList.toggle('is-invalid', !ok);
            input.classList.toggle('is-valid', ok);
            return ok;
        }

        function mondayTimestamp() {
            const now = new Date();
            const day = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
            monday.setHours(0, 0, 0, 0);
            return monday.getTime();
        }

        function readCount() {
            try {
                const monday = mondayTimestamp();
                if (parseInt(localStorage.getItem('emailResetDate'), 10) !== monday) {
                    localStorage.setItem('emailResetDate', String(monday));
                    localStorage.setItem('emailCount', '0');
                    return 0;
                }
                return parseInt(localStorage.getItem('emailCount') || '0', 10);
            } catch (e) {
                return 0;
            }
        }

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const fields = ['name', 'email', 'message'].map(id => contactForm.querySelector('#' + id));

            // Honeypot anti-spam: an invisible field that bots tend to fill in.
            const honeypot = contactForm.querySelector('#website');
            if (honeypot && honeypot.value.trim()) {
                // Fake success so the bot doesn't know it was detected.
                formStatus.innerHTML = alertBox('success', t('js.sent'));
                contactForm.reset();
                return;
            }

            const allValid = fields.map(validateField).every(Boolean);
            if (!allValid) {
                formStatus.innerHTML = alertBox('danger', t('js.invalid'));
                const firstInvalid = contactForm.querySelector('.is-invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // Anti-spam: 2 messages per week per browser, reset on Monday
            if (readCount() >= 2) {
                formStatus.innerHTML = alertBox('warning', t('js.limit'));
                return;
            }

            if (!window.emailjs) {
                formStatus.innerHTML = alertBox('danger', t('js.error') + `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`);
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            formStatus.innerHTML = alertBox('info', `<span class="spinner-border spinner-border-sm me-2"></span>${t('js.sending')}`);

            emailjs.sendForm('service_rgr1e1c', 'template_ubusx5c', this)
                .then(() => {
                    try { localStorage.setItem('emailCount', String(readCount() + 1)); } catch (e) {}
                    plausible('Message Envoyé');
                    if (typeof confetti !== 'undefined' && !prefersReducedMotion) {
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    }
                    formStatus.innerHTML = alertBox('success', t('js.sent'));
                    contactForm.reset();
                    if (charCount) charCount.textContent = '0';
                    fields.forEach(f => f.classList.remove('is-valid', 'is-invalid'));
                })
                .catch(err => {
                    console.error('EmailJS error:', err);
                    formStatus.innerHTML = alertBox('danger', t('js.error') + `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`);
                })
                .finally(() => { submitBtn.disabled = false; });
        });
    }

    // --- Live GitHub stats, achievements badge ---
    loadGithubStats();
    refreshAchievementsUI();

    // --- CV download tracking ---
    document.querySelectorAll('a[href$="CV.pdf"]').forEach(a => {
        a.addEventListener('click', () => {
            plausible('CV Téléchargé', { props: { source: a.id === 'resume-cv-download' ? 'resume-page' : 'link' } });
        });
    });

    // --- Retro visitor counter (purely local/cosmetic, not real site-wide analytics) ---
    const retro = document.getElementById('retro-visitor-count');
    if (retro) {
        let count = 0;
        try {
            count = parseInt(localStorage.getItem('retroVisitCount') || '0', 10) + 1;
            localStorage.setItem('retroVisitCount', String(count));
        } catch (e) { count = 1; }
        retro.textContent = String(count).padStart(6, '0');
    }

    initCommandPalette();
});

/* =========================================================
   Command Palette (Ctrl+K / Cmd+K)
   ========================================================= */
function initCommandPalette() {
    const overlay = document.getElementById('cmdk-overlay');
    const input = document.getElementById('cmdk-input');
    const resultsEl = document.getElementById('cmdk-results');
    const hintBtn = document.getElementById('cmdk-hint');
    if (!overlay || !input || !resultsEl) return;

    const open = sel => window.openPortfolioModal && window.openPortfolioModal(sel);
    const goTo = hash => { location.hash = hash; };

    // [French label, English label, tag, action]
    const items = [
        ['Aller à : À propos', 'Go to: About', 'section', () => goTo('#about')],
        ['Aller à : Projets', 'Go to: Projects', 'section', () => goTo('#projects')],
        ['Aller à : Veille technique', 'Go to: Tech watch', 'section', () => goTo('#veille')],
        ['Aller à : Contact', 'Go to: Contact', 'section', () => goTo('#contact')],
        ['Ouvrir : Mon CV (page)', 'Open: My resume (page)', 'page', () => { location.href = 'resume.html'; }],
        ['Télécharger mon CV (PDF)', 'Download my resume (PDF)', 'file', () => { plausible('CV Téléchargé', { props: { source: 'palette' } }); location.href = 'CV.pdf'; }],
        ['Passer en mode Linux 🐧', 'Switch to Linux mode 🐧', 'page', () => { location.href = 'linux.html'; }],
        ['Projet : RISK (Java)', 'Project: RISK (Java)', 'project', () => open('#project-modal-1')],
        ['Projet : Labyrinthe (Java)', 'Project: Maze (Java)', 'project', () => open('#project-modal-2')],
        ['Projet : EcoDrop (API REST)', 'Project: EcoDrop (REST API)', 'project', () => open('#project-modal-eco')],
        ['Projet : Syck Sai-Vhen', 'Project: Syck Sai-Vhen', 'project', () => open('#project-modal-game')],
        ['Projet : Matrix/Synapse', 'Project: Matrix/Synapse', 'project', () => open('#project-modal-devops')],
        ['Article : JWT expliqué simplement', 'Article: JWT explained simply', 'article', () => open('#veille-modal-1')],
        ['Article : Négocier du JSON/XML', 'Article: Negotiating JSON/XML', 'article', () => open('#veille-modal-2')],
        ['Article : Déployer sur plusieurs VMs', 'Article: Deploying across several VMs', 'article', () => open('#veille-modal-3')],
        ['Voir les succès cachés 🏆', 'See hidden achievements 🏆', 'fun', () => open('#achievements-modal')],
        ['Copier mon email', 'Copy my email', 'action', () => copyEmail()],
        ['Ajouter à mes contacts (vCard)', 'Add to my contacts (vCard)', 'action', () => { location.href = 'Benjamin_Hanquart.vcf'; }],
        ['Changer le thème clair / sombre', 'Toggle light / dark theme', 'action', () => toggleTheme()],
        ['Switch to English 🇬🇧', 'Passer en français 🇫🇷', 'action', () => toggleLang()],
        ['GitHub ↗', 'GitHub ↗', 'link', () => window.open('https://github.com/Kinakosao', '_blank', 'noopener')],
        ['LinkedIn ↗', 'LinkedIn ↗', 'link', () => window.open('https://www.linkedin.com/in/benjamin-hanquart-692b10288/', '_blank', 'noopener')],
    ].map(([fr, en, tag, action]) => ({ fr, en, tag, action }));

    const label = item => (currentLang === 'en' ? item.en : item.fr);
    const escapeHtml = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    let filtered = items;
    let activeIndex = 0;

    function render() {
        if (filtered.length === 0) {
            resultsEl.innerHTML = `<div class="cmdk-empty">${t('js.cmdkEmpty')}</div>`;
            return;
        }
        resultsEl.innerHTML = filtered.map((item, i) =>
            `<div class="cmdk-item${i === activeIndex ? ' active' : ''}" data-index="${i}" role="option" aria-selected="${i === activeIndex}">
                <span>${escapeHtml(label(item))}</span><span class="cmdk-hint-tag">${item.tag}</span>
            </div>`
        ).join('');
        const active = resultsEl.querySelector('.cmdk-item.active');
        if (active) active.scrollIntoView({ block: 'nearest' });
    }

    function filterItems(query) {
        const q = query.trim().toLowerCase();
        filtered = q ? items.filter(i => i.fr.toLowerCase().includes(q) || i.en.toLowerCase().includes(q)) : items;
        activeIndex = 0;
        render();
    }

    function openPalette() {
        overlay.classList.add('show');
        input.value = '';
        input.placeholder = t('js.cmdkPlaceholder');
        filterItems('');
        setTimeout(() => input.focus(), 0);
    }

    function closePalette() {
        overlay.classList.remove('show');
    }

    function runActive() {
        const item = filtered[activeIndex];
        if (item) { closePalette(); item.action(); }
    }

    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            overlay.classList.contains('show') ? closePalette() : openPalette();
        } else if (overlay.classList.contains('show')) {
            if (e.key === 'Escape') { closePalette(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); render(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
            else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
        }
    });

    input.addEventListener('input', () => filterItems(input.value));
    resultsEl.addEventListener('click', e => {
        const row = e.target.closest('.cmdk-item');
        if (row) { activeIndex = parseInt(row.dataset.index, 10); runActive(); }
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });
    if (hintBtn) hintBtn.addEventListener('click', openPalette);
}
