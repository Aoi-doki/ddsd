// Doki Doki Second Draft website: menu toggle, trailer, chibi hops, gallery lightbox, fade-ins.

// Phone menu
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => {
  if (e.target.tagName === "A") links.classList.remove("open");
});

// Trailer: YouTube only loads when you click (no tracking until then)
const video = document.getElementById("video");
function playTrailer() {
  video.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/SDU9rJVWbdg?autoplay=1&rel=0" ' +
    'title="Doki Doki Second Draft trailer" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  video.removeAttribute("role");
}
video.addEventListener("click", playTrailer, { once: true });
video.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playTrailer(); }
});

// Chibis hop (and switch to their jump sprite, like the poem game) when clicked
document.querySelectorAll(".chibis img").forEach((img) => {
  const idle = img.src;
  img.addEventListener("click", () => {
    img.src = img.dataset.hop;
    img.classList.remove("hopping");
    void img.offsetWidth;
    img.classList.add("hopping");
    setTimeout(() => { img.src = idle; img.classList.remove("hopping"); }, 520);
  });
});

// Gallery lightbox
const items = [...document.querySelectorAll(".gallery button")];
const box = document.getElementById("lightbox");
const boxImg = box.querySelector("img");
const boxCap = box.querySelector("figcaption");
let current = 0;
function show(i) {
  current = (i + items.length) % items.length;
  boxImg.src = items[current].dataset.full;
  boxImg.alt = items[current].querySelector("img").alt;
  boxCap.textContent = items[current].dataset.cap;
  box.hidden = false;
}
items.forEach((b, i) => b.addEventListener("click", () => show(i)));
box.querySelector(".lb-close").addEventListener("click", () => (box.hidden = true));
box.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
box.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
box.addEventListener("click", (e) => { if (e.target === box) box.hidden = true; });
document.addEventListener("keydown", (e) => {
  if (box.hidden) return;
  if (e.key === "Escape") box.hidden = true;
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});

// Sections fade in as you scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("shown"); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".section, .girl, .feature, .act").forEach((el) => {
  el.classList.add("reveal");
  io.observe(el);
});
