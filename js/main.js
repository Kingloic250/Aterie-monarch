/* ============================================
   ATERIEL MONARCH — main.js
   All interactive behaviors in vanilla JS
   ============================================ */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  /* ---------- Current Year in Footer ---------- */
  const yearEl = document.getElementById("currentYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Smooth Scroll (Lenis or fallback) ---------- */
  let lenis = null;

  function initSmoothScroll() {
    if (prefersReducedMotion) return;

    // Check if Lenis loaded via CDN
    if (typeof Lenis !== "undefined") {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Smooth anchor scrolling for nav links
  function initAnchorScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href");
        if (href === "#" || href.length < 2) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: top, behavior: prefersReducedMotion ? "auto" : "smooth" });
        }

        // Close mobile nav if open
        closeMobileNav();
      });
    });
  }

  /* ---------- Sticky / Blurred Header ---------- */
  function initStickyHeader() {
    const header = document.getElementById("siteHeader");
    if (!header) return;

    let lastScroll = 0;

    function onScroll() {
      const scrollY = window.pageYOffset;
      if (scrollY > 80) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      lastScroll = scrollY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile Nav Toggle ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  let mobileNavOpen = false;

  function openMobileNav() {
    mobileNavOpen = true;
    mobileNav.classList.add("open");
    mobileNav.setAttribute("aria-hidden", "false");
    menuToggle.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMobileNav() {
    if (!mobileNavOpen) return;
    mobileNavOpen = false;
    mobileNav.classList.remove("open");
    mobileNav.setAttribute("aria-hidden", "true");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function initMobileNav() {
    if (!menuToggle || !mobileNav) return;

    menuToggle.addEventListener("click", function () {
      if (mobileNavOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNavOpen) {
        closeMobileNav();
      }
    });
  }

  /* ---------- Custom Cursor (desktop only) ---------- */
  function initCustomCursor() {
    if (isTouchDevice || prefersReducedMotion) return;

    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
    });

    function animateFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = followerX + "px";
      follower.style.top = followerY + "px";
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Scale up on hover over interactive elements
    const hoverTargets = document.querySelectorAll("a, button, .bento-card, .gallery-item, .team-card, .logo-box, .marquee-item");
    hoverTargets.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        follower.classList.add("hover");
      });
      el.addEventListener("mouseleave", function () {
        follower.classList.remove("hover");
      });
    });
  }

  /* ---------- Magnetic Buttons ---------- */
  function initMagneticButtons() {
    if (isTouchDevice || prefersReducedMotion) return;

    const magnets = document.querySelectorAll(".magnetic");
    magnets.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = "translate(" + x * 0.2 + "px, " + y * 0.2 + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- Scroll Reveal (IntersectionObserver) ---------- */
  function initScrollReveal() {
    const elements = document.querySelectorAll("[data-animate]");
    if (!elements.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (el) {
        el.classList.add("revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Animated Counters ---------- */
  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute("data-count") + "+";
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + "+";
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target + "+";
      }
    }
    requestAnimationFrame(update);
  }

  /* ---------- Video Lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxVideo = document.getElementById("lightboxVideo");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxBackdrop = document.getElementById("lightboxBackdrop");
  let lastFocusedElement = null;

  function openLightbox(videoUrl) {
    if (!lightbox || !lightboxVideo) return;

    lastFocusedElement = document.activeElement;

    // Build iframe
    const iframe = document.createElement("iframe");
    iframe.src = videoUrl + "?autoplay=1&rel=0";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = "Project video";
    lightboxVideo.innerHTML = "";
    lightboxVideo.appendChild(iframe);

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus the close button
    setTimeout(function () {
      if (lightboxClose) lightboxClose.focus();
    }, 100);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Stop video by clearing iframe
    if (lightboxVideo) lightboxVideo.innerHTML = "";

    // Restore focus
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function initLightbox() {
    if (!lightbox) return;

    // Open on card click
    const cards = document.querySelectorAll("[data-video]");
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        const url = card.getAttribute("data-video");
        if (url) openLightbox(url);
      });
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const url = card.getAttribute("data-video");
          if (url) openLightbox(url);
        }
      });
    });

    // Close on backdrop click
    if (lightboxBackdrop) {
      lightboxBackdrop.addEventListener("click", closeLightbox);
    }

    // Close on button
    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("open")) {
        closeLightbox();
      }
    });

    // Focus trap
    lightbox.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      if (!lightboxClose) return;
      if (e.shiftKey) {
        if (document.activeElement === lightboxClose) {
          e.preventDefault();
          lightboxClose.focus();
        }
      } else {
        if (document.activeElement === lightboxClose) {
          e.preventDefault();
          lightboxClose.focus();
        }
      }
    });
  }

  /* ---------- Init All ---------- */
  function init() {
    initSmoothScroll();
    initAnchorScroll();
    initStickyHeader();
    initMobileNav();
    initCustomCursor();
    initMagneticButtons();
    initScrollReveal();
    initCounters();
    initLightbox();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
