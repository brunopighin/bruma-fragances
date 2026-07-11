/* ============================================================
   Luxe Parfums — script.js
   ============================================================ */

/* ── Al recargar la página, volver siempre al inicio ───────
   Evita que el navegador restaure la posición de scroll previa. */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

/* ── CONFIGURACIÓN ─────────────────────────────────────────
   Editá estos valores con los datos reales del negocio.
   ──────────────────────────────────────────────────────── */
const CONFIG = {
  whatsapp: {
    numero:          "5492323549320",
    mensajeGeneral:  "Hola, quisiera saber más información sobre un perfume.",
    mensajeCarrito:  "Hola! Quiero hacer el siguiente pedido:",
    mensajeCategoria: (cat) => `Hola! Quiero consultar por la categoría *${cat}* de fragancias.`,
  },
  direccion: "Argentina",
  redes: {
    instagram: "https://www.instagram.com/bruma_fragances/",
  },
};

/* ── Helper: link de WhatsApp ──────────────────────────────── */
function waLink(msg) {
  return `https://wa.me/${CONFIG.whatsapp.numero}?text=${encodeURIComponent(msg)}`;
}

/* ── Inicialización ────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initLinks();
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initWhatsappFloat();
  initCategoryCards();
  initContactForm();
  initSmoothScroll();
  initActiveNav();
  initFaq();
});

/* ── Preloader (niebla dorada) ───────────────────────────── */
function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  document.body.style.overflow = "hidden";

  let hidden = false;
  const hide = () => {
    if (hidden) return;
    hidden = true;
    preloader.classList.add("is-hidden");
    document.body.style.overflow = "";
    setTimeout(() => preloader.remove(), 1050);
  };

  window.addEventListener("load", () => setTimeout(hide, 1500));
  setTimeout(hide, 4000); // fallback por si "load" tarda demasiado
}

/* ── Links de contacto dinámicos ─────────────────────────── */
async function initLinks() {
  // Si el panel admin configuró estos datos en el servidor, pisan los
  // valores por defecto de arriba. Si falla (por ejemplo al abrir el
  // HTML suelto sin backend), se usan los valores hardcodeados.
  try {
    const res = await fetch("api/settings.php");
    if (res.ok) {
      const s = await res.json();
      if (s.whatsapp)  CONFIG.whatsapp.numero    = s.whatsapp;
      if (s.direccion) CONFIG.direccion          = s.direccion;
      if (s.instagram) CONFIG.redes.instagram    = s.instagram;
    }
  } catch (e) { /* se queda con los valores por defecto */ }

  const wa = waLink(CONFIG.whatsapp.mensajeGeneral);

  // WhatsApp flotante + info
  setHref("infoWhatsapp", wa);
  setHref("whatsappFloat", wa);

  // Número WA
  setText("displayWhatsapp", `+${CONFIG.whatsapp.numero}`);
  setText("footerWhatsapp", `+${CONFIG.whatsapp.numero}`);

  // Dirección
  setText("displayDireccion", CONFIG.direccion);

  // Redes
  setHref("linkInstagram", CONFIG.redes.instagram);
  setHref("footerInstagram", CONFIG.redes.instagram);
}

function setHref(id, href) {
  const el = document.getElementById(id);
  if (el) el.href = href;
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* ── Header scroll ──────────────────────────────────────── */
function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;
  const update = () => header.classList.toggle("scrolled", window.scrollY > 50);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ── Menú mobile ────────────────────────────────────────── */
function initMobileMenu() {
  const btn  = document.getElementById("hamburger");
  const menu = document.getElementById("navMenu");
  if (!btn || !menu) return;

  const toggle = (open) => {
    btn.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  btn.addEventListener("click", () => toggle(!menu.classList.contains("open")));
  menu.querySelectorAll(".nav-link").forEach(l => l.addEventListener("click", () => toggle(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });
}

/* ── Animaciones al scroll ──────────────────────────────── */
function initScrollAnimations() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: "0px 0px -40px 0px" }
  );
  els.forEach((el) => observer.observe(el));
}

/* ── WhatsApp flotante ──────────────────────────────────── */
function initWhatsappFloat() {
  const btn = document.getElementById("whatsappFloat");
  if (!btn) return;
  const update = () => btn.classList.toggle("visible", window.scrollY > 350);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ── Cards de categorías ────────────────────────────────── */
function initCategoryCards() {
  document.querySelectorAll(".cat-card[data-cat]").forEach((card) => {
    const cat = card.dataset.cat;
    const catNombre = card.querySelector("h3")?.textContent || cat;

    const goToCatalog = () => {
      const sec = document.getElementById("productos");
      if (sec) {
        const header = document.getElementById("header");
        const top = sec.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 80);
        window.scrollTo({ top, behavior: "smooth" });
        // Activar filtro de esa categoría después de navegar
        setTimeout(() => {
          const btn = document.querySelector(`.filtro-btn[data-cat="${cat}"]`);
          if (btn) btn.click();
        }, 600);
      }
    };

    card.addEventListener("click", goToCatalog);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goToCatalog(); }
    });
  });
}

/* ── Formulario de contacto ─────────────────────────────── */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    const consulta = {
      nombre:   document.getElementById("nombre")?.value.trim(),
      email:    document.getElementById("email")?.value.trim(),
      telefono: document.getElementById("telefono")?.value.trim() || "",
      mensaje:  document.getElementById("mensaje")?.value.trim(),
    };

    fetch("api/consultas.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consulta),
    })
      .then((res) => { if (res.ok) showFormSuccess(form, btn); else showFormError(btn); })
      .catch(() => showFormError(btn));
  });

  // Limpiar errores al escribir
  form.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", () => {
      el.classList.remove("error");
      const err = el.nextElementSibling;
      if (err && err.classList.contains("form-error")) err.textContent = "";
    });
  });
}

function validateForm(form) {
  let ok = true;
  const fields = [
    { id: "nombre",  msg: "Ingresá tu nombre." },
    { id: "email",   msg: "Ingresá un email válido.", regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { id: "mensaje", msg: "Escribí tu mensaje." },
  ];
  fields.forEach(({ id, msg, regex }) => {
    const input = document.getElementById(id);
    const error = input?.nextElementSibling;
    const valid = input?.value.trim() && (!regex || regex.test(input.value.trim()));
    input?.classList.toggle("error", !valid);
    if (error && error.classList.contains("form-error")) error.textContent = valid ? "" : msg;
    if (!valid) ok = false;
  });
  return ok;
}

function showFormSuccess(form, btn) {
  form.reset();
  btn.disabled = false;
  btn.textContent = "Enviar mensaje";
  const msg = document.getElementById("formSuccess");
  if (msg) { msg.hidden = false; setTimeout(() => { msg.hidden = true; }, 6000); }
}
function showFormError(btn) {
  btn.disabled = false;
  btn.textContent = "Enviar mensaje";
  alert("Hubo un error al enviar el mensaje. Por favor contactanos por WhatsApp.");
}

/* ── Smooth scroll ──────────────────────────────────────── */
function initSmoothScroll() {
  const header = document.getElementById("header");
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* ── Active nav link en scroll ──────────────────────────── */
function initActiveNav() {
  const sectionIds = ["inicio", "destacados", "categorias", "productos", "nosotros", "testimonios", "faq", "contacto"];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const links    = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    const y = window.scrollY + 140;
    let current = sections[0]?.id || "";
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    links.forEach(l => {
      const href = l.getAttribute("href").replace("#", "");
      l.classList.toggle("active", href === current);
    });
  }, { passive: true });
}

/* ── Badge del carrito en el nav ────────────────────────── */
function updateNavBadge(count) {
  const badge = document.getElementById("navCartBadge");
  if (!badge) return;
  badge.textContent = count;
  badge.classList.toggle("show", count > 0);
  // Botón en nav también abre el carrito
  const btn = document.getElementById("navCartBtn");
  if (btn && !btn._cartInited) {
    btn._cartInited = true;
    btn.addEventListener("click", () => { if (typeof openCart === "function") openCart(); });
  }
}

/* ── FAQ (nativo <details>) ─────────────────────────────── */
function initFaq() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        items.forEach(other => { if (other !== item) other.removeAttribute("open"); });
      }
    });
  });
}

/* ── Obtener productos (backend) ─────────────────────────── */
async function getProductos() {
  try {
    const res = await fetch("api/productos.php");
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}
