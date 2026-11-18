/* =========================================================
   Krisha Savaliya — Portfolio interactions
   Plain JavaScript, no libraries.
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- page load sequence ---------- */
  function markLoaded() {
    requestAnimationFrame(() => document.body.classList.add("is-loaded"));
  }
  if (document.fonts && document.fonts.ready) {
    // wait for the font, but never longer than 900ms
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(markLoaded);
  } else {
    markLoaded();
  }

  $("#year").textContent = new Date().getFullYear();

  /* ---------- toast ---------- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2400);
  }

  /* ---------- nav: glass on scroll, active link, mobile menu ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const navLinks = $("#navLinks");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navLinks.classList.toggle("is-open", open);
  }
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
      setMenu(false);
      burger.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("is-open") && !nav.contains(e.target)) setMenu(false);
  });

  const sectionLinks = $$(".nav-links a");
  const sections = sectionLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  // the hero is observed too, so no link stays lit at the top of the page
  sections.concat($("#home")).forEach((s) => activeObserver.observe(s));

  /* ---------- hero: glow and lit-up dots follow the pointer ---------- */
  const hero = $(".hero");
  if (finePointer && !reduceMotion) {
    let frame = null;
    hero.addEventListener("pointermove", (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--x", (e.clientX - r.left).toFixed(0) + "px");
        hero.style.setProperty("--y", (e.clientY - r.top).toFixed(0) + "px");
        frame = null;
      });
    });
  }

  /* ---------- hero: segmented control swaps the skill card ---------- */
  const focusData = {
    python:  { name: "Python", level: 80, note: "Python programming, frameworks and basic machine learning.", where: "Internship at Reliuation Odoo Software Developers" },
    flutter: { name: "Android with Flutter", level: 40, note: "Android apps built with Flutter, like my calculator app.", where: "Internship at Gadgetspidy" },
    docs:    { name: "Technical documentation", level: 60, note: "Clear write-ups, reports and project documents.", where: "Reports and project documents" },
    pm:      { name: "Project management", level: 40, note: "Planning tasks and keeping work on schedule.", where: "Planning tasks for my own projects" },
    web:     { name: "HTML, CSS and JavaScript", level: null, note: "Layouts, forms and DOM events. I am learning these right now.", where: "This website" },
  };

  const tabs = $$(".seg");
  const segmented = $(".segmented");
  const focus = $("#focus");
  const focusName = $("#focusName");
  const focusLevel = $("#focusLevel");
  const focusTrack = $("#focusTrack");
  const focusBar = $("#focusBar");
  const focusNote = $("#focusNote");
  const focusWhere = $("#focusWhere");
  let swapTimer;

  function selectTab(tab, moveFocus) {
    const data = focusData[tab.dataset.skill];
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (moveFocus) tab.focus();
    segmented.style.setProperty("--i", tabs.indexOf(tab));

    focus.classList.add("is-swapping");
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      focusName.textContent = data.name;
      focusNote.textContent = data.note;
      focusWhere.textContent = data.where;
      if (data.level === null) {
        focusLevel.textContent = "Learning";
        focusTrack.classList.add("is-learning");
      } else {
        focusLevel.textContent = data.level + "%";
        focusTrack.classList.remove("is-learning");
        focusBar.style.setProperty("--v", data.level + "%");
      }
      focus.classList.remove("is-swapping");
    }, reduceMotion ? 0 : 200);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        selectTab(next, true);
      }
    });
  });

  /* ---------- CGPA count-up ---------- */
  const cgpa = $(".cgpa-num");
  const cgpaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        cgpaObserver.disconnect();
        const target = parseFloat(cgpa.dataset.count);
        if (reduceMotion) {
          cgpa.textContent = target.toFixed(2);
          return;
        }
        const start = performance.now();
        const duration = 1600;
        (function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 4);
          cgpa.textContent = (target * eased).toFixed(2);
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    },
    { threshold: 0.6 }
  );
  cgpaObserver.observe(cgpa);

  /* ---------- journey: timeline line fills as you scroll ---------- */
  const tracks = $$("[data-track]");
  function updateTracks() {
    const mark = window.innerHeight * 0.62;
    tracks.forEach((track) => {
      const line = $(".track-line", track);
      const r = line.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      line.style.setProperty("--p", p.toFixed(3));
      $$(".event", track).forEach((ev) => {
        ev.classList.toggle("is-lit", ev.getBoundingClientRect().top + 12 < mark);
      });
    });
  }
  let trackFrame = null;
  window.addEventListener(
    "scroll",
    () => {
      if (trackFrame) return;
      trackFrame = requestAnimationFrame(() => {
        updateTracks();
        trackFrame = null;
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", updateTracks);
  updateTracks();

  /* ---------- skills: meters fill when they come into view ---------- */
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  $$(".skill").forEach((s) => skillObserver.observe(s));

  /* ---------- projects: filter ---------- */
  const chips = $$(".filter");
  const cards = $$(".card");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", String(on));
      });
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        if (show && card.hidden) {
          card.hidden = false;
          card.classList.add("is-hiding");
          requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove("is-hiding")));
        } else if (!show && !card.hidden) {
          card.classList.add("is-hiding");
          setTimeout(() => {
            if (card.classList.contains("is-hiding")) card.hidden = true;
          }, reduceMotion ? 0 : 300);
        }
      });
    });
  });

  /* ---------- projects: spotlight follows the pointer ---------- */
  if (finePointer) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  /* ---------- calculator (no eval) ---------- */
  const screen = $("#calcScreen");
  const calc = { current: "0", stored: null, op: null, fresh: false };

  function compute(a, b, op) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? NaN : a / b;
      default: return b;
    }
  }
  function show(value) {
    if (typeof value === "number") {
      if (!isFinite(value)) { screen.textContent = "Can't divide by 0"; return; }
      value = String(parseFloat(value.toPrecision(10)));
    }
    screen.textContent = value;
  }

  $("#calcKeys").addEventListener("click", (e) => {
    const key = e.target.closest("button");
    if (!key) return;

    if (key.dataset.fn === "clear") {
      Object.assign(calc, { current: "0", stored: null, op: null, fresh: false });
      show("0");
      return;
    }

    if (key.dataset.op) {
      const value = parseFloat(calc.current);
      if (calc.stored !== null && calc.op && !calc.fresh) {
        calc.stored = compute(calc.stored, value, calc.op);
        show(calc.stored);
      } else if (calc.stored === null) {
        calc.stored = value;
      }
      calc.op = key.dataset.op;
      calc.fresh = true;
      return;
    }

    if (key.dataset.fn === "equals") {
      if (calc.op === null || calc.stored === null) return;
      const result = compute(calc.stored, parseFloat(calc.current), calc.op);
      show(result);
      calc.current = isFinite(result) ? String(parseFloat(result.toPrecision(10))) : "0";
      calc.stored = null;
      calc.op = null;
      calc.fresh = true;
      return;
    }

    // digit
    const digit = key.textContent.trim();
    if (calc.fresh || calc.current === "0") {
      calc.current = digit;
      calc.fresh = false;
    } else if (calc.current.length < 12) {
      calc.current += digit;
    }
    show(calc.current);
  });

  /* ---------- JavaScript events playground ---------- */
  const pgHeading = $("#pgHeading");
  const swatches = ["#F5ECE6", "#B7CF9B", "#DEA8A8", "#C8A76D", "#E07A8E"];
  let swatchIndex = 0;
  $("#pgBtn").addEventListener("click", () => {
    swatchIndex = (swatchIndex + 1) % swatches.length;
    pgHeading.style.color = swatches[swatchIndex];
  });
  const pgMirror = $("#pgMirror");
  $("#pgInput").addEventListener("input", (e) => {
    pgMirror.textContent = e.target.value || " ";
  });

  /* ---------- copy email ---------- */
  const copyBtn = $("#copyEmail");
  const copyHint = $("#copyHint");
  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      const temp = document.createElement("textarea");
      temp.value = email;
      temp.setAttribute("readonly", "");
      temp.style.position = "absolute";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
    copyHint.textContent = "Copied";
    showToast("Email address copied");
    setTimeout(() => (copyHint.textContent = "Copy"), 2000);
  });

  /* ---------- contact form ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  const rules = {
    name: (v) => (v.trim().length < 2 ? "Enter your name." : ""),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter an email address like name@example.com."),
    message: (v) => (v.trim().length < 10 ? "Write a message of at least 10 characters." : ""),
  };

  function check(input) {
    const message = rules[input.name](input.value);
    const field = input.closest(".field");
    field.classList.toggle("has-error", Boolean(message));
    $(".err", field).textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  }

  $$("input, textarea", form).forEach((input) => {
    input.addEventListener("blur", () => { if (input.value) check(input); });
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) check(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = $$("input, textarea", form);
    const results = inputs.map(check);
    const firstBad = inputs[results.indexOf(false)];
    if (firstBad) {
      firstBad.focus();
      status.textContent = "";
      return;
    }
    const data = new FormData(form);
    const subject = encodeURIComponent("Portfolio message from " + data.get("name"));
    const body = encodeURIComponent(data.get("message") + "\n\n— " + data.get("name") + " (" + data.get("email") + ")");
    window.location.href = "mailto:kkrishasavaliya@gmail.com?subject=" + subject + "&body=" + body;
    status.textContent = "Your email app is opening with this message. Press send there to deliver it.";
    form.reset();
  });
})();
