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
   Page logic
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Theme button ---
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // --- Keyboard shortcuts (ignored while typing) ---
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
            showToast(t('js.konami'));
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 } });
            }
            return;
        }
        if (document.querySelector('dialog[open]')) return;
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

    // --- Project modals (with deep links: /#projet-risk opens the RISK modal) ---
    const modalButtons = Array.from(document.querySelectorAll('[data-modal-target]'));
    if (modalButtons.length > 0) {
        const modals = modalButtons.map(b => document.querySelector(b.dataset.modalTarget)).filter(Boolean);
        const slugOf = modal => 'projet-' + modal.id.replace('project-modal-', '');
        let lastTrigger = null;

        function visibleModals() {
            return modalButtons
                .filter(b => !b.closest('.project-item.hidden'))
                .map(b => document.querySelector(b.dataset.modalTarget))
                .filter(Boolean);
        }

        function openModal(modal, trigger) {
            if (!modal || typeof modal.showModal !== 'function') return;
            document.querySelectorAll('dialog[open]').forEach(d => { if (d !== modal) d.close(); });
            if (trigger) lastTrigger = trigger;
            if (!modal.open) modal.showModal();
            document.body.classList.add('modal-open-lock');
            history.replaceState(null, '', '#' + slugOf(modal));
        }

        // Previous / next navigation inside each modal
        modals.forEach(modal => {
            const nav = document.createElement('div');
            nav.className = 'modal-nav';
            nav.innerHTML =
                '<button type="button" class="btn btn-sm btn-outline-secondary" data-dir="-1"><i class="bi bi-arrow-left"></i> <span data-i18n="js.prev"></span></button>' +
                '<button type="button" class="btn btn-sm btn-outline-secondary" data-dir="1"><span data-i18n="js.next"></span> <i class="bi bi-arrow-right"></i></button>';
            modal.querySelector('.modal-content').appendChild(nav);
            nav.addEventListener('click', e => {
                const btn = e.target.closest('button[data-dir]');
                if (!btn) return;
                const list = visibleModals();
                const idx = list.indexOf(modal);
                const next = list[(idx + Number(btn.dataset.dir) + list.length) % list.length];
                if (next && next !== modal) {
                    modal.close();
                    openModal(next);
                }
            });

            modal.addEventListener('close', () => {
                if (!document.querySelector('dialog[open]')) {
                    document.body.classList.remove('modal-open-lock');
                    history.replaceState(null, '', location.pathname + location.search);
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
        // Fill the prev/next labels (they were injected after the first applyLang)
        const fillNavLabels = () => document.querySelectorAll('.modal-nav [data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
        fillNavLabels();
        document.addEventListener('langchange', fillNavLabels);

        modalButtons.forEach(button => {
            button.addEventListener('click', () => openModal(document.querySelector(button.dataset.modalTarget), button));
        });
        document.querySelectorAll('.close-modal-btn').forEach(button => {
            button.addEventListener('click', () => button.closest('dialog').close());
        });

        function openFromHash() {
            const hash = location.hash.slice(1);
            const target = modals.find(m => slugOf(m) === hash);
            if (target) openModal(target);
        }
        document.addEventListener('contentrevealed', openFromHash);
        window.addEventListener('hashchange', openFromHash);
    }

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
});
