/* ============================================================
   Luxe Parfums — cart.js
   Requiere: CONFIG y getProductos() de script.js
   ============================================================ */

var cart = [];
var lightboxCurrentProd = null;

/* ── Referencias DOM ─────────────────────────────────────── */
var cartFloatBtn = document.getElementById("cartFloat");
var cartPanel    = document.getElementById("cartPanel");
var cartOverlay  = document.getElementById("cartOverlay");
var cartBody     = document.getElementById("cartBody");
var cartFooter   = document.getElementById("cartFooter");
var cartBadge    = document.getElementById("cartBadge");
var cartTotalEl  = document.getElementById("cartTotal");

var lightbox         = document.getElementById("lightbox");
var lightboxImgEl    = document.getElementById("lightboxImg");
var lightboxImgWrap  = document.getElementById("lightboxImgWrap");
var lightboxPlaceholder = document.getElementById("lightboxPlaceholder");
var lightboxMarcaEl  = document.getElementById("lightboxMarca");
var lightboxNomEl    = document.getElementById("lightboxNombre");
var lightboxCatEl    = document.getElementById("lightboxCat");
var lightboxDescEl   = document.getElementById("lightboxDesc");
var lightboxPrecioEl = document.getElementById("lightboxPrecio");
var lightboxStockEl  = document.getElementById("lightboxStock");
var lightboxAddBtn   = document.getElementById("lightboxAdd");

/* ── Lightbox ─────────────────────────────────────────────── */
document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", function(e) { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", function(e) { if (e.key === "Escape") { closeLightbox(); closeCart(); } });

lightboxAddBtn.addEventListener("click", function() {
  if (lightboxCurrentProd) {
    addToCart(lightboxCurrentProd);
    closeLightbox();
    openCart();
  }
});

function openLightbox(prod) {
  lightboxCurrentProd = prod;

  if (prod.imagen) {
    lightboxImgEl.src = prod.imagen;
    lightboxImgEl.alt = prod.nombre;
    lightboxImgEl.style.display = "block";
    lightboxPlaceholder.style.display = "none";
  } else {
    lightboxImgEl.src = "";
    lightboxImgEl.style.display = "none";
    lightboxPlaceholder.style.display = "flex";
    lightboxPlaceholder.style.cssText = getPlaceholderStyle(prod.categoria);
  }

  lightboxMarcaEl.textContent  = prod.marca || "";
  lightboxNomEl.textContent    = prod.nombre;
  lightboxCatEl.textContent    = prod.categoriaNombre || prod.categoria || "";
  lightboxDescEl.textContent   = prod.descripcion || "";
  lightboxPrecioEl.textContent = prod.precio ? "$" + fmt(Number(prod.precio)) : "Consultar precio";

  var stockNum = prod.stock != null ? Number(prod.stock) : null;
  if (stockNum !== null) {
    lightboxStockEl.textContent = stockNum > 0 ? "Stock disponible: " + stockNum + " unidades" : "Sin stock";
    lightboxStockEl.style.color = stockNum > 0 ? "" : "#e05a4a";
  } else {
    lightboxStockEl.textContent = "";
  }

  lightboxAddBtn.disabled = (stockNum !== null && stockNum <= 0);
  lightboxAddBtn.textContent = (stockNum !== null && stockNum <= 0) ? "Sin stock" : "Agregar al carrito";

  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
  lightboxCurrentProd = null;
}

/* ── Panel carrito ────────────────────────────────────────── */
cartFloatBtn.addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

/* ── Vaciar carrito ───────────────────────────────────────── */
document.getElementById("btnVaciarCarrito").addEventListener("click", function() {
  if (cart.length === 0) return;
  if (!confirm("¿Vaciar todo el carrito?")) return;
  cart = [];
  renderCart();
  updateBadge();
});

/* ── Agregar al carrito ──────────────────────────────────── */
function addToCart(prod) {
  var existing = cart.find(function(i) {
    return i.id === prod.id;
  });
  if (existing) {
    existing.cantidad++;
  } else {
    cart.push({
      id:       prod.id,
      nombre:   prod.nombre,
      marca:    prod.marca || "",
      precio:   Number(prod.precio) || 0,
      categoria: prod.categoriaNombre || prod.categoria || "",
      cantidad: 1,
    });
  }
  renderCart();
  updateBadge();

  // Micro-feedback
  cartFloatBtn.classList.add("bounce");
  setTimeout(function() { cartFloatBtn.classList.remove("bounce"); }, 500);
}

/* ── Cambiar cantidad ─────────────────────────────────────── */
function changeQty(id, delta) {
  var item = cart.find(function(i) { return i.id === id; });
  if (!item) return;
  item.cantidad = Math.max(1, item.cantidad + delta);
  renderCart();
  updateBadge();
}

/* ── Quitar producto ──────────────────────────────────────── */
function removeFromCart(id) {
  cart = cart.filter(function(i) { return i.id !== id; });
  renderCart();
  updateBadge();
}

/* ── Renderizar carrito ───────────────────────────────────── */
function renderCart() {
  if (cart.length === 0) {
    cartBody.innerHTML = "<p class=\"cart-empty\">Tu carrito está vacío.</p>";
    cartFooter.style.display = "none";
    return;
  }

  cartFooter.style.display = "flex";

  var html = "<ul class=\"cart-list\">";
  cart.forEach(function(item) {
    var subtotal = item.precio > 0 ? "$" + fmt(item.precio * item.cantidad) : "A confirmar";
    var unitario = item.precio > 0 ? "<small>$" + fmt(item.precio) + " c/u</small>" : "";
    html += "<li class=\"cart-item\">";
    html += "<div class=\"cart-item-info\">";
    html += "<span class=\"cart-item-marca\">" + esc(item.marca) + "</span>";
    html += "<strong class=\"cart-item-name\">" + esc(item.nombre) + "</strong>";
    html += "<span class=\"cart-item-cat\">" + esc(item.categoria) + "</span>";
    html += "<span class=\"cart-item-price\">" + subtotal + " " + unitario + "</span>";
    html += "</div>";
    html += "<div class=\"cart-item-controls\">";
    html += "<button class=\"qty-btn\" onclick=\"changeQty('" + item.id + "',-1)\" aria-label=\"Reducir cantidad\">&#8722;</button>";
    html += "<span class=\"qty-num\">" + item.cantidad + "</span>";
    html += "<button class=\"qty-btn\" onclick=\"changeQty('" + item.id + "',1)\" aria-label=\"Aumentar cantidad\">+</button>";
    html += "<button class=\"remove-btn\" onclick=\"removeFromCart('" + item.id + "')\" aria-label=\"Eliminar\">&times;</button>";
    html += "</div>";
    html += "</li>";
  });
  html += "</ul>";
  cartBody.innerHTML = html;

  var total = cart.reduce(function(s, i) { return s + i.precio * i.cantidad; }, 0);
  cartTotalEl.textContent = total > 0 ? "$" + fmt(total) : "A confirmar";
}

/* ── Badge ───────────────────────────────────────────────── */
function updateBadge() {
  var total = cart.reduce(function(s, i) { return s + i.cantidad; }, 0);
  cartBadge.textContent = total;
  cartFloatBtn.classList.toggle("has-items", total > 0);
  if (typeof updateNavBadge === "function") updateNavBadge(total);
}

/* ── Enviar por WhatsApp ─────────────────────────────────── */
document.getElementById("btnEnviarPedido").addEventListener("click", function() {
  if (cart.length === 0) return;

  var nombre = document.getElementById("cartNombre").value.trim();
  var lineas = cart.map(function(i) {
    var precio = i.precio > 0 ? " — $" + fmt(i.precio) + " c/u" : "";
    var marca  = i.marca ? " (" + i.marca + ")" : "";
    return "• " + i.cantidad + "x " + i.nombre + marca + precio;
  });
  var total = cart.reduce(function(s, i) { return s + i.precio * i.cantidad; }, 0);
  var totalStr = total > 0 ? "\n\n*Total estimado: $" + fmt(total) + "*" : "";

  var msg = (nombre ? "Hola, soy *" + nombre + "*!\n" : "Hola!\n") +
    CONFIG.whatsapp.mensajeCarrito + "\n\n" +
    lineas.join("\n") +
    totalStr +
    "\n\nPor favor confirmen disponibilidad y método de pago. ¡Gracias!";

  window.open("https://wa.me/" + CONFIG.whatsapp.numero + "?text=" + encodeURIComponent(msg), "_blank");
});

/* ── Renderizar grilla de productos ──────────────────────── */
document.addEventListener("DOMContentLoaded", function() {
  initProductosGrid();
  // Init nav cart button (independiente de si hay items)
  var navBtn = document.getElementById("navCartBtn");
  if (navBtn) navBtn.addEventListener("click", openCart);
});

var todosProductos = [];

function initProductosGrid() {
  var productos = getProductos();
  todosProductos = productos;

  renderDestacados(productos);

  var grid  = document.getElementById("mainProductosGrid");
  var empty = document.getElementById("productosEmpty");
  if (!grid) return;

  if (!productos || productos.length === 0) {
    if (empty) empty.style.display = "flex";
    return;
  }

  if (empty) empty.style.display = "none";

  buildFiltros(productos);
  populateMarcasSelect(productos);
  renderProductosGrid(productos, grid);
  initSearch(productos, grid);
}

/* ── Sección Destacados ──────────────────────────────────── */
function renderDestacados(productos) {
  var section = document.getElementById("destacados");
  var grid    = document.getElementById("destacadosGrid");
  if (!section || !grid) return;

  var destacados = (productos || []).filter(function(p) { return p.destacado; });

  if (!destacados.length) {
    section.hidden = true;
    grid.innerHTML = "";
    return;
  }

  section.hidden = false;
  renderProductosGrid(destacados, grid);
}

/* ── Filtros por categoría ──────────────────────────────── */
function buildFiltros(todos) {
  var filtros = document.getElementById("prodFiltros");
  if (!filtros) return;

  var cats = [];
  todos.forEach(function(p) {
    if (p.categoriaNombre && cats.indexOf(p.categoriaNombre) === -1) cats.push(p.categoriaNombre);
  });

  if (cats.length < 2) return;

  filtros.innerHTML = "";
  var activo = "todos";

  function crearBtn(label, value, catId) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filtro-btn" + (value === activo ? " active" : "");
    btn.textContent = label;
    if (catId) btn.dataset.cat = catId;

    btn.addEventListener("click", function() {
      activo = value;
      filtros.querySelectorAll(".filtro-btn").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      applyFilters();
    });
    return btn;
  }

  filtros.appendChild(crearBtn("Todos", "todos"));
  cats.forEach(function(cat) {
    var id = todos.find(function(p) { return p.categoriaNombre === cat; })?.categoria || cat;
    filtros.appendChild(crearBtn(cat, cat, id));
  });
}

/* ── Marcas select ──────────────────────────────────────── */
function populateMarcasSelect(todos) {
  var sel = document.getElementById("filterMarca");
  if (!sel) return;

  var marcas = [];
  todos.forEach(function(p) {
    if (p.marca && marcas.indexOf(p.marca) === -1) marcas.push(p.marca);
  });
  marcas.sort();

  marcas.forEach(function(m) {
    var opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });

  sel.addEventListener("change", applyFilters);
  document.getElementById("filterOrden")?.addEventListener("change", applyFilters);
}

/* ── Búsqueda ───────────────────────────────────────────── */
function initSearch(todos, grid) {
  var input = document.getElementById("searchInput");
  var clear = document.getElementById("searchClear");
  if (!input) return;

  input.addEventListener("input", function() {
    clear.hidden = !input.value;
    applyFilters();
  });

  if (clear) {
    clear.addEventListener("click", function() {
      input.value = "";
      clear.hidden = true;
      applyFilters();
      input.focus();
    });
  }
}

/* ── Aplicar filtros, búsqueda y orden ──────────────────── */
function applyFilters() {
  var grid     = document.getElementById("mainProductosGrid");
  var input    = document.getElementById("searchInput");
  var filtros  = document.getElementById("prodFiltros");
  var selMarca = document.getElementById("filterMarca");
  var selOrden = document.getElementById("filterOrden");

  var query    = input ? input.value.trim().toLowerCase() : "";
  var catActiva = filtros?.querySelector(".filtro-btn.active")?.textContent || "Todos";
  var marca    = selMarca ? selMarca.value : "";
  var orden    = selOrden ? selOrden.value : "";

  var filtrados = todosProductos.filter(function(p) {
    var matchCat  = catActiva === "Todos" || p.categoriaNombre === catActiva;
    var matchMarca = !marca || p.marca === marca;
    var matchQuery = !query ||
      (p.nombre || "").toLowerCase().includes(query) ||
      (p.marca  || "").toLowerCase().includes(query) ||
      (p.descripcion || "").toLowerCase().includes(query);
    return matchCat && matchMarca && matchQuery;
  });

  if (orden === "precio-asc")  filtrados.sort(function(a,b) { return a.precio - b.precio; });
  if (orden === "precio-desc") filtrados.sort(function(a,b) { return b.precio - a.precio; });
  if (orden === "nombre-asc")  filtrados.sort(function(a,b) { return (a.nombre||"").localeCompare(b.nombre||""); });

  renderProductosGrid(filtrados, grid);
}

/* ── Renderizar cards de productos ──────────────────────── */
function renderProductosGrid(prods, grid) {
  grid.innerHTML = "";

  if (!prods || prods.length === 0) {
    var empty = document.createElement("div");
    empty.className = "prod-no-results";
    empty.innerHTML = "<strong>Sin resultados</strong><p>Intentá con otro término de búsqueda o categoría.</p>";
    grid.appendChild(empty);
    return;
  }

  prods.forEach(function(prod, idx) {
    var card = buildProductCard(prod, idx);
    grid.appendChild(card);
  });
}

function buildProductCard(prod, idx) {
  var card = document.createElement("article");
  card.className = "prod-card";
  card.style.animationDelay = (idx * 0.06) + "s";

  var stock   = prod.stock != null ? Number(prod.stock) : null;
  var agotado = stock !== null && stock <= 0;

  // Badge HTML
  var badgeHtml = "";
  if (agotado) {
    badgeHtml = "<span class=\"prod-badge prod-badge--agotado\">Sin stock</span>";
  } else if (prod.badge) {
    var badgeClass = "prod-badge";
    if ((prod.badge||"").toLowerCase() === "nuevo") badgeClass += " prod-badge--nuevo";
    if ((prod.badge||"").toLowerCase().includes("oferta")) badgeClass += " prod-badge--oferta";
    badgeHtml = "<span class=\"" + badgeClass + "\">" + esc(prod.badge) + "</span>";
  }

  // Image or placeholder
  var imgHtml = "";
  if (prod.imagen) {
    imgHtml = "<img src=\"" + prod.imagen + "\" alt=\"" + esc(prod.nombre) + "\" loading=\"lazy\" class=\"prod-img\" />";
  } else {
    var catId = prod.categoria || "";
    imgHtml = "<div class=\"prod-placeholder\" data-cat=\"" + esc(catId) + "\">" +
      "<svg class=\"prod-placeholder-svg\" viewBox=\"0 0 64 90\" fill=\"none\">" +
        "<rect x=\"18\" y=\"26\" width=\"28\" height=\"48\" rx=\"5\" fill=\"rgba(201,169,110,0.1)\" stroke=\"rgba(201,169,110,0.35)\" stroke-width=\"1.5\"/>" +
        "<rect x=\"24\" y=\"14\" width=\"16\" height=\"14\" rx=\"3\" fill=\"rgba(201,169,110,0.15)\" stroke=\"rgba(201,169,110,0.4)\" stroke-width=\"1.5\"/>" +
        "<circle cx=\"32\" cy=\"10\" r=\"5\" fill=\"rgba(201,169,110,0.2)\" stroke=\"rgba(201,169,110,0.45)\" stroke-width=\"1.2\"/>" +
        "<rect x=\"23\" y=\"50\" width=\"18\" height=\"16\" rx=\"2\" fill=\"none\" stroke=\"rgba(201,169,110,0.25)\" stroke-width=\"1\"/>" +
        "<line x1=\"27\" y1=\"57\" x2=\"37\" y2=\"57\" stroke=\"rgba(201,169,110,0.3)\" stroke-width=\"0.8\" stroke-linecap=\"round\"/>" +
      "</svg>" +
    "</div>";
  }

  // Price
  var precioHtml = prod.precio
    ? "<span class=\"prod-price\">$" + fmt(Number(prod.precio)) + "</span>"
    : "<span class=\"prod-price-empty\">Consultar</span>";

  // Description
  var descHtml = prod.descripcion
    ? "<p class=\"prod-desc\">" + esc(prod.descripcion) + "</p>"
    : "";

  card.innerHTML =
    "<div class=\"prod-img-wrap\">" +
      badgeHtml +
      imgHtml +
    "</div>" +
    "<div class=\"prod-body\">" +
      (prod.marca ? "<span class=\"prod-marca\">" + esc(prod.marca) + "</span>" : "") +
      "<h3 class=\"prod-name\">" + esc(prod.nombre) + "</h3>" +
      "<span class=\"prod-cat\">" + esc(prod.categoriaNombre || prod.categoria || "") + "</span>" +
      descHtml +
      "<div class=\"prod-footer\">" +
        precioHtml +
        "<button class=\"btn-agregar\" type=\"button\"" + (agotado ? " disabled" : "") + ">" +
          (agotado ? "Sin stock" : "+ Agregar") +
        "</button>" +
      "</div>" +
    "</div>";

  // Click en imagen → lightbox
  var imgWrap = card.querySelector(".prod-img-wrap");
  imgWrap.addEventListener("click", function(e) {
    if (e.target.closest(".btn-agregar")) return;
    openLightbox(prod);
  });
  imgWrap.style.cursor = "pointer";

  // Botón agregar
  var btnAgregar = card.querySelector(".btn-agregar");
  if (!agotado) {
    btnAgregar.addEventListener("click", function(e) {
      e.stopPropagation();
      addToCart(prod);
      openCart();
    });
  }

  return card;
}

/* ── Placeholder style per category ─────────────────────── */
function getPlaceholderStyle(categoria) {
  var gradients = {
    "masculinos":  "background: linear-gradient(160deg, #0f1e36 0%, #050d1a 100%)",
    "femeninos":   "background: linear-gradient(160deg, #2a0f1e 0%, #180a10 100%)",
    "unisex":      "background: linear-gradient(160deg, #0f2226 0%, #051216 100%)",
    "importados":  "background: linear-gradient(160deg, #1a0f30 0%, #0d0518 100%)",
    "arabe":       "background: linear-gradient(160deg, #2a1a06 0%, #180e04 100%)",
    "nicho":       "background: linear-gradient(160deg, #0a1a0a 0%, #050f05 100%)",
    "sets":        "background: linear-gradient(160deg, #1e1a06 0%, #100e04 100%)",
  };
  var base = gradients[categoria] || "background: linear-gradient(160deg, #1a1a1a 0%, #080808 100%)";
  return base + "; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;";
}

/* ── Helpers ─────────────────────────────────────────────── */
function fmt(n) {
  return Number(n).toLocaleString("es-AR");
}

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
