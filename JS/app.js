import { applyI18n } from "./i18n.js";
import { ParticleBg } from "./particles.js";

(function () {
  // Thème
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  document.documentElement.dataset.theme = theme;

  // Langue
  const savedLang = localStorage.getItem("lang") || (navigator.language?.startsWith("fr") ? "fr" : "en");
  applyI18n(savedLang);

  // UI ready
  window.addEventListener("DOMContentLoaded", () => {
    // Année footer
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    // Toggle thème
    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const cur = document.documentElement.dataset.theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = cur;
        localStorage.setItem("theme", cur);
      });
    }

    // Toggle langue
    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
      langBtn.addEventListener("click", () => {
        const next = (localStorage.getItem("lang") || "fr") === "fr" ? "en" : "fr";
        applyI18n(next);
        document.title = document.querySelector("title")?.textContent || document.title;
      });
    }

    // Burger menu
    const menuBtn = document.querySelector(".menu-toggle");
    const nav = document.getElementById("nav-list");
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", String(open));
      });
      nav.addEventListener("click", e => {
        if (e.target.closest("a")) nav.classList.remove("open");
      });
    }

    // Scroll reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
    }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));

    // Sélecteur de lien actif si data-active manquant (fallback)
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a").forEach(a => {
      if (!a.hasAttribute("data-active") && a.getAttribute("href") === here) {
        a.setAttribute("data-active", "");
      }
    });

    // Fond canvas interactif
    const canvas = document.getElementById("bg-canvas");
    if (canvas) new ParticleBg(canvas);

    // Form contact: validation + feedback
    const form = document.getElementById("contact-form");
    if (form) {
      const status = document.getElementById("form-status");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        status.textContent = (localStorage.getItem("lang") || "fr") === "fr" ? "Envoi..." : "Sending...";
        const data = new FormData(form);
        try {
          const res = await fetch(form.action, { method: "POST", body: data, headers: { "Accept": "application/json" } });
          if (res.ok) {
            status.textContent = (localStorage.getItem("lang") || "fr") === "fr" ? "Merci ! Message envoyé." : "Thanks! Message sent.";
            form.reset();
          } else {
            status.textContent = (localStorage.getItem("lang") || "fr") === "fr" ? "Erreur d’envoi. Réessayez." : "Send error. Try again.";
          }
        } catch {
          status.textContent = (localStorage.getItem("lang") || "fr") === "fr" ? "Hors ligne ? Réessayez." : "Offline? Please retry.";
        }
      }, { passive: false });
    }
  }, { once: true });
})();
