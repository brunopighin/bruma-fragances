/* ============================================================
   Luxe Parfums — script.js
   ============================================================ */

/* ── CONFIGURACIÓN ─────────────────────────────────────────
   Editá estos valores con los datos reales del negocio.
   ──────────────────────────────────────────────────────── */
const CONFIG = {
  whatsapp: {
    numero:          "5491100000000",
    mensajeGeneral:  "Hola! Me comunico desde la web de Luxe Parfums. Quería consultar sobre sus fragancias.",
    mensajeCarrito:  "Hola! Quiero hacer el siguiente pedido:",
    mensajeCategoria: (cat) => `Hola! Quiero consultar por la categoría *${cat}* de fragancias.`,
  },
  email:     "info@luxeparfums.com.ar",
  direccion: "Argentina",
  redes: {
    instagram: "https://www.instagram.com/luxeparfums",
    tiktok:    "https://www.tiktok.com/@luxeparfums",
  },
};

/* ── PRODUCTOS DEMO ────────────────────────────────────────
   Se muestran por defecto hasta que el admin cargue productos.
   ──────────────────────────────────────────────────────── */
const DEMO_PRODUCTOS = [
  {
    id: "demo_1",
    nombre: "Sauvage",
    marca: "Dior",
    categoria: "masculinos",
    categoriaNombre: "Masculinos",
    descripcion: "Fresco, mineral y salvaje. Bergamota de Calabria con base de ámbar y madera.",
    precio: 85000,
    stock: 12,
    badge: "Best Seller",
    imagen: null
  },
  {
    id: "demo_2",
    nombre: "Bleu de Chanel",
    marca: "Chanel",
    categoria: "masculinos",
    categoriaNombre: "Masculinos",
    descripcion: "Elegante y audaz. Notas cítricas de naranja con cedro y madera de sándalo.",
    precio: 95000,
    stock: 8,
    badge: "Importado",
    imagen: null
  },
  {
    id: "demo_3",
    nombre: "One Million",
    marca: "Paco Rabanne",
    categoria: "masculinos",
    categoriaNombre: "Masculinos",
    descripcion: "Seductor y poderoso. Cuero, canela y pomelo rosa en perfecta armonía.",
    precio: 72000,
    stock: 20,
    badge: null,
    imagen: null
  },
  {
    id: "demo_4",
    nombre: "Good Girl",
    marca: "Carolina Herrera",
    categoria: "femeninos",
    categoriaNombre: "Femeninos",
    descripcion: "Sensual y sofisticada. Notas de jazmín, rosa y tonka bean sobre cacao.",
    precio: 78000,
    stock: 15,
    badge: "Nuevo",
    imagen: null
  },
  {
    id: "demo_5",
    nombre: "Libre",
    marca: "YSL",
    categoria: "femeninos",
    categoriaNombre: "Femeninos",
    descripcion: "Audaz y libre. Flor de naranja tunecina con lavanda de Provenza.",
    precio: 90000,
    stock: 10,
    badge: "Best Seller",
    imagen: null
  },
  {
    id: "demo_6",
    nombre: "Baccarat Rouge 540",
    marca: "Maison Francis Kurkdjian",
    categoria: "nicho",
    categoriaNombre: "Nicho",
    descripcion: "Opulento y único. Azafrán, cedro de Júniper y ambroxan de larga duración.",
    precio: 350000,
    stock: 3,
    badge: "Exclusivo",
    imagen: null
  },
  {
    id: "demo_7",
    nombre: "Acqua di Giò",
    marca: "Giorgio Armani",
    categoria: "masculinos",
    categoriaNombre: "Masculinos",
    descripcion: "Marino y fresco. Bergamota, jazmín marino y patchouli con base de ámbar.",
    precio: 65000,
    stock: 25,
    badge: null,
    imagen: null
  },
  {
    id: "demo_8",
    nombre: "La Vie Est Belle",
    marca: "Lancôme",
    categoria: "femeninos",
    categoriaNombre: "Femeninos",
    descripcion: "Dulce y floral. Iris, patchouli y pralinado con vainilla bourbon.",
    precio: 82000,
    stock: 18,
    badge: "Importado",
    imagen: null
  },
  {
    id: "demo_9",
    nombre: "Oud Wood",
    marca: "Tom Ford",
    categoria: "unisex",
    categoriaNombre: "Unisex",
    descripcion: "Exótico e íntimo. Madera de oud, sándalo de Tailandia y ámbar gris.",
    precio: 280000,
    stock: 5,
    badge: "Nicho",
    imagen: null
  },
  {
    id: "demo_10",
    nombre: "Black Orchid",
    marca: "Tom Ford",
    categoria: "unisex",
    categoriaNombre: "Unisex",
    descripcion: "Oscuro y lujoso. Orquídea negra, trufa y patchouli en una mezcla irresistible.",
    precio: 260000,
    stock: 6,
    badge: null,
    imagen: null
  },
  {
    id: "demo_11",
    nombre: "Arabian Nights",
    marca: "Al Haramain",
    categoria: "arabe",
    categoriaNombre: "Árabe",
    descripcion: "Oriental e intenso. Oud, rosa de Taif y sándalo blanco de Mysore.",
    precio: 55000,
    stock: 30,
    badge: null,
    imagen: null
  },
  {
    id: "demo_12",
    nombre: "Set Viaje Chanel",
    marca: "Chanel",
    categoria: "sets",
    categoriaNombre: "Sets y Regalos",
    descripcion: "Set de tres miniaturas: N°5, Coco Mademoiselle y Chance Eau Tendre.",
    precio: 120000,
    stock: 7,
    badge: "Ideal regalo",
    imagen: null
  },
];

/* ── Storage key ───────────────────────────────────────────── */
const STORAGE_KEY = "luxe_parfums_admin";

/* ── Helper: link de WhatsApp ──────────────────────────────── */
function waLink(msg) {
  return `https://wa.me/${CONFIG.whatsapp.numero}?text=${encodeURIComponent(msg)}`;
}

/* ── Inicialización ────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
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

/* ── Links de contacto dinámicos ─────────────────────────── */
function initLinks() {
  const wa = waLink(CONFIG.whatsapp.mensajeGeneral);

  // WhatsApp flotante + info
  setHref("infoWhatsapp", wa);
  setHref("whatsappFloat", wa);

  // Email
  const infoEmail = document.getElementById("infoEmail");
  if (infoEmail) infoEmail.href = `mailto:${CONFIG.email}`;
  setText("displayEmail", CONFIG.email);
  setText("footerEmail", CONFIG.email);

  // Número WA
  setText("displayWhatsapp", `+${CONFIG.whatsapp.numero}`);
  setText("footerWhatsapp", `+${CONFIG.whatsapp.numero}`);

  // Dirección
  setText("displayDireccion", CONFIG.direccion);

  // Redes
  setHref("linkInstagram", CONFIG.redes.instagram);
  setHref("linkTiktok", CONFIG.redes.tiktok);
  setHref("footerInstagram", CONFIG.redes.instagram);
  setHref("footerTiktok", CONFIG.redes.tiktok);
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
      id:       "c_" + Date.now(),
      fecha:    new Date().toISOString(),
      nombre:   document.getElementById("nombre")?.value.trim(),
      email:    document.getElementById("email")?.value.trim(),
      telefono: document.getElementById("telefono")?.value.trim() || "",
      mensaje:  document.getElementById("mensaje")?.value.trim(),
      leida:    false,
    };
    const consultas = JSON.parse(localStorage.getItem("luxe_parfums_consultas") || "[]");
    consultas.unshift(consulta);
    localStorage.setItem("luxe_parfums_consultas", JSON.stringify(consultas));

    if (form.action && form.action !== window.location.href) {
      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then((res) => { if (res.ok) showFormSuccess(form, btn); else showFormError(btn); })
        .catch(() => showFormError(btn));
    } else {
      setTimeout(() => showFormSuccess(form, btn), 800);
    }
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

/* ── Obtener productos (admin) ───────────────────────────── */
function getProductos() {
  try {
    const cfg = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (cfg && cfg.productos) return cfg.productos;
  } catch(e) {}
  return [];
}
