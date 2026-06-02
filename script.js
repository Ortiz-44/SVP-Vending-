/* SVP Vending — script.js  (vanilla, no dependencies) */
(function () {
  "use strict";

  /* ---- Mobile nav ---- */
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    // Close after tapping a link, or on Escape
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ---- Sticky header shadow on scroll ---- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Current year in footer ---- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Reveal on scroll ---- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- FAQ accordion (activates when FAQ section exists) ---- */
  document.querySelectorAll(".faq__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq__item");
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      const panel = item.querySelector(".faq__a");
      if (panel) panel.style.maxHeight = open ? panel.scrollHeight + "px" : null;
    });
  });

  /* ---- Contact form (client-side validation + mailto fallback) ---- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = form.querySelector(".form__status");
    const showError = (field, msg) => {
      const wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.add("field--error");
      const note = wrap.querySelector(".field__error");
      if (note) note.textContent = msg;
      field.setAttribute("aria-invalid", "true");
    };
    const clearError = (field) => {
      const wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.remove("field--error");
      const note = wrap.querySelector(".field__error");
      if (note) note.textContent = "";
      field.removeAttribute("aria-invalid");
    };
    form.querySelectorAll("input, textarea, select").forEach((f) =>
      f.addEventListener("input", () => clearError(f))
    );

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      let firstBad = null;
      const required = form.querySelectorAll("[required]");
      required.forEach((f) => {
        const val = (f.value || "").trim();
        let bad = !val;
        if (f.type === "email" && val) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (bad) { ok = false; showError(f, f.dataset.error || "This field is required."); firstBad = firstBad || f; }
        else clearError(f);
      });

      if (!ok) { if (firstBad) firstBad.focus(); if (status) { status.textContent = "Please fix the highlighted fields."; status.className = "form__status is-error"; } return; }

      // No backend on a static host yet — open a prefilled email as a graceful fallback.
      // TODO: replace with a Formspree/Getform endpoint by setting form.action + method="POST".
      const get = (n) => (form.elements[n] ? String(form.elements[n].value).trim() : "");
      const subject = encodeURIComponent("New vending inquiry — " + (get("business") || get("name") || "SVP website"));
      const body = encodeURIComponent(
        "Name: " + get("name") +
        "\nBusiness: " + get("business") +
        "\nEmail: " + get("email") +
        "\nPhone: " + get("phone") +
        "\nType of space: " + get("space") +
        "\nPeople / daily foot traffic: " + get("traffic") +
        "\n\n" + get("message")
      );
      if (status) { status.textContent = "Opening your email app to send… If nothing happens, email svpvendingmn@gmail.com directly."; status.className = "form__status is-ok"; }
      window.location.href = "mailto:svpvendingmn@gmail.com?subject=" + subject + "&body=" + body;
    });
  }
})();
