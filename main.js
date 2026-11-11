/* ===== BATMAN PORTFOLIO — lógica ===== */
(function () {
  "use strict";
  try { const g = localStorage.getItem("bp-contenido"); if (g) window.PORTAFOLIO = Object.assign({}, window.PORTAFOLIO, JSON.parse(g)); } catch (e) { localStorage.removeItem("bp-contenido"); }
  let D = window.PORTAFOLIO;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tactil = matchMedia("(pointer: coarse)").matches;

  function el(tag, cls, texto) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function imagen(src, alt, cls) {
    const i = el("img", cls);
    i.src = src; i.alt = alt || ""; i.loading = "lazy";
    i.onerror = () => i.classList.add("sin-imagen");
    return i;
  }

  /* 1. Sonido: opcional, apagado por defecto, solo se activa con clic */
  const SONIDOS = { entrada: "assets/sounds/entrada.mp3", carnet: "assets/sounds/carnet.mp3", cortina: "assets/sounds/cortina.mp3", click: "assets/sounds/click.mp3" };
  let sonidoOn = false;
  let audioUsuario = null;
  function sfx(nombre) {
    if (!sonidoOn) return;
    try { const a = new Audio(SONIDOS[nombre]); a.volume = 0.4; a.play().catch(() => {}); } catch (e) {}
  }
  function iniciarSonido() {
    const b = $("#btn-sonido");
    b.addEventListener("click", () => {
      sonidoOn = !sonidoOn;
      b.textContent = sonidoOn ? T("sonido_on") : T("sonido_off");
      b.setAttribute("aria-pressed", String(sonidoOn));
      sfx("click");
      if (audioUsuario) { if (sonidoOn) audioUsuario.play().catch(() => {}); else audioUsuario.pause(); }
    });
  }

  /* 2. Contenido: se llena desde datos.js */
  function renderCarnet() {
    const I = D.identidad;
    $("#carnet-foto").replaceChildren(imagen(I.foto, "Fotografía del carnet"));
    $("#carnet-numero").textContent = I.numero;
    $("#carnet-nombre").textContent = I.nombre;
    $("#carnet-condicion").textContent = I.condicion;
    $("#carnet-especialidad").textContent = I.especialidad;
    $("#carnet-descripcion").textContent = I.descripcion;
    $("#carnet-disponible").textContent = D.disponible === false ? T("disp_no") : T("disp_si");
    const extras = [];
    if (I.ciudad) extras.push("Ciudad: " + I.ciudad);
    if (I.edad) extras.push("Edad: " + I.edad);
    extras.push(I.estudiante ? "Estudiante: sí" + (I.institucion ? " · " + I.institucion : "") : "Estudiante: no");
    $("#carnet-datos").replaceChildren(...extras.concat(I.datos || []).map((t) => el("li", null, t)));
  }
  function renderSobreMi() {
    const S = D.sobreMi;
    const bloques = [["Perfil profesional", S.perfil], ["Formación", S.formacion], ["Especialidad", D.identidad.especialidad], ["Descripción personal", S.descripcion], ["Objetivos profesionales", S.objetivos]];
    $("#sobre-contenido").replaceChildren(
      el("div", "sobre__texto", null)
    );
    const texto = $("#sobre-contenido .sobre__texto");
    texto.append(el("h2", "titulo-seccion", S.titulo));
    bloques.forEach(([t, x]) => { const b = el("div", "bloque"); b.append(el("h3", null, t), el("p", null, x)); texto.append(b); });
  }
  function renderHabilidades() {
    const orden = ["Frontend", "Backend", "Bases de datos", "Herramientas", "Otros conocimientos"];
    const cont = $("#habilidades-contenido");
    orden.forEach((cat) => {
      const items = D.habilidades.filter((h) => h.categoria === cat);
      if (!items.length) return;
      const grupo = el("div", "grupo"); grupo.append(el("h3", null, cat));
      const grid = el("div", "grid-habilidades");
      items.forEach((h) => {
        const c = el("article", "habilidad");
        c.append(el("span", "habilidad__icono", h.icono || "◆"), el("h4", null, h.nombre), el("p", null, h.descripcion));
        if (typeof h.nivel === "number") {
          const b = el("div", "barra"); b.style.setProperty("--nivel", Math.max(0, Math.min(100, h.nivel)) + "%"); c.append(b);
        }
        grid.append(c);
      });
      grupo.append(grid); cont.append(grupo);
    });
  }
  function renderProyectos() {
    const cont = $("#proyectos-galeria");
    D.proyectos.forEach((p, i) => {
      if (p.visible === false) return;
      const card = el("article", "proyecto");
      const cuerpo = el("div", "proyecto__cuerpo");
      const btn = el("button", "boton", T("ver_proyecto"));
      btn.type = "button";
      btn.addEventListener("click", () => abrirProyecto(i));
      const meta = [p.categoria, p.estado, p.fecha].filter(Boolean).join(" · ");
      const enlaces = el("div", "proyecto__enlaces"); enlaces.append(btn);
      if (p.url && p.url !== "#") { const v = el("a", "boton", T("visitar")); v.href = p.url; v.target = "_blank"; v.rel = "noopener"; enlaces.append(v); }
      cuerpo.append(el("p", "proyecto__meta", meta), el("h3", null, p.nombre), el("p", null, p.descripcion), enlaces);
      card.append(imagen(p.portada, p.nombre), cuerpo);
      cont.append(card);
    });
  }
  function renderContacto() {
    const C = D.contacto;
    $("#c-correo").href = "mailto:" + C.correo;
    $("#c-github").href = C.github;
    $("#c-linkedin").href = C.linkedin;
    $("#c-instagram").href = C.instagram;
    const wa = waNumero();
    const wlink = $("#c-whatsapp");
    wlink.href = wa ? "https://wa.me/" + wa : "#";
  }

  /* 3. Carnet: se inclina, se arrastra, y al soltarlo da un salto y oscila hasta quedar quieto */
  function iniciarCarnet() {
    const zona = $("#carnet-zona"), carnet = $("#carnet");
    if (!zona || !carnet) return;
    const st = { rx: 0, ry: 0, dx: 0, dy: 0, sx: 1, sy: 1, arrastrando: false, x0: 0, y0: 0, ultX: 0, ultY: 0, vX: 0, vY: 0 };
    const sp = { x: 0, y: 0, vx: 0, vy: 0 };
    let raf = null;
    const pintar = (conRebote) => {
      carnet.style.transition = conRebote ? "transform .5s ease-out" : "none";
      carnet.style.transform = `translate(${st.dx}px, ${st.dy}px) scale(${st.sx}, ${st.sy}) rotateY(${st.ry}deg) rotateX(${st.rx}deg)`;
    };
    const resorte = () => {
      sp.vx = sp.vx * 0.93 - 0.12 * sp.x; sp.x += sp.vx;
      sp.vy = sp.vy * 0.93 - 0.12 * sp.y; sp.y += sp.vy;
      st.dx = sp.x; st.dy = sp.y;
      const est = Math.min(Math.abs(sp.vy) / 80, 0.08);
      st.sy = 1 + est; st.sx = 1 - est / 2;
      pintar(false);
      const quieto = Math.abs(sp.x) < 0.3 && Math.abs(sp.y) < 0.3 && Math.abs(sp.vx) < 0.3 && Math.abs(sp.vy) < 0.3;
      if (quieto) { raf = null; st.dx = 0; st.dy = 0; st.sx = 1; st.sy = 1; pintar(false); }
      else raf = requestAnimationFrame(resorte);
    };
    if (!reduce && !tactil) {
      zona.addEventListener("pointermove", (e) => {
        if (st.arrastrando) return;
        const r = zona.getBoundingClientRect();
        st.ry = ((e.clientX - r.left) / r.width - 0.5) * 18;
        st.rx = -((e.clientY - r.top) / r.height - 0.5) * 14;
        pintar(false);
      });
      zona.addEventListener("pointerleave", () => { if (!st.arrastrando) { st.rx = 0; st.ry = 0; pintar(true); } });
    }
    carnet.addEventListener("pointerdown", (e) => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      st.arrastrando = true;
      st.x0 = e.clientX - st.dx; st.y0 = e.clientY - st.dy;
      st.ultX = e.clientX; st.ultY = e.clientY; st.vX = 0; st.vY = 0;
      carnet.setPointerCapture(e.pointerId);
      carnet.classList.add("arrastrando");
      pintar(false);
    });
    carnet.addEventListener("pointermove", (e) => {
      if (!st.arrastrando) return;
      st.vX = e.clientX - st.ultX; st.vY = e.clientY - st.ultY;
      st.ultX = e.clientX; st.ultY = e.clientY;
      st.dx = (e.clientX - st.x0) * 0.6; st.dy = (e.clientY - st.y0) * 0.6;
      st.sx = 1 + Math.min(Math.abs(st.dx) / 900, 0.08);
      st.sy = 1 + Math.min(Math.abs(st.dy) / 900, 0.08);
      pintar(false);
    });
    const soltar = () => {
      if (!st.arrastrando) return;
      st.arrastrando = false;
      carnet.classList.remove("arrastrando");
      if (reduce) { st.dx = 0; st.dy = 0; st.sx = 1; st.sy = 1; pintar(true); return; }
      sp.x = st.dx; sp.y = st.dy;
      sp.vx = st.vX * 0.5;
      sp.vy = st.vY * 0.5 - 9;
      if (!raf) raf = requestAnimationFrame(resorte);
    };
    carnet.addEventListener("pointerup", soltar);
    carnet.addEventListener("pointercancel", soltar);
  }

  /* 4. Máscara: sigue el cursor o el dedo con suavidad */
  function iniciarMascara() {
    const visor = $("#visor");
    if (!visor) return;
    const st = { x: 50, y: 50, r: 0, tx: 50, ty: 50, tr: 0 };
    let frame = null;
    const RADIO = tactil ? 120 : 110;
    function posicion(e) {
      const r = visor.getBoundingClientRect();
      st.tx = ((e.clientX - r.left) / r.width) * 100;
      st.ty = ((e.clientY - r.top) / r.height) * 100;
    }
    function animar() {
      const k = reduce ? 1 : 0.18;
      st.x += (st.tx - st.x) * k; st.y += (st.ty - st.y) * k; st.r += (st.tr - st.r) * (reduce ? 1 : 0.15);
      visor.style.setProperty("--x", st.x + "%");
      visor.style.setProperty("--y", st.y + "%");
      visor.style.setProperty("--radio", st.r + "px");
      const quieto = Math.abs(st.tx - st.x) < 0.1 && Math.abs(st.ty - st.y) < 0.1 && Math.abs(st.tr - st.r) < 0.5;
      frame = quieto ? null : requestAnimationFrame(animar);
    }
    const pedir = () => { if (!frame) frame = requestAnimationFrame(animar); };
    visor.addEventListener("pointerenter", (e) => { posicion(e); st.x = st.tx; st.y = st.ty; st.tr = RADIO; pedir(); });
    visor.addEventListener("pointermove", (e) => { posicion(e); st.tr = RADIO; pedir(); });
    visor.addEventListener("pointerdown", (e) => { posicion(e); st.tr = RADIO; pedir(); });
    const apagar = () => { st.tr = 0; pedir(); };
    visor.addEventListener("pointerleave", apagar);
    visor.addEventListener("pointercancel", apagar);
  }

  /* 5. Cortinas y detalle del proyecto */
  const cortinas = $("#cortinas"), detalle = $("#detalle-contenido");
  let cierre = null;
  function bloque(titulo, contenido) {
    const d = el("section"); d.append(el("h3", null, titulo));
    if (typeof contenido === "string") d.append(el("p", null, contenido));
    else d.append(contenido);
    return d;
  }
  function lista(items) { const u = el("ul"); items.forEach((t) => u.append(el("li", null, t))); return u; }
  function chips(items) { const c = el("div", "chips"); items.forEach((t) => c.append(el("span", "chip", t))); return c; }
  function construirDetalle(p) {
    const wrap = el("div", "detalle-inner");
    wrap.append(el("h2", null, p.nombre), el("p", null, p.categoria + " · " + p.estado));
    wrap.append(bloque("Descripción completa", p.descripcionCompleta));
    wrap.append(bloque("Problema que resuelve", p.problema));
    wrap.append(bloque("Para qué sirve", p.utilidad));
    wrap.append(bloque("Tecnologías utilizadas", chips(p.tecnologias)));
    wrap.append(bloque("Lenguajes de programación", chips(p.lenguajes)));
    wrap.append(bloque("Características principales", lista(p.caracteristicas)));
    wrap.append(bloque("Estructura del proyecto", (() => { const pre = el("pre"); pre.textContent = p.estructura; return pre; })()));
    const caps = el("div", "capturas");
    if (!p.ocultarCapturas) (p.capturas || []).slice(0, 6).forEach((s) => caps.append(imagen(s, "Captura de " + p.nombre)));
    wrap.append(bloque("Capturas de pantalla", caps));
    const enlaces = el("div", "enlaces");
    const a1 = el("a", "boton", "Ver página publicada"); a1.href = p.url; a1.target = "_blank"; a1.rel = "noopener";
    const a2 = el("a", "boton", "GitHub"); a2.href = p.github; a2.target = "_blank"; a2.rel = "noopener";
    enlaces.append(a1, a2); wrap.append(enlaces);
    return wrap;
  }
  function abrirProyecto(i) {
    clearTimeout(cierre);
    const p = D.proyectos[i];
    detalle.replaceChildren(construirDetalle(p));
    cortinas.hidden = false;
    cortinas.classList.remove("revelado", "abierta");
    void cortinas.offsetWidth;
    cortinas.classList.add("abierta");
    sfx("cortina");
    document.body.style.overflow = "hidden";
    setTimeout(() => cortinas.classList.add("revelado"), reduce ? 0 : 900);
    $("#cerrar-detalle").focus();
  }
  function cerrarProyecto() {
    cortinas.classList.remove("revelado");
    cortinas.classList.remove("abierta");
    sfx("cortina");
    cierre = setTimeout(() => { cortinas.hidden = true; document.body.style.overflow = ""; }, reduce ? 0 : 1200);
  }
  function iniciarCortinas() {
    $("#cerrar-detalle").addEventListener("click", cerrarProyecto);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !cortinas.hidden) cerrarProyecto(); });
  }

  /* 6. Animaciones de scroll: aparición y parallax */
  function iniciarScroll() {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
    }, { threshold: 0.15 });
    $$(".reveal").forEach((n) => (reduce ? n.classList.add("visible") : obs.observe(n)));
    const par = $$("[data-velocidad]");
    if (reduce || !par.length) return;
    let pendiente = false;
    function aplicar() {
      const y = window.scrollY;
      par.forEach((n) => { n.style.transform = `translate3d(0, ${-y * (parseFloat(n.dataset.velocidad) || 0.1)}px, 0)`; });
      pendiente = false;
    }
    window.addEventListener("scroll", () => { if (!pendiente) { pendiente = true; requestAnimationFrame(aplicar); } }, { passive: true });
  }

  /* 7. Partículas */
  function crearParticulas() {
    const cont = $("#particulas");
    if (reduce) return;
    for (let i = 0; i < 28; i++) {
      const p = el("span", "particula");
      p.style.left = Math.random() * 100 + "%";
      p.style.top = 60 + Math.random() * 40 + "%";
      p.style.animationDuration = 8 + Math.random() * 10 + "s";
      p.style.animationDelay = -Math.random() * 15 + "s";
      p.style.opacity = String(0.3 + Math.random() * 0.5);
      cont.append(p);
    }
  }

  /* 8. Mensajes que se escriben al llegar al cierre */
  function iniciarMensajes() {
    const nodos = $$(".mensaje[data-typing]");
    if (!nodos.length) return;
    if (reduce || !("IntersectionObserver" in window)) { nodos.forEach((n) => (n.textContent = n.dataset.typing)); return; }
    function escribir(n, alTerminar) {
      const texto = n.dataset.typing;
      let i = 0;
      n.classList.add("cursor");
      const id = setInterval(() => {
        i++;
        n.textContent = texto.slice(0, i);
        if (i >= texto.length) {
          clearInterval(id);
          n.classList.remove("cursor");
          if (alTerminar) alTerminar();
        }
      }, 55);
    }
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        obs.disconnect();
        escribir(nodos[0], () => setTimeout(() => escribir(nodos[1]), 600));
      });
    }, { threshold: 0.6 });
    obs.observe($("#cierre"));
  }

  /* 12. Servicios, certificaciones, presupuesto y contador */
  function waNumero() { return String((D.contacto && D.contacto.whatsapp) || "").replace(/\D/g, ""); }
  function renderServicios() {
    const c = $("#servicios-lista"); c.replaceChildren();
    (D.servicios || []).forEach((s) => {
      const t = el("article", "tarjeta");
      t.append(el("span", "habilidad__icono", s.icono || "◆"), el("h3", null, s.nombre), el("p", null, s.detalle), el("p", "tarjeta__meta", T("tiempo") + " " + (s.tiempo || "a convenir")));
      c.append(t);
    });
  }
  function renderCertificados() {
    const c = $("#certificados-lista"); c.replaceChildren();
    (D.certificados || []).filter((x) => x.visible !== false).forEach((x) => {
      const t = el("article", "tarjeta");
      if (x.imagen) t.append(imagen(x.imagen, "Certificado: " + x.nombre));
      t.append(el("h3", null, x.nombre), el("p", null, x.emisor), el("p", "tarjeta__meta", x.fecha || ""));
      if (x.enlace && x.enlace !== "#") { const a = el("a", "boton", T("ver_cert")); a.href = x.enlace; a.target = "_blank"; a.rel = "noopener"; t.append(a); }
      c.append(t);
    });
  }
  function renderPresupuesto() {
    const P = D.presupuesto || { opciones: [], plazos: [] };
    const fs = $("#pres-opciones"); fs.replaceChildren(el("legend", "pequeno", T("que_necesitas")));
    P.opciones.forEach((o, i) => {
      const lbl = el("label"); const chk = el("input"); chk.type = "checkbox"; chk.value = o; chk.name = "opcion"; chk.id = "op" + i;
      lbl.append(chk, document.createTextNode(o)); fs.append(lbl);
    });
    const sel = $("#pres-plazo"); sel.replaceChildren(...P.plazos.map((p) => el("option", null, p)));
  }
  function enviarPresupuesto() {
    const elegidos = Array.from(document.querySelectorAll('#pres-opciones input[name="opcion"]:checked')).map((i) => i.value);
    if (!elegidos.length) { alert("Elige al menos una opción."); return; }
    const plazo = $("#pres-plazo").value;
    const nombre = $("#pres-nombre").value.trim();
    const mensaje = $("#pres-mensaje").value.trim();
    const texto = "Hola, quiero solicitar un presupuesto.\n" +
      "Servicios: " + elegidos.join(", ") + "\n" +
      "Plazo: " + plazo + "\n" +
      (nombre ? "Nombre: " + nombre + "\n" : "") +
      (mensaje ? "Mensaje: " + mensaje : "");
    const wa = waNumero();
    if (!wa) { alert("Este portafolio aún no tiene número de WhatsApp configurado."); return; }
    window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
  }
  function iniciarPresupuesto() {
    const b = $("#pres-enviar");
    if (b) b.addEventListener("click", enviarPresupuesto);
  }
  function renderContador() {
    const z = $("#contador-zona"), num = $("#contador-num");
    if (!z || !num) return;
    const C = D.clientes || { valor: 0, visible: false };
    z.hidden = !C.visible;
    if (!C.visible) return;
    const destino = Math.max(0, Math.round(Number(C.valor) || 0));
    if (reduce) { num.textContent = String(destino); return; }
    num.textContent = "0";
    const obs = new IntersectionObserver((en) => {
      if (!en.some((e) => e.isIntersecting)) return;
      obs.disconnect();
      const t0 = performance.now(), dur = 2200;
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        num.textContent = String(Math.round(destino * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    }, { threshold: 0.5 });
    obs.observe(z);
  }

  /* Textos y fotos editables de capítulo, pie, canal e invitación */
  function renderTextos() {
    const C = D.capitulo || {};
    $("#cap-num").textContent = C.numero || "";
    $("#cap-l1").textContent = C.linea1 || "";
    $("#cap-l2").textContent = C.linea2 || "";
    $("#cap-texto").textContent = C.texto || "";
    const base = $("#retrato-base");
    const fb = C.fotoBase || (D.identidad && D.identidad.foto) || "";
    if (base) { if (fb) base.src = fb; else base.removeAttribute("src"); }
    const velo = $("#retrato-velo");
    if (velo) { if (C.fotoVelo) { velo.src = C.fotoVelo; velo.style.display = ""; } else { velo.removeAttribute("src"); velo.style.display = "none"; } }
    $("#pie-texto").textContent = D.pie || "";
    const K = D.canal || {};
    $("#canal-titulo").textContent = K.titulo || "";
    $("#canal-texto").textContent = K.texto || "";
    const mapa = { correo: "#c-correo", whatsapp: "#c-whatsapp", github: "#c-github", linkedin: "#c-linkedin", instagram: "#c-instagram" };
    Object.keys(mapa).forEach((k) => { const e = $(mapa[k]); if (e) e.hidden = K[k] === false; });
    const I = D.invitacion || {};
    const sec = $("#invitacion");
    if (sec) sec.hidden = I.activa === false;
    $("#inv-titulo").textContent = I.titulo || "";
    $("#inv-texto").textContent = I.texto || "";
    const ib = $("#inv-boton");
    ib.textContent = I.boton || ""; ib.href = I.enlace || "#";
  }

  /* Recargar todo el contenido (lo usa el panel al guardar) */
  function recargarTodo(nuevo) {
    D = nuevo; window.PORTAFOLIO = nuevo;
    $("#habilidades-contenido").replaceChildren();
    $("#proyectos-galeria").replaceChildren();
    const rb = $("#retrato-base");
    if (rb) { if (D.identidad.foto) rb.src = D.identidad.foto; else rb.removeAttribute("src"); }
    [renderCarnet, renderSobreMi, renderHabilidades, renderProyectos, renderContacto, renderServicios, renderCertificados, renderPresupuesto, renderContador, renderTextos].forEach((f) => {
      try { f(); } catch (e) { console.error("Error al mostrar contenido:", e); }
    });
  }
  window.bpRecargarContenido = recargarTodo;

  /* 9. Revelación del retrato: GSAP y Lenis (si cargan); si no, la página funciona igual */
  function iniciarRevelacion() {
    const retrato = $("#retrato");
    if (!retrato) return;
    const gs = window.gsap;
    const RADIO = 110;
    let qx, qy, qr;
    if (gs && gs.quickTo) {
      qx = gs.quickTo(retrato, "--x", { duration: 0.6, ease: "power3.out" });
      qy = gs.quickTo(retrato, "--y", { duration: 0.6, ease: "power3.out" });
      qr = gs.quickTo(retrato, "--r", { duration: 0.45, ease: "power2.out" });
    } else {
      qx = (v) => retrato.style.setProperty("--x", String(v));
      qy = (v) => retrato.style.setProperty("--y", String(v));
      qr = (v) => retrato.style.setProperty("--r", String(v));
    }
    const mover = (e) => { const r = retrato.getBoundingClientRect(); qx(e.clientX - r.left); qy(e.clientY - r.top); qr(RADIO); };
    retrato.addEventListener("pointerenter", mover);
    retrato.addEventListener("pointermove", mover);
    retrato.addEventListener("pointerdown", mover);
    const apagar = () => qr(0);
    retrato.addEventListener("pointerleave", apagar);
    retrato.addEventListener("pointercancel", apagar);

    const lineas = $$(".linea > span");
    const texto = $(".historia__texto");
    const animar = () => {
      if (!gs || reduce) return;
      gs.fromTo(lineas, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.15, ease: "power4.out" });
      if (texto) gs.fromTo(texto, { opacity: 0 }, { opacity: 1, duration: 1.4, delay: 0.6 });
    };
    const obs = new IntersectionObserver((en) => {
      if (en.some((e) => e.isIntersecting)) { obs.disconnect(); animar(); }
    }, { threshold: 0.3 });
    obs.observe($("#revelacion"));
  }

  /* 10. Desplazamiento suave con Lenis (si carga y no hay movimiento reducido) */
  function iniciarSuave() {
    if (reduce || !window.Lenis) return;
    const lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true });
    const bucle = (t) => { lenis.raf(t); requestAnimationFrame(bucle); };
    requestAnimationFrame(bucle);
  }

  /* 11. Audio del portafolio: guarda la pista de sonido (de audio o de video) en IndexedDB */
  function abrirDB() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("bp-media", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("media");
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  function transaccion(modo, fn) {
    return abrirDB().then((db) => new Promise((res, rej) => {
      const t = db.transaction("media", modo);
      const peticion = fn(t.objectStore("media"));
      t.oncomplete = () => res(peticion.result);
      t.onerror = () => rej(t.error);
    }));
  }
  function cargarAudio() {
    return transaccion("readonly", (s) => s.get("audio")).then((blob) => {
      if (audioUsuario) audioUsuario.pause();
      audioUsuario = null;
      if (!blob) return;
      audioUsuario = new Audio(URL.createObjectURL(blob));
      audioUsuario.loop = true;
      audioUsuario.volume = 0.5;
      if (sonidoOn) audioUsuario.play().catch(() => {});
    }).catch(() => {});
  }
  window.bpMedia = {
    guardar: (archivo) => transaccion("readwrite", (s) => s.put(archivo, "audio")).then(cargarAudio),
    borrar: () => transaccion("readwrite", (s) => s.delete("audio")).then(cargarAudio),
  };

  /* 13. Idioma: español / inglés (textos fijos y botones) */
  let idioma = (function () { try { return localStorage.getItem("bp-idioma") || "es"; } catch (e) { return "es"; } })();
  const I18N = {
    es: { nav_serv: "Servicios", nav_pres: "Presupuesto", nav_proy: "Proyectos", nav_hab: "Habilidades", nav_sobre: "Sobre mí", nav_cont: "Contacto",
      h_habilidades: "Habilidades", h_proyectos: "Proyectos", h_servicios: "Servicios", h_certificados: "Certificaciones",
      h_presupuesto: "Solicita tu presupuesto", p_presupuesto: "Elige lo que necesitas, el plazo y envíalo directo por WhatsApp.",
      p_clientes: "clientes satisfechos", acceso: "Acceso restringido", titulo: "PORTAFOLIO", ident: "Identificación",
      enviar: "Enviar por WhatsApp", acceso_btn: "Acceso", volver: "← Volver a la galería", ver_proyecto: "VER PROYECTO",
      visitar: "Visitar", ver_cert: "Ver certificado", tiempo: "Tiempo:", disp_si: "● Disponible", disp_no: "○ No disponible",
      ver_pagina: "Ver página publicada", que_necesitas: "¿Qué necesitas?", sonido_on: "Sonido: encendido", sonido_off: "Sonido: apagado" },
    en: { nav_serv: "Services", nav_pres: "Quote", nav_proy: "Projects", nav_hab: "Skills", nav_sobre: "About", nav_cont: "Contact",
      h_habilidades: "Skills", h_proyectos: "Projects", h_servicios: "Services", h_certificados: "Certifications",
      h_presupuesto: "Request a quote", p_presupuesto: "Choose what you need, the timeframe, and send it straight to WhatsApp.",
      p_clientes: "satisfied clients", acceso: "Restricted access", titulo: "PORTFOLIO", ident: "Identification",
      enviar: "Send via WhatsApp", acceso_btn: "Access", volver: "← Back to gallery", ver_proyecto: "VIEW PROJECT",
      visitar: "Visit", ver_cert: "View certificate", tiempo: "Time:", disp_si: "● Available", disp_no: "○ Not available",
      ver_pagina: "View live site", que_necesitas: "What do you need?", sonido_on: "Sound: on", sonido_off: "Sound: off" }
  };
  function T(k) { return I18N[idioma][k] || I18N.es[k] || k; }
  const MAPA_TEXTOS = [
    [".nav__links a[href='#sobre-mi']", "nav_sobre"], [".nav__links a[href='#habilidades']", "nav_hab"],
    [".nav__links a[href='#proyectos']", "nav_proy"], [".nav__links a[href='#servicios']", "nav_serv"],
    [".nav__links a[href='#presupuesto']", "nav_pres"], [".nav__links a[href='#contacto']", "nav_cont"],
    ["#habilidades > .titulo-seccion", "h_habilidades"], ["#proyectos > .titulo-seccion", "h_proyectos"],
    ["#servicios > .titulo-seccion", "h_servicios"], ["#certificados > .titulo-seccion", "h_certificados"],
    ["#presupuesto > .titulo-seccion", "h_presupuesto"], ["#presupuesto > .texto-suave", "p_presupuesto"],
    ["#contador-zona .texto-suave", "p_clientes"], [".escena .codigo", "acceso"], [".escena__titulo", "titulo"],
    [".carnet__cabecera span:first-child", "ident"], ["#pres-enviar", "enviar"], ["#btn-panel", "acceso_btn"], ["#cerrar-detalle", "volver"]
  ];
  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    MAPA_TEXTOS.forEach(([sel, key]) => { const e = document.querySelector(sel); if (e) e.textContent = T(key); });
    const bi = $("#btn-idioma"); if (bi) bi.textContent = idioma === "es" ? "EN" : "ES";
    const bs = $("#btn-sonido"); if (bs) bs.textContent = sonidoOn ? T("sonido_on") : T("sonido_off");
  }
  function iniciarIdioma() {
    const b = $("#btn-idioma");
    if (b) b.addEventListener("click", () => {
      idioma = idioma === "es" ? "en" : "es";
      try { localStorage.setItem("bp-idioma", idioma); } catch (e) {}
      aplicarIdioma(); recargarTodo(D);
    });
    aplicarIdioma();
  }

  /* Arranque */
  recargarTodo(D);
  iniciarSonido(); iniciarCarnet(); iniciarMascara(); iniciarCortinas(); iniciarScroll(); crearParticulas(); iniciarMensajes();
  iniciarRevelacion(); iniciarSuave(); cargarAudio(); iniciarPresupuesto(); iniciarIdioma();
})();
