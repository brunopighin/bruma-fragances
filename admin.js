/* ============================================================
   Luxe Parfums — admin.js
   ============================================================ */

const STORAGE_KEY    = "luxe_parfums_admin";
const DEFAULT_PW_KEY = "luxe_parfums_pw";

/* ── Password ──────────────────────────────────────────────── */
function getAdminPassword() {
  return localStorage.getItem(DEFAULT_PW_KEY) || "Admin123";
}

/* ── Config en memoria ────────────────────────────────────── */
let config = {};
try { config = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { config = {}; }
if (!config.productos) config.productos = [];

/* ── Importar fotos de productos desde la carpeta /img ───────
   Fotos ya subidas a /img se cargan una sola vez como productos
   en borrador, para completar nombre/precio/descripción después. */
const IMG_PRODUCT_FILES = [
  "Afnan9PMRebelEaudeParfumUnisex100ml-removebg-preview.png",
  "IMG_3473.PNG", "IMG_3474.PNG", "IMG_3475.PNG", "IMG_3476.PNG", "IMG_3477.PNG",
  "IMG_3478.PNG", "IMG_3479.PNG", "IMG_3480.PNG", "IMG_3481.PNG", "IMG_3482.PNG",
  "IMG_3483.PNG", "IMG_3484.PNG", "IMG_3485.PNG", "IMG_3486.PNG", "IMG_3487.PNG",
  "IMG_3488.PNG", "IMG_3489.PNG", "IMG_3490.PNG", "IMG_3491.PNG", "IMG_3492.PNG",
  "IMG_3493.PNG", "IMG_3494.PNG", "IMG_3495.PNG", "IMG_3496.PNG", "IMG_3497.PNG",
  "IMG_3498.PNG", "IMG_3500.PNG", "IMG_3501.PNG", "IMG_3502.PNG", "IMG_3503.PNG",
  "IMG_3504.PNG", "IMG_3505.PNG", "IMG_3506.PNG", "IMG_3507.PNG", "IMG_3508.PNG",
  "IMG_3509.PNG", "IMG_3510.PNG", "IMG_3511.PNG", "IMG_3512.PNG", "IMG_3514.PNG",
  "IMG_3515.PNG",
];
const IMG_SEED_FLAG = "luxe_parfums_img_seed_v1";

function seedProductosDesdeImg() {
  if (localStorage.getItem(IMG_SEED_FLAG)) return;
  const yaCargadas = new Set(config.productos.map(p => p.imagen));
  let agregados = 0;
  IMG_PRODUCT_FILES.forEach(file => {
    const ruta = "img/" + file;
    if (yaCargadas.has(ruta)) return;
    const esAfnan = file.startsWith("Afnan9PMRebel");
    config.productos.push({
      id:              "prod_seed_" + Date.now() + "_" + agregados,
      nombre:          esAfnan ? "9PM Rebel" : "Producto sin nombre (" + file.replace(/\.PNG$/i, "") + ")",
      marca:           esAfnan ? "Afnan" : "",
      categoria:       "arabe",
      categoriaNombre: "Árabes",
      badge:           null,
      precio:          0,
      stock:           null,
      descripcion:     "",
      volumen:         null,
      imagen:          ruta,
    });
    agregados++;
  });
  if (agregados > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  localStorage.setItem(IMG_SEED_FLAG, "1");
}
seedProductosDesdeImg();

/* ── Categorías disponibles ───────────────────────────────── */
const CATEGORIAS = [
  { id: "arabe",       nombre: "Árabes" },
  { id: "disenador",   nombre: "Diseñador" },
  { id: "nicho",       nombre: "Nicho" },
];

/* ── Secciones con imagen ─────────────────────────────────── */
const SECCIONES = [
  { id: "hero",      nombre: "Imagen Hero (fondo del inicio)" },
  { id: "nosotros",  nombre: "Foto Nosotros" },
  { id: "banner1",   nombre: "Banner destacado 1" },
  { id: "banner2",   nombre: "Banner destacado 2" },
];

/* ── Login ────────────────────────────────────────────────── */
const btnIngresar   = document.getElementById("btnIngresar");
const pwInput       = document.getElementById("password");
const loginError    = document.getElementById("loginError");

btnIngresar.addEventListener("click", intentarLogin);
pwInput.addEventListener("keydown", (e) => { if (e.key === "Enter") intentarLogin(); });

function intentarLogin() {
  if (pwInput.value === getAdminPassword()) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("adminPanel").style.display  = "flex";
    buildUI();
  } else {
    loginError.style.display = "block";
    pwInput.value = "";
    pwInput.focus();
    pwInput.parentElement.parentElement.classList.add("shake");
    setTimeout(() => pwInput.parentElement.parentElement.classList.remove("shake"), 500);
  }
}

document.getElementById("togglePassword").addEventListener("click", function() {
  const visible = pwInput.type === "text";
  pwInput.type = visible ? "password" : "text";
  document.getElementById("iconShow").style.display = visible ? "block" : "none";
  document.getElementById("iconHide").style.display = visible ? "none"  : "block";
});

/* ── Logout ──────────────────────────────────────────────── */
document.getElementById("btnLogout").addEventListener("click", () => location.reload());

/* ── Guardar ─────────────────────────────────────────────── */
document.getElementById("btnGuardar").addEventListener("click", saveAll);

function saveAll() {
  // Guardar config de secciones imagen (ya se guarda en tiempo real)
  // Guardar config de settings
  const wa  = document.getElementById("cfgWhatsapp")?.value.trim();
  const em  = document.getElementById("cfgEmail")?.value.trim();
  const dir = document.getElementById("cfgDireccion")?.value.trim();
  const ig  = document.getElementById("cfgInstagram")?.value.trim();
  const tt  = document.getElementById("cfgTiktok")?.value.trim();

  if (!config.settings) config.settings = {};
  if (wa)  config.settings.whatsapp  = wa;
  if (em)  config.settings.email     = em;
  if (dir) config.settings.direccion = dir;
  if (ig)  config.settings.instagram = ig;
  if (tt)  config.settings.tiktok    = tt;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  showToast("¡Guardado exitosamente!");
}

/* ── Tabs ────────────────────────────────────────────────── */
const tabs    = document.querySelectorAll(".tab");
const topbarTitle = document.getElementById("topbarTitle");
const tabTitles = { productos: "Productos", imagenes: "Imágenes de secciones", consultas: "Consultas recibidas", config: "Configuración" };

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
    document.querySelectorAll(".tab-content").forEach(s => s.classList.remove("active"));
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    document.getElementById("tab-" + tab.dataset.tab).classList.add("active");
    if (topbarTitle) topbarTitle.textContent = tabTitles[tab.dataset.tab] || "";
    // Mobile: cerrar sidebar al seleccionar
    if (window.innerWidth < 768) closeSidebar();
  });
});

/* ── Mobile sidebar ──────────────────────────────────────── */
const sidebar    = document.getElementById("adminSidebar");
const menuToggle = document.getElementById("menuToggle");
const sidebarClose = document.getElementById("sidebarClose");

menuToggle?.addEventListener("click",    openSidebar);
sidebarClose?.addEventListener("click",  closeSidebar);

function openSidebar()  { sidebar.classList.add("open"); }
function closeSidebar() { sidebar.classList.remove("open"); }

/* ── Build UI ────────────────────────────────────────────── */
function buildUI() {
  buildProductosAdmin();
  buildImagenesAdmin();
  buildConsultasAdmin();
  buildConfigAdmin();
}

/* ============================================================
   PRODUCTOS
   ============================================================ */
function buildProductosAdmin() {
  const container = document.getElementById("productosAdmin");
  container.innerHTML = "";

  const topBar = document.createElement("div");
  topBar.className = "prod-admin-topbar";

  const btnNuevo = document.createElement("button");
  btnNuevo.type = "button";
  btnNuevo.className = "btn-add-prod";
  btnNuevo.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Agregar producto`;
  topBar.appendChild(btnNuevo);
  container.appendChild(topBar);

  const formWrap = document.createElement("div");
  formWrap.id = "prodFormWrap";
  container.appendChild(formWrap);

  const list = document.createElement("div");
  list.className = "prod-admin-list";
  list.id = "prodListAll";
  container.appendChild(list);

  btnNuevo.addEventListener("click", function() {
    openProductForm(null, formWrap, list);
  });

  renderProdList(list);
}

function renderProdList(list) {
  list.innerHTML = "";
  if (!config.productos || config.productos.length === 0) {
    list.innerHTML = `<div class="prod-admin-empty">
      <p>Todavía no hay productos cargados.</p>
      <p style="margin-top:0.4rem;font-size:0.78rem;opacity:0.6">Los productos demo se muestran en la web hasta que agregues los tuyos.</p>
    </div>`;
    return;
  }

  config.productos.forEach(function(prod) {
    const row = document.createElement("div");
    row.className = "prod-admin-row";

    const thumb = prod.imagen
      ? `<img src="${prod.imagen}" alt="" class="prod-admin-thumb" />`
      : `<div class="prod-admin-thumb prod-admin-thumb--empty">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
             <path d="M9 3h6M10 3v2M14 3v2M8 7h8l1 3v9a2 2 0 01-2 2H9a2 2 0 01-2-2V10l1-3z"/>
           </svg>
         </div>`;

    const precio = prod.precio ? `<span>$${Number(prod.precio).toLocaleString("es-AR")}</span>` : "";
    const badge  = prod.badge  ? `<span class="prod-admin-cat-tag" style="color:var(--gold-bright)">${esc(prod.badge)}</span>` : "";
    const stock  = prod.stock != null ? `<span style="font-size:0.72rem;color:var(--white-30)">Stock: ${prod.stock}</span>` : "";
    const destacado = prod.destacado ? `<span class="prod-admin-cat-tag" style="color:var(--gold-bright)">★ Destacado</span>` : "";

    row.innerHTML = thumb +
      `<div class="prod-admin-info">
        <strong>${esc(prod.nombre)}</strong>
        <span class="prod-admin-cat-tag">${esc(prod.categoriaNombre || prod.categoria)}</span>
        ${prod.marca ? `<span style="font-size:0.75rem;color:var(--white-30)">${esc(prod.marca)}</span>` : ""}
        ${precio}
        ${stock}
        ${badge}
        ${destacado}
      </div>
      <div class="prod-admin-actions">
        <button class="btn-edit-prod" type="button">Editar</button>
        <button class="btn-del-prod"  type="button">Eliminar</button>
      </div>`;

    const list2 = document.getElementById("prodListAll");

    row.querySelector(".btn-del-prod").addEventListener("click", function() {
      if (!confirm(`¿Eliminar "${prod.nombre}"?`)) return;
      config.productos = config.productos.filter(p => p.id !== prod.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      renderProdList(list2);
      showToast("Producto eliminado");
    });

    row.querySelector(".btn-edit-prod").addEventListener("click", function() {
      const fw = document.getElementById("prodFormWrap");
      openProductForm(prod, fw, list2);
    });

    list.appendChild(row);
  });
}

function openProductForm(prod, formWrap, list) {
  // Toggle si ya está abierto para el mismo producto
  if (formWrap.dataset.editing === (prod ? prod.id : "new")) {
    formWrap.innerHTML = "";
    formWrap.dataset.editing = "";
    return;
  }
  formWrap.dataset.editing = prod ? prod.id : "new";
  const isEdit = prod !== null;

  const catOpts = CATEGORIAS.map(c => {
    const sel = isEdit && prod.categoria === c.id ? " selected" : "";
    return `<option value="${c.id}" data-nombre="${c.nombre}"${sel}>${c.nombre}</option>`;
  }).join("");

  const badgeOpts = ["", "Best Seller", "Nuevo", "Importado", "Exclusivo", "Nicho", "Oferta", "Ideal regalo"]
    .map(b => `<option value="${b}"${isEdit && prod.badge === b ? " selected" : ""}>${b || "— Sin etiqueta —"}</option>`)
    .join("");

  formWrap.innerHTML = `
    <div class="prod-form">
      <h4 class="prod-form-title">${isEdit ? "✏ Editar producto" : "+ Nuevo producto"}</h4>
      <div class="prod-form-grid">
        <div class="admin-field">
          <label>Nombre *</label>
          <input type="text" id="pf-nombre" value="${isEdit ? esc(prod.nombre) : ""}" placeholder="Ej: Sauvage" />
        </div>
        <div class="admin-field">
          <label>Marca</label>
          <input type="text" id="pf-marca" value="${isEdit && prod.marca ? esc(prod.marca) : ""}" placeholder="Ej: Dior" />
        </div>
        <div class="admin-field">
          <label>Categoría *</label>
          <select id="pf-cat">${catOpts}</select>
        </div>
        <div class="admin-field">
          <label>Etiqueta (badge)</label>
          <select id="pf-badge">${badgeOpts}</select>
        </div>
        <div class="admin-field">
          <label>Precio ($)</label>
          <input type="number" id="pf-precio" value="${isEdit && prod.precio ? prod.precio : ""}" placeholder="Ej: 85000" min="0" />
        </div>
        <div class="admin-field">
          <label>Stock</label>
          <input type="number" id="pf-stock" value="${isEdit && prod.stock != null ? prod.stock : ""}" placeholder="Ej: 20" min="0" />
        </div>
        <div class="admin-field">
          <label>Volumen disponible</label>
          <div class="pf-checks">
            ${["3ml","5ml","10ml"].map(v => {
              const checked = isEdit && prod.volumen && prod.volumen.includes(v) ? " checked" : "";
              return `<label class="pf-check-label"><input type="checkbox" name="pf-vol" value="${v}"${checked}> ${v}</label>`;
            }).join("")}
          </div>
        </div>
        <div class="admin-field">
          <label>Destacado</label>
          <div class="pf-checks">
            <label class="pf-check-label"><input type="checkbox" id="pf-destacado"${isEdit && prod.destacado ? " checked" : ""}> Mostrar en sección Destacados</label>
          </div>
        </div>
        <div class="admin-field prod-form-desc">
          <label>Descripción breve</label>
          <input type="text" id="pf-desc" value="${isEdit && prod.descripcion ? esc(prod.descripcion) : ""}" placeholder="Notas olfativas, intensidad..." />
        </div>
        <div class="admin-field prod-form-img">
          <label>Imagen del producto (máx. 3MB)</label>
          <input type="file" id="pf-img" accept="image/*" />
          ${isEdit && prod.imagen ? `<img src="${prod.imagen}" class="pf-preview" alt="Preview actual" />` : ""}
        </div>
      </div>
      <div class="prod-form-btns">
        <button class="btn-primary-sm" type="button" id="pfGuardar">Guardar producto</button>
        <button class="btn-ghost-sm"   type="button" id="pfCancelar">Cancelar</button>
      </div>
      <p class="prod-form-error" id="pf-error" style="display:none">Ingresá al menos el nombre del producto.</p>
    </div>`;

  formWrap.querySelector("#pfCancelar").addEventListener("click", function() {
    formWrap.innerHTML = "";
    formWrap.dataset.editing = "";
  });

  formWrap.querySelector("#pfGuardar").addEventListener("click", function() {
    const nombre  = document.getElementById("pf-nombre").value.trim();
    const marca   = document.getElementById("pf-marca").value.trim();
    const catSel  = document.getElementById("pf-cat");
    const catId   = catSel.value;
    const catNom  = catSel.options[catSel.selectedIndex].dataset.nombre;
    const badge   = document.getElementById("pf-badge").value;
    const precio  = document.getElementById("pf-precio").value.trim();
    const stock   = document.getElementById("pf-stock").value.trim();
    const desc    = document.getElementById("pf-desc").value.trim();
    const imgFile = document.getElementById("pf-img").files[0];
    const volumen = [...document.querySelectorAll('input[name="pf-vol"]:checked')].map(c => c.value);
    const destacado = document.getElementById("pf-destacado").checked;
    const errEl   = document.getElementById("pf-error");

    if (!nombre) { errEl.style.display = "block"; return; }
    errEl.style.display = "none";

    function guardarProducto(imagenData) {
      if (isEdit) {
        const p = config.productos.find(x => x.id === prod.id);
        if (p) {
          p.nombre          = nombre;
          p.marca           = marca;
          p.categoria       = catId;
          p.categoriaNombre = catNom;
          p.badge           = badge;
          p.precio          = precio ? Number(precio) : 0;
          p.stock           = stock !== "" ? Number(stock) : null;
          p.descripcion     = desc;
          p.volumen         = volumen.length ? volumen : null;
          p.destacado       = destacado;
          if (imagenData !== undefined) p.imagen = imagenData;
        }
      } else {
        config.productos.push({
          id:              "prod_" + Date.now(),
          nombre,
          marca,
          categoria:       catId,
          categoriaNombre: catNom,
          badge:           badge || null,
          precio:          precio ? Number(precio) : 0,
          stock:           stock !== "" ? Number(stock) : null,
          descripcion:     desc,
          volumen:         volumen.length ? volumen : null,
          destacado:       destacado,
          imagen:          imagenData || null,
        });
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      formWrap.innerHTML = "";
      formWrap.dataset.editing = "";
      renderProdList(list);
      showToast(isEdit ? "Producto actualizado" : "Producto agregado");
    }

    if (imgFile) {
      if (imgFile.size > 3 * 1024 * 1024) { alert("La imagen es demasiado grande. Máximo 3MB."); return; }
      const reader = new FileReader();
      reader.onload = (e) => guardarProducto(e.target.result);
      reader.readAsDataURL(imgFile);
    } else {
      guardarProducto(isEdit ? undefined : null);
    }
  });

  // Scroll al form
  setTimeout(() => formWrap.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

/* ============================================================
   IMÁGENES DE SECCIONES
   ============================================================ */
function buildImagenesAdmin() {
  const grid = document.getElementById("imagenesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  SECCIONES.forEach(sec => {
    const data = config[sec.id] || {};
    grid.appendChild(createSectionCard(sec.id, sec.nombre, data.imagen || null));
  });
}

function createSectionCard(id, nombre, imagen) {
  const card = document.createElement("div");
  card.className = "admin-card";

  const preview = document.createElement("div");
  preview.className = "admin-card-preview";
  setPreviewContent(preview, imagen);

  const body = document.createElement("div");
  body.className = "admin-card-body";

  const title = document.createElement("div");
  title.className = "admin-card-title";
  title.textContent = nombre;
  body.appendChild(title);

  const field = document.createElement("div");
  field.className = "admin-field";
  field.innerHTML = "<label>Imagen</label>";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.addEventListener("change", () => handleSectionUpload(fileInput, id, preview));
  field.appendChild(fileInput);

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-remove";
  removeBtn.type = "button";
  removeBtn.textContent = "Quitar imagen";
  removeBtn.addEventListener("click", () => {
    if (!config[id]) config[id] = {};
    config[id].imagen = null;
    fileInput.value = "";
    setPreviewContent(preview, null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  });
  field.appendChild(removeBtn);
  body.appendChild(field);
  card.appendChild(preview);
  card.appendChild(body);
  return card;
}

function setPreviewContent(preview, imagen) {
  preview.innerHTML = "";
  if (imagen) {
    const img = document.createElement("img");
    img.src = imagen;
    img.alt = "";
    preview.appendChild(img);
  } else {
    const ph = document.createElement("div");
    ph.className = "no-img";
    ph.textContent = "Sin imagen";
    preview.appendChild(ph);
  }
}

function handleSectionUpload(input, id, preview) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    alert("La imagen es demasiado grande. Máximo 3MB.");
    input.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (!config[id]) config[id] = {};
    config[id].imagen = e.target.result;
    setPreviewContent(preview, e.target.result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    showToast("Imagen guardada");
  };
  reader.readAsDataURL(file);
}

/* ============================================================
   CONSULTAS
   ============================================================ */
const CONSULTAS_KEY = "luxe_parfums_consultas";

function buildConsultasAdmin() {
  const container = document.getElementById("consultasAdmin");
  const badge     = document.getElementById("consultasBadge");
  const consultas = JSON.parse(localStorage.getItem(CONSULTAS_KEY) || "[]");

  const noLeidas = consultas.filter(c => !c.leida).length;
  if (badge) {
    if (noLeidas > 0) { badge.textContent = noLeidas; badge.style.display = "inline-block"; }
    else { badge.style.display = "none"; }
  }

  if (!consultas.length) {
    container.innerHTML = `<div class="prod-admin-empty" style="margin:2rem auto;max-width:400px">No hay consultas recibidas aún.</div>`;
    return;
  }

  const topBar = document.createElement("div");
  topBar.className = "prod-admin-topbar";
  topBar.innerHTML = `<span>${consultas.length} consulta${consultas.length !== 1 ? "s" : ""}</span>
    <button class="btn-ghost-sm" id="btnBorrarConsultas">Borrar todas</button>`;
  container.appendChild(topBar);

  topBar.querySelector("#btnBorrarConsultas").addEventListener("click", () => {
    if (!confirm("¿Borrar todas las consultas?")) return;
    localStorage.removeItem(CONSULTAS_KEY);
    container.innerHTML = "";
    buildConsultasAdmin();
  });

  const list = document.createElement("div");
  list.className = "consultas-list";
  container.appendChild(list);

  consultas.forEach((c, idx) => {
    const fecha = new Date(c.fecha).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
    const row = document.createElement("div");
    row.className = "consulta-row" + (c.leida ? "" : " consulta-row--nueva");
    row.innerHTML = `
      <div class="consulta-header">
        <div class="consulta-info">
          <strong>${esc(c.nombre)}</strong>
          <span>${esc(c.email)}</span>
          ${c.telefono ? `<span>${esc(c.telefono)}</span>` : ""}
        </div>
        <div class="consulta-meta">
          ${!c.leida ? `<span class="consulta-badge-nueva">Nueva</span>` : ""}
          <span class="consulta-fecha">${fecha}</span>
          <button class="consulta-btn-borrar" data-idx="${idx}" title="Borrar">✕</button>
        </div>
      </div>
      <p class="consulta-mensaje">${esc(c.mensaje)}</p>
      ${!c.leida ? `<button class="btn-ghost-sm consulta-btn-leida" data-idx="${idx}">Marcar como leída</button>` : ""}`;

    row.querySelector(".consulta-btn-borrar").addEventListener("click", () => {
      const arr = JSON.parse(localStorage.getItem(CONSULTAS_KEY) || "[]");
      arr.splice(idx, 1);
      localStorage.setItem(CONSULTAS_KEY, JSON.stringify(arr));
      container.innerHTML = "";
      buildConsultasAdmin();
    });

    row.querySelector(".consulta-btn-leida")?.addEventListener("click", () => {
      const arr = JSON.parse(localStorage.getItem(CONSULTAS_KEY) || "[]");
      arr[idx].leida = true;
      localStorage.setItem(CONSULTAS_KEY, JSON.stringify(arr));
      container.innerHTML = "";
      buildConsultasAdmin();
    });

    list.appendChild(row);
  });
}

/* ============================================================
   CONFIGURACIÓN
   ============================================================ */
function buildConfigAdmin() {
  const s = config.settings || {};
  if (s.whatsapp)  setVal("cfgWhatsapp",  s.whatsapp);
  if (s.email)     setVal("cfgEmail",     s.email);
  if (s.direccion) setVal("cfgDireccion", s.direccion);
  if (s.instagram) setVal("cfgInstagram", s.instagram);
  if (s.tiktok)    setVal("cfgTiktok",    s.tiktok);

  document.getElementById("btnCfgPassword")?.addEventListener("click", function() {
    const newPw = document.getElementById("cfgPassword")?.value.trim();
    if (!newPw || newPw.length < 6) { alert("La contraseña debe tener al menos 6 caracteres."); return; }
    localStorage.setItem(DEFAULT_PW_KEY, newPw);
    document.getElementById("cfgPassword").value = "";
    showToast("Contraseña actualizada");
  });
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

/* ── Toast ───────────────────────────────────────────────── */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  const span = toast.querySelector("span") || toast;
  if (toast.querySelector("svg + span")) {
    toast.querySelector("svg + span") ? null : null;
  }
  // Actualizar texto manteniendo el ícono
  const svgEl = toast.querySelector("svg");
  toast.innerHTML = "";
  if (svgEl) toast.appendChild(svgEl);
  const textNode = document.createTextNode(" " + (msg || "¡Guardado!"));
  toast.appendChild(textNode);

  toast.hidden = false;
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}

/* ── Helper ─────────────────────────────────────────────── */
function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
