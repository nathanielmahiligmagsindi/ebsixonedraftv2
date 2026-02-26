// Mobile nav
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Smooth active link highlighting (simple)
const links = Array.from(document.querySelectorAll(".nav-links a"));
links.forEach((a) => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
    links.forEach((l) => l.classList.remove("active"));
    a.classList.add("active");
  });
});

// Hero video controls (buttons may not exist; optional chaining keeps it safe)
const video = document.getElementById("heroVideo");
const toggleBtn = document.getElementById("videoToggle");
const muteBtn = document.getElementById("videoMute");

async function tryAutoplay() {
  if (!video) return;
  try {
    video.muted = true;
    await video.play();
    if (toggleBtn) toggleBtn.textContent = "Pause";
    if (muteBtn) muteBtn.textContent = "Unmute";
  } catch {
    if (toggleBtn) toggleBtn.textContent = "Play";
    if (muteBtn) muteBtn.textContent = video.muted ? "Unmute" : "Mute";
  }
}

toggleBtn?.addEventListener("click", async () => {
  if (!video) return;
  if (video.paused) {
    try {
      await video.play();
      toggleBtn.textContent = "Pause";
    } catch {}
  } else {
    video.pause();
    toggleBtn.textContent = "Play";
  }
});

muteBtn?.addEventListener("click", () => {
  if (!video) return;
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? "Unmute" : "Mute";
});

// Intro overlay
const introOverlay = document.getElementById("introOverlay");
const introVideo = document.getElementById("introVideo");
const brandMark = document.querySelector(".brand-mark");
const brandLogo = document.getElementById("brandLogo");

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

function lockScroll(locked) {
  document.body.classList.toggle("is-locked", Boolean(locked));
}

function showNavbarLogo() {
  if (!brandLogo) return;
  brandLogo.classList.add("is-visible");
}

async function startHero() {
  if (!video) return;
  video.loop = true;
  video.muted = true;
  await tryAutoplay();
}

function createMorphLogoAtCenter() {
  const el = document.createElement("div");
  el.className = "intro-morph-logo";
  el.setAttribute("aria-hidden", "true");

  // Start centered (adjust size in CSS: .intro-morph-logo)
  const size = 120;
  el.style.left = `${(window.innerWidth - size) / 2}px`;
  el.style.top = `${(window.innerHeight - size) / 2}px`;

  const img = document.createElement("img");
  img.src = "assets/image/logo.png";
  img.alt = "";
  el.appendChild(img);

  document.body.appendChild(el);
  return el;
}

function computeTransformToTarget(fromEl, toEl) {
  const from = fromEl.getBoundingClientRect();
  const to = toEl.getBoundingClientRect();

  const dx = to.left - from.left;
  const dy = to.top - from.top;

  const scaleX = to.width / from.width;
  const scaleY = to.height / from.height;

  return { dx, dy, scaleX, scaleY };
}

let introEnding = false;

function endIntro() {
  if (introEnding) return;
  introEnding = true;

  // Start hero loop behind (so it’s already playing when overlay fades)
  startHero();

  if (!introOverlay || !introVideo || !brandMark) {
    showNavbarLogo();
    lockScroll(false);
    return;
  }

  // Reduced motion: just fade intro and show navbar logo
  if (prefersReducedMotion) {
    showNavbarLogo();
    lockScroll(false);
    introOverlay.classList.add("is-dimming");
    window.setTimeout(() => introOverlay.remove(), 500);
    return;
  }

  // Fade away the intro background (no black hard cut)
  introOverlay.classList.add("is-dimming");
  introOverlay.setAttribute("aria-hidden", "true");

  // Create morphing logo (your real designed logo.png)
  const morph = createMorphLogoAtCenter();

  // Move it into navbar logo
  const t = computeTransformToTarget(morph, brandMark);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      morph.style.transform = `translate(${t.dx}px, ${t.dy}px) scale(${t.scaleX}, ${t.scaleY})`;
    });
  });

  morph.addEventListener(
    "transitionend",
    () => {
      showNavbarLogo();
      morph.style.opacity = "0";

      window.setTimeout(() => {
        morph.remove();
        introOverlay.remove();
        lockScroll(false);
      }, 380);
    },
    { once: true }
  );
}

function initIntro() {
  if (!introOverlay || !introVideo) {
    tryAutoplay();
    return;
  }

  lockScroll(true);

  introVideo.muted = true;
  introVideo.playsInline = true;

  introVideo.addEventListener("ended", endIntro, { once: true });
}

initIntro();