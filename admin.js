/* ============================================================
   Bruma — admin.js
   Todo el panel habla con el backend en /api en vez de localStorage.
   ============================================================ */

const API = {
  session:   "api/session.php",
  login:     "api/login.php",
  logout:    "api/logout.php",
  productos: "api/productos.php",
  settings:  "api/settings.php",
  consultas: "api/consultas.php",
  upload:    "api/upload.php",
  migrar:    "api/migrar.php",
};

let productosCache = [];
let consultasCache = [];

/* ── Categorías disponibles ───────────────────────────────── */
const CATEGORIAS = [
  { id: "arabe",       nombre: "Árabes" },
  { id: "disenador",   nombre: "Diseñador" },
  { id: "nicho",       nombre: "Nicho" },
];

/* ── Login ────────────────────────────────────────────────── */
const btnIngresar = document.getElementById("btnIngresar");
const pwInput     = document.getElementById("password");
const loginError  = document.getElementById("loginError");

btnIngresar.addEventListener("click", intentarLogin);
pwInput.addEventListener("keydown", (e) => { if (e.key === "Enter") intentarLogin(); });

// Si ya había una sesión activa (recargó la página estando logueado), entra directo.
fetch(API.session)
  .then((res) => res.json())
  .then((data) => { if (data.loggedIn) mostrarPanel(); })
  .catch(() => {});

async function intentarLogin() {
  btnIngresar.disabled = true;
  try {
    const res = await fetch(API.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwInput.value }),
    });
    if (!res.ok) throw new Error();
    mostrarPanel();
  } catch (e) {
    loginError.style.display = "block";
    pwInput.value = "";
    pwInput.focus();
    pwInput.parentElement.parentElement.classList.add("shake");
    setTimeout(() => pwInput.parentElement.parentElement.classList.remove("shake"), 500);
  } finally {
    btnIngresar.disabled = false;
  }
}

function mostrarPanel() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminPanel").style.display  = "flex";
  buildUI();
}

document.getElementById("togglePassword").addEventListener("click", function() {
  const visible = pwInput.type === "text";
  pwInput.type = visible ? "password" : "text";
  document.getElementById("iconShow").style.display = visible ? "block" : "none";
  document.getElementById("iconHide").style.display = visible ? "none"  : "block";
});

/* ── Logout ──────────────────────────────────────────────── */
document.getElementById("btnLogout").addEventListener("click", async () => {
  try { await fetch(API.logout, { method: "POST" }); } catch (e) {}
  location.reload();
});

/* ── Guardar (Configuración) ────────────────────────────────── */
document.getElementById("btnGuardar").addEventListener("click", saveSettings);

async function saveSettings() {
  const wa  = document.getElementById("cfgWhatsapp")?.value.trim();
  const em  = document.getElementById("cfgEmail")?.value.trim();
  const dir = document.getElementById("cfgDireccion")?.value.trim();
  const ig  = document.getElementById("cfgInstagram")?.value.trim();

  try {
    const res = await fetch(API.settings, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsapp: wa, email: em, direccion: dir, instagram: ig }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
    showToast("¡Guardado exitosamente!");
  } catch (e) {
    alert(e.message);
  }
}

/* ── Tabs ────────────────────────────────────────────────── */
const tabs    = document.querySelectorAll(".tab");
const topbarTitle = document.getElementById("topbarTitle");
const tabTitles = { productos: "Productos", consultas: "Consultas recibidas", config: "Configuración" };

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
  list.innerHTML = `<div class="prod-admin-empty">Cargando productos...</div>`;
  container.appendChild(list);

  btnNuevo.addEventListener("click", function() {
    openProductForm(null, formWrap, list);
  });

  cargarProductos(list);
}

async function cargarProductos(list) {
  try {
    const res = await fetch(API.productos);
    productosCache = await res.json();
  } catch (e) {
    productosCache = [];
  }
  renderProdList(list);
}

function renderProdList(list) {
  list.innerHTML = "";
  if (!productosCache || productosCache.length === 0) {
    list.innerHTML = `<div class="prod-admin-empty">
      <p>Todavía no hay productos cargados.</p>
      <p style="margin-top:0.4rem;font-size:0.78rem;opacity:0.6">Agregá el primero con el botón de arriba.</p>
    </div>`;
    return;
  }

  productosCache.forEach(function(prod) {
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
    const dosFotos  = prod.imagenTrasera ? `<span class="prod-admin-cat-tag">📷 2 fotos</span>` : "";

    row.innerHTML = thumb +
      `<div class="prod-admin-info">
        <strong>${esc(prod.nombre)}</strong>
        <span class="prod-admin-cat-tag">${esc(prod.categoriaNombre || prod.categoria)}</span>
        ${prod.marca ? `<span style="font-size:0.75rem;color:var(--white-30)">${esc(prod.marca)}</span>` : ""}
        ${precio}
        ${stock}
        ${badge}
        ${destacado}
        ${dosFotos}
      </div>
      <div class="prod-admin-actions">
        <button class="btn-edit-prod" type="button">Editar</button>
        <button class="btn-del-prod"  type="button">Eliminar</button>
      </div>`;

    const list2 = document.getElementById("prodListAll");

    row.querySelector(".btn-del-prod").addEventListener("click", async function() {
      if (!confirm(`¿Eliminar "${prod.nombre}"?`)) return;
      try {
        const res = await fetch(`${API.productos}?id=${encodeURIComponent(prod.id)}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo eliminar.");
        productosCache = productosCache.filter(p => p.id !== prod.id);
        renderProdList(list2);
        showToast("Producto eliminado");
      } catch (e) {
        alert(e.message);
      }
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
          <label>Foto de frente (máx. 3MB)</label>
          <input type="file" id="pf-img" accept="image/*" />
          ${isEdit && prod.imagen ? `<img src="${prod.imagen}" class="pf-preview" alt="Preview actual" />` : ""}
        </div>
        <div class="admin-field prod-form-img">
          <label>Foto de atrás (opcional, máx. 3MB)</label>
          <input type="file" id="pf-img2" accept="image/*" />
          ${isEdit && prod.imagenTrasera ? `<img src="${prod.imagenTrasera}" class="pf-preview" alt="Preview actual (atrás)" />` : ""}
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

  formWrap.querySelector("#pfGuardar").addEventListener("click", async function() {
    const nombre  = document.getElementById("pf-nombre").value.trim();
    const marca   = document.getElementById("pf-marca").value.trim();
    const catSel  = document.getElementById("pf-cat");
    const catId   = catSel.value;
    const catNom  = catSel.options[catSel.selectedIndex].dataset.nombre;
    const badge   = document.getElementById("pf-badge").value;
    const precio  = document.getElementById("pf-precio").value.trim();
    const stock   = document.getElementById("pf-stock").value.trim();
    const desc    = document.getElementById("pf-desc").value.trim();
    const imgFile  = document.getElementById("pf-img").files[0];
    const imgFile2 = document.getElementById("pf-img2").files[0];
    const volumen = [...document.querySelectorAll('input[name="pf-vol"]:checked')].map(c => c.value);
    const destacado = document.getElementById("pf-destacado").checked;
    const errEl   = document.getElementById("pf-error");
    const btnGuardarProd = formWrap.querySelector("#pfGuardar");

    if (!nombre) { errEl.style.display = "block"; return; }
    errEl.style.display = "none";

    btnGuardarProd.disabled = true;
    btnGuardarProd.textContent = "Guardando...";

    try {
      const [imagenUrl, imagenTraseraUrl] = await Promise.all([
        subirFotoSiHay(imgFile),
        subirFotoSiHay(imgFile2),
      ]);

      const payload = {
        nombre, marca,
        categoria: catId,
        categoriaNombre: catNom,
        badge: badge || null,
        precio: precio ? Number(precio) : 0,
        stock: stock !== "" ? Number(stock) : null,
        descripcion: desc,
        volumen: volumen.length ? volumen : null,
        destacado,
      };
      if (isEdit) payload.id = prod.id;
      // Solo se manda la foto si se eligió un archivo nuevo; si no, el
      // servidor conserva la que ya tenía el producto.
      if (imagenUrl !== undefined) payload.imagen = imagenUrl;
      if (imagenTraseraUrl !== undefined) payload.imagenTrasera = imagenTraseraUrl;

      const res = await fetch(API.productos, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el producto.");

      if (isEdit) {
        const idx = productosCache.findIndex(p => p.id === prod.id);
        if (idx !== -1) productosCache[idx] = data.producto;
      } else {
        productosCache.push(data.producto);
      }

      formWrap.innerHTML = "";
      formWrap.dataset.editing = "";
      renderProdList(list);
      showToast(isEdit ? "Producto actualizado" : "Producto agregado");
    } catch (e) {
      alert(e.message);
      btnGuardarProd.disabled = false;
      btnGuardarProd.textContent = "Guardar producto";
    }
  });

  // Scroll al form
  setTimeout(() => formWrap.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

/* Sube un archivo al servidor y devuelve la URL pública. Si no hay archivo,
   resuelve en `undefined` (significa "no tocar la foto actual"). */
function subirFotoSiHay(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(undefined); return; }
    if (file.size > 3 * 1024 * 1024) { reject(new Error("La imagen es demasiado grande. Máximo 3MB.")); return; }

    const formData = new FormData();
    formData.append("foto", file);

    fetch(API.upload, { method: "POST", body: formData })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) { reject(new Error(data.error || "No se pudo subir la imagen.")); return; }
        resolve(data.url);
      })
      .catch(() => reject(new Error("No se pudo subir la imagen.")));
  });
}

/* ============================================================
   CONSULTAS
   ============================================================ */
async function buildConsultasAdmin() {
  const container = document.getElementById("consultasAdmin");
  const badge     = document.getElementById("consultasBadge");
  container.innerHTML = `<div class="prod-admin-empty" style="margin:2rem auto;max-width:400px">Cargando consultas...</div>`;

  try {
    const res = await fetch(API.consultas);
    if (!res.ok) throw new Error();
    consultasCache = await res.json();
  } catch (e) {
    consultasCache = [];
  }

  renderConsultas(container, badge);
}

function renderConsultas(container, badge) {
  const noLeidas = consultasCache.filter(c => !c.leida).length;
  if (badge) {
    if (noLeidas > 0) { badge.textContent = noLeidas; badge.style.display = "inline-block"; }
    else { badge.style.display = "none"; }
  }

  container.innerHTML = "";

  if (!consultasCache.length) {
    container.innerHTML = `<div class="prod-admin-empty" style="margin:2rem auto;max-width:400px">No hay consultas recibidas aún.</div>`;
    return;
  }

  const topBar = document.createElement("div");
  topBar.className = "prod-admin-topbar";
  topBar.innerHTML = `<span>${consultasCache.length} consulta${consultasCache.length !== 1 ? "s" : ""}</span>
    <button class="btn-ghost-sm" id="btnBorrarConsultas">Borrar todas</button>`;
  container.appendChild(topBar);

  topBar.querySelector("#btnBorrarConsultas").addEventListener("click", async () => {
    if (!confirm("¿Borrar todas las consultas?")) return;
    try {
      const res = await fetch(API.consultas, { method: "DELETE" });
      if (!res.ok) throw new Error();
      consultasCache = [];
      renderConsultas(container, badge);
    } catch (e) {
      alert("No se pudieron borrar las consultas.");
    }
  });

  const list = document.createElement("div");
  list.className = "consultas-list";
  container.appendChild(list);

  consultasCache.forEach((c) => {
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
          <button class="consulta-btn-borrar" title="Borrar">✕</button>
        </div>
      </div>
      <p class="consulta-mensaje">${esc(c.mensaje)}</p>
      ${!c.leida ? `<button class="btn-ghost-sm consulta-btn-leida">Marcar como leída</button>` : ""}`;

    row.querySelector(".consulta-btn-borrar").addEventListener("click", async () => {
      try {
        const res = await fetch(`${API.consultas}?id=${encodeURIComponent(c.id)}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        consultasCache = consultasCache.filter(x => x.id !== c.id);
        renderConsultas(container, badge);
      } catch (e) {
        alert("No se pudo borrar la consulta.");
      }
    });

    row.querySelector(".consulta-btn-leida")?.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API.consultas}?id=${encodeURIComponent(c.id)}`, { method: "PATCH" });
        if (!res.ok) throw new Error();
        c.leida = true;
        renderConsultas(container, badge);
      } catch (e) {
        alert("No se pudo marcar como leída.");
      }
    });

    list.appendChild(row);
  });
}

/* ============================================================
   CONFIGURACIÓN
   ============================================================ */
async function buildConfigAdmin() {
  try {
    const res = await fetch(API.settings);
    const s = await res.json();
    setVal("cfgWhatsapp",  s.whatsapp);
    setVal("cfgEmail",     s.email);
    setVal("cfgDireccion", s.direccion);
    setVal("cfgInstagram", s.instagram);
  } catch (e) { /* deja los campos vacíos si falla */ }

  document.getElementById("btnCfgPassword")?.addEventListener("click", async function() {
    const newPw = document.getElementById("cfgPassword")?.value.trim();
    if (!newPw || newPw.length < 6) { alert("La contraseña debe tener al menos 6 caracteres."); return; }
    try {
      const res = await fetch(API.settings, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cambiar la contraseña.");
      document.getElementById("cfgPassword").value = "";
      showToast("Contraseña actualizada");
    } catch (e) {
      alert(e.message);
    }
  });

  buildMigracion();
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val) el.value = val;
}

/* ============================================================
   MIGRACIÓN ÚNICA: datos que quedaron en este navegador (localStorage)
   de cuando el sitio todavía no tenía servidor propio.
   ============================================================ */
const OLD_STORAGE_KEY   = "luxe_parfums_admin";
const OLD_CONSULTAS_KEY = "luxe_parfums_consultas";
const MIGRADO_FLAG      = "luxe_parfums_migrado_v1";

function buildMigracion() {
  const card = document.getElementById("migracionCard");
  if (!card) return;

  if (localStorage.getItem(MIGRADO_FLAG)) { card.hidden = true; return; }

  let datosViejos = null;
  try { datosViejos = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY)); } catch (e) {}

  const hayProductosViejos = datosViejos && Array.isArray(datosViejos.productos) && datosViejos.productos.length > 0;
  if (!hayProductosViejos) { card.hidden = true; return; }

  card.hidden = false;
  card.querySelector("#migracionCantidad").textContent = datosViejos.productos.length;

  document.getElementById("btnMigrar").addEventListener("click", migrarDatos);
}

async function migrarDatos() {
  const btn = document.getElementById("btnMigrar");
  btn.disabled = true;
  btn.textContent = "Migrando...";

  let datosViejos = {};
  try { datosViejos = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY)) || {}; } catch (e) {}
  let consultasViejas = [];
  try { consultasViejas = JSON.parse(localStorage.getItem(OLD_CONSULTAS_KEY)) || []; } catch (e) {}

  try {
    const res = await fetch(API.migrar, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productos: datosViejos.productos || [],
        settings:  datosViejos.settings  || {},
        consultas: consultasViejas,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo migrar.");

    localStorage.setItem(MIGRADO_FLAG, "1");
    showToast(`¡Listo! Se migraron ${data.productos} productos.`);
    document.getElementById("migracionCard").hidden = true;
    buildProductosAdmin();
  } catch (e) {
    alert(e.message);
    btn.disabled = false;
    btn.textContent = "Migrar ahora";
  }
}

/* ── Toast ───────────────────────────────────────────────── */
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
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
