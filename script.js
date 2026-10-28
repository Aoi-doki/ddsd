// Doki Doki Second Draft website (index.html + install.html): menu, smart download button, latest release info,
// trailer tabs, chibi hops, screenshot carousel + lightbox, install tabs, fade-ins. No trackers, no cookies.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const REPO = "Aoi-doki/ddsd-releases";
const DL = (file) => `https://github.com/${REPO}/releases/latest/download/${file}`;
const isAndroid = /Android/i.test(navigator.userAgent);
const isApple = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isMac = /Macintosh/i.test(navigator.userAgent) && !isApple;
const isLinux = /Linux/i.test(navigator.userAgent) && !isAndroid;

// ------------------------------------------------------------ phone menu
const toggle = $(".nav-toggle");
const links = $(".nav-links");
if (toggle) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", (e) => { if (e.target.tagName === "A") links.classList.remove("open"); });
}

// ------------------------------------------------------------ smart download button (home hero)
const dlMain = $("#dl-main");
if (dlMain) {
  const sub = $("#dl-main-sub");
  if (isAndroid) { dlMain.href = "install.html#android"; sub.textContent = "for Android · step-by-step guide"; }
  else if (isApple) { dlMain.href = "install.html#faq"; sub.textContent = "Windows, Android, Mac & Linux"; }
  else if (isMac || isLinux) { dlMain.href = "install.html#manual"; sub.textContent = isMac ? "for Mac" : "for Linux"; }
  else { dlMain.href = "install.html#windows"; sub.textContent = "for Windows · installer"; }
}

// ------------------------------------------------------------ latest release (version + file sizes from GitHub)
const mb = (n) => (n / 1048576 >= 10 ? Math.round(n / 1048576) : (n / 1048576).toFixed(1)) + " MB";
async function latestRelease() {
  try {
    const cached = sessionStorage.getItem("ddsd-release");
    if (cached) return JSON.parse(cached);
  } catch (e) { /* private mode */ }
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } });
  if (!r.ok) throw new Error(r.status);
  const j = await r.json();
  const rel = { tag: j.tag_name, name: j.name, date: j.published_at, assets: {} };
  (j.assets || []).forEach((a) => (rel.assets[a.name] = a.size));
  try { sessionStorage.setItem("ddsd-release", JSON.stringify(rel)); } catch (e) { /* ignore */ }
  return rel;
}
latestRelease().then((rel) => {
  const ver = (rel.tag || "").replace(/^v/, "");
  const when = rel.date ? new Date(rel.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
  const line = $("#rel-line");
  if (line && ver) line.innerHTML = `Latest version: <b>${ver}</b>${when ? ", " + when : ""}.`;
  $$("[data-meta]").forEach((el) => {
    const size = rel.assets[el.dataset.meta];
    if (size) el.textContent = `${mb(size)} · version ${ver}`;
  });
  $$("[data-file]").forEach((a) => (a.href = DL(a.dataset.file)));
}).catch(() => { /* offline or rate-limited: the static links still work */ });

// ------------------------------------------------------------ trailer tabs (YouTube only loads on click)
const video = $("#video");
if (video) {
  const note = $("#video-note");
  const VIDEOS = {
    release: { poster: "assets/release_poster.jpg", note: "Demo 2 is out now: Acts 1 to 6, free, on Windows and Android.",
               play: () => `<video src="assets/release_trailer.mp4" poster="assets/release_poster.jpg" controls autoplay playsinline></video>` },
    trailer: { poster: "assets/banner.jpg", note: "The trailer plays from YouTube once you click it.",
               play: () => `<iframe src="https://www.youtube-nocookie.com/embed/SDU9rJVWbdg?autoplay=1&rel=0" title="Doki Doki Second Draft trailer" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>` },
    teaser: { poster: "assets/teaser_poster.jpg", note: "The Demo 2 teaser. Work in progress: everything is subject to change.",
              play: () => `<video src="assets/teaser.mp4" poster="assets/teaser_poster.jpg" controls autoplay playsinline></video>` },
  };
  const setVideo = (key) => {
    const v = VIDEOS[key];
    video.innerHTML = `<img src="${v.poster}" alt=""><button class="play" aria-label="Play"><span><svg viewBox="0 0 24 24"><path d="M6 4v16l14-8z"/></svg></span></button>`;
    note.textContent = v.note;
    $(".play", video).addEventListener("click", () => (video.innerHTML = v.play()), { once: true });
    $$(".video-tabs .tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.video === key));
  };
  $$(".video-tabs .tab").forEach((t) => t.addEventListener("click", () => setVideo(t.dataset.video)));
  setVideo("release");
}

// ------------------------------------------------------------ chibis hop (and switch to their jump sprite)
$$(".chibis button").forEach((b) => {
  const img = $("img", b);
  const idle = img.src;
  b.addEventListener("click", () => {
    img.src = img.dataset.hop;
    img.classList.remove("hopping");
    void img.offsetWidth;
    img.classList.add("hopping");
    setTimeout(() => { img.src = idle; img.classList.remove("hopping"); }, 520);
  });
});

// ------------------------------------------------------------ screenshot carousel + lightbox
const track = $(".track");
if (track) {
  const step = () => track.clientWidth * 0.8;
  $(".car-prev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  $(".car-next").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
}
const shots = $$(".shot button");
const box = $("#lightbox");
if (box && shots.length) {
  const boxImg = $("img", box), boxCap = $("figcaption", box);
  let current = 0;
  const show = (i) => {
    current = (i + shots.length) % shots.length;
    boxImg.src = shots[current].dataset.full;
    boxImg.alt = $("img", shots[current]).alt;
    boxCap.textContent = shots[current].parentElement.querySelector("figcaption").textContent;
    box.hidden = false;
    $(".lb-close", box).focus();
  };
  shots.forEach((b, i) => b.addEventListener("click", () => show(i)));
  $(".lb-close", box).addEventListener("click", () => (box.hidden = true));
  $(".lb-prev", box).addEventListener("click", () => show(current - 1));
  $(".lb-next", box).addEventListener("click", () => show(current + 1));
  box.addEventListener("click", (e) => { if (e.target === box) box.hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") box.hidden = true;
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

// ------------------------------------------------------------ install page: platform tabs (#windows / #android / #manual)
const ptabs = $$(".platform-tabs .tab");
if (ptabs.length) {
  const choose = (id, scroll) => {
    ptabs.forEach((t) => t.setAttribute("aria-selected", t.getAttribute("aria-controls") === id));
    $$(".panel").forEach((p) => (p.hidden = p.id !== id));
    $$(".panel:not([hidden]) .reveal").forEach((el) => el.classList.add("shown"));
    if (scroll) $(".platform-tabs").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  ptabs.forEach((t) => t.addEventListener("click", () => {
    const id = t.getAttribute("aria-controls");
    history.replaceState(null, "", "#" + id);
    choose(id, false);
  }));
  const fromHash = () => {
    const h = location.hash.slice(1);
    if (["windows", "android", "manual"].includes(h)) { choose(h, true); return true; }
    return false;
  };
  window.addEventListener("hashchange", fromHash);
  if (!fromHash()) choose(isAndroid ? "android" : (isMac || isLinux) ? "manual" : "windows", false);
}

// ------------------------------------------------------------ fade in as you scroll
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("shown"); io.unobserve(en.target); } });
  }, { threshold: 0.1 });
  $$(".reveal").forEach((el) => io.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("shown"));
}
